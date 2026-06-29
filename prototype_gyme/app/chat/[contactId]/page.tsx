"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Send, ArrowLeft, Circle, Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import * as signalR from "@microsoft/signalr"

// ============================================================================
// Types
// ============================================================================

interface Message {
  id: string
  senderId: string
  content: string
  sentAt: string
  status?: "sending" | "failed" // only set for optimistic, locally-sent messages
}

interface ConversationMessage {
  senderId: string
  message: string
  sentAt: string
}

interface ChatAccessResponse {
  canChat: boolean
  hasPremiumAccess: boolean
  message: string
}

interface WorkoutProgramSummary {
  programName: string
  currentWeek: number
  totalWeeks: number
}

interface CoachContact {
  coachId: string
  coachName: string
  coachAvatarUrl: string | null
  specialization: string | null
  activeWorkoutProgram: WorkoutProgramSummary | null
}

interface TraineeContact {
  traineeId: string
  traineeName: string
  traineeAvatarUrl: string | null
  currentWorkoutProgram: WorkoutProgramSummary | null
}

type ContactsResponse =
  | { role: "Trainee"; coaches: CoachContact[] }
  | { role: "Coach"; trainees: TraineeContact[] }

interface PartnerInfo {
  id: string
  name: string
  avatarUrl: string | null
  meta: string | null // specialization or program name
}

// ============================================================================
// Config
// ============================================================================

const API_BASE_URL = "https://fitzone-16.runasp.net"
const HUB_URL = `${API_BASE_URL}/chatHub`

function getToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token") ?? localStorage.getItem("accessToken")
}

function getCurrentUserId(): string | null {
  const token = getToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return (
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ??
      payload.nameid ??
      payload.sub ??
      null
    )
  } catch {
    return null
  }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatDayLabel(iso: string) {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  if (sameDay(date, today)) return "Today"
  if (sameDay(date, yesterday)) return "Yesterday"
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")
}

function resolveAvatar(url: string | null) {
  if (!url) return null
  return url.startsWith("http") ? url : `${API_BASE_URL}/${url}`
}

// ============================================================================
// Singleton SignalR connection — shared across the app so navigating
// between conversations doesn't open duplicate sockets.
// ============================================================================

let connectionInstance: signalR.HubConnection | null = null

function getChatConnection(): signalR.HubConnection {
  if (connectionInstance) return connectionInstance

  connectionInstance = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, { accessTokenFactory: () => getToken() ?? "" })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Warning)
    .build()

  return connectionInstance
}

// ============================================================================
// Page
// ============================================================================

export default function ChatPage({ params }: { params: { contactId: string } }) {
  const receiverId = params.contactId
  const router = useRouter()

  const [messages, setMessages] = useState<Message[]>([])
  const [partner, setPartner] = useState<PartnerInfo | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [connectionState, setConnectionState] = useState<
    "connecting" | "connected" | "reconnecting" | "disconnected"
  >("connecting")
  const [accessError, setAccessError] = useState<string | null>(null)
  const [avatarFailed, setAvatarFailed] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const currentUserId = useRef<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    currentUserId.current = getCurrentUserId()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  // --------------------------------------------------------------------
  // 1) Resolve who we're chatting with from the contacts list, in parallel
  //    with checking access + loading history.
  // --------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false

    async function loadPartner() {
      try {
        const token = getToken()
        const res = await fetch(`${API_BASE_URL}/api/Chat/contacts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (!res.ok) return
        const data: ContactsResponse = await res.json()
        if (cancelled) return

        if (data.role === "Trainee") {
          const coach = data.coaches.find((c) => c.coachId === receiverId)
          if (coach) {
            setAvatarFailed(false)
            setPartner({
              id: coach.coachId,
              name: coach.coachName,
              avatarUrl: resolveAvatar(coach.coachAvatarUrl),
              meta: coach.specialization,
            })
          }
        } else {
          const trainee = data.trainees.find((t) => t.traineeId === receiverId)
          if (trainee) {
            setAvatarFailed(false)
            setPartner({
              id: trainee.traineeId,
              name: trainee.traineeName,
              avatarUrl: resolveAvatar(trainee.traineeAvatarUrl),
              meta: trainee.currentWorkoutProgram?.programName ?? null,
            })
          }
        }
      } catch {
        // Non-fatal — chat still works, header just falls back to a generic label.
      }
    }

    loadPartner()
    return () => {
      cancelled = true
    }
  }, [receiverId])

  // --------------------------------------------------------------------
  // 2) Check chat access, then load history
  // --------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false

    async function init() {
      setIsLoadingHistory(true)
      setAccessError(null)

      try {
        const token = getToken()
        if (!token) {
          setAccessError("Please sign in to open this conversation.")
          setIsLoadingHistory(false)
          return
        }

        const accessRes = await fetch(`${API_BASE_URL}/api/Chat/access/${receiverId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!accessRes.ok) throw new Error("Couldn't verify access to this chat.")

        const access: ChatAccessResponse = await accessRes.json()
        if (cancelled) return

        if (!access.canChat) {
          setAccessError(access.message || "You don't have access to this conversation.")
          setIsLoadingHistory(false)
          return
        }

        const convRes = await fetch(`${API_BASE_URL}/api/Chat/conversation/${receiverId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!convRes.ok) throw new Error("Couldn't load the conversation history.")

        const history: ConversationMessage[] = await convRes.json()
        if (cancelled) return

        setMessages(
          history.map((m, idx) => ({
            id: `h-${m.sentAt}-${idx}`,
            senderId: m.senderId,
            content: m.message,
            sentAt: m.sentAt,
          }))
        )
      } catch (err) {
        if (!cancelled) {
          setAccessError(err instanceof Error ? err.message : "Something went wrong loading the chat.")
        }
      } finally {
        if (!cancelled) setIsLoadingHistory(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [receiverId])

  // --------------------------------------------------------------------
  // 3) SignalR connection lifecycle + incoming messages
  // --------------------------------------------------------------------
  const handleReceiveMessage = useCallback(
    (senderId: string, message: string) => {
      setMessages((prev) => {
        // The hub echoes our own sent messages back via ReceiveMessage.
        // If we have a pending optimistic message with the same content
        // from us, resolve it instead of adding a duplicate.
        if (senderId === currentUserId.current) {
          const pendingIdx = prev.findIndex((m) => m.status === "sending" && m.content === message)
          if (pendingIdx !== -1) {
            const next = [...prev]
            next[pendingIdx] = { ...next[pendingIdx], status: undefined }
            return next
          }
        }
        return [
          ...prev,
          {
            id: `r-${Date.now()}-${Math.random()}`,
            senderId,
            content: message,
            sentAt: new Date().toISOString(),
          },
        ]
      })
    },
    []
  )

  // Tracks the connection attempt so a stuck "Connecting" state can be retried.
  const [connectAttempt, setConnectAttempt] = useState(0)
  const [connectErrorDetail, setConnectErrorDetail] = useState<string | null>(null)

  useEffect(() => {
    const connection = getChatConnection()

    connection.off("ReceiveMessage")
    connection.on("ReceiveMessage", handleReceiveMessage)

    connection.onreconnecting(() => setConnectionState("reconnecting"))
    connection.onreconnected(() => setConnectionState("connected"))
    connection.onclose(() => setConnectionState("disconnected"))

    let timedOut = false
    // Safety net: if start() never resolves or rejects within 10s
    // (e.g. it hangs on negotiate), stop showing "connecting" forever.
    const timeoutId = setTimeout(() => {
      timedOut = true
      setConnectionState((prev) => (prev === "connecting" ? "disconnected" : prev))
      setConnectErrorDetail("Connection timed out. Check your network and try again.")
    }, 10000)

    function attemptStart() {
      setConnectionState("connecting")
      setConnectErrorDetail(null)
      connection
        .start()
        .then(() => {
          if (timedOut) return // already gave up; ignore late success
          clearTimeout(timeoutId)
          setConnectionState("connected")
        })
        .catch((err) => {
          clearTimeout(timeoutId)
          console.error("SignalR connection failed:", err)
          setConnectionState("disconnected")
          setConnectErrorDetail(
            err instanceof Error ? err.message : "Couldn't connect to the chat server."
          )
        })
    }

    // Handle every possible starting state, not just "Disconnected" —
    // a stale Connecting/Reconnecting state from a previous mount (e.g.
    // StrictMode double-invoke) would otherwise never retry.
    if (connection.state === signalR.HubConnectionState.Connected) {
      clearTimeout(timeoutId)
      setConnectionState("connected")
    } else if (
      connection.state === signalR.HubConnectionState.Disconnected ||
      connectAttempt > 0
    ) {
      attemptStart()
    } else {
      // Connecting / Reconnecting / Disconnecting from a previous instance —
      // reflect that state but rely on the timeout above to recover.
      setConnectionState(
        connection.state === signalR.HubConnectionState.Reconnecting ? "reconnecting" : "connecting"
      )
    }

    return () => {
      clearTimeout(timeoutId)
      connection.off("ReceiveMessage", handleReceiveMessage)
    }
  }, [handleReceiveMessage, connectAttempt])

  const handleRetryConnection = () => setConnectAttempt((n) => n + 1)

  // --------------------------------------------------------------------
  // 4) Send message — optimistic, with retry on failure
  // --------------------------------------------------------------------
  const sendPayload = async (content: string, localId: string) => {
    const connection = getChatConnection()
    if (connection.state !== signalR.HubConnectionState.Connected) {
      setMessages((prev) => prev.map((m) => (m.id === localId ? { ...m, status: "failed" } : m)))
      return
    }
    try {
      await connection.invoke("SendMessage", receiverId, content)
      // Resolution happens in handleReceiveMessage when the hub echoes it back.
      // As a safety net, clear the "sending" flag here too in case the echo
      // already arrived (or won't, depending on hub implementation).
      setMessages((prev) =>
        prev.map((m) => (m.id === localId && m.status === "sending" ? { ...m, status: undefined } : m))
      )
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === localId ? { ...m, status: "failed" } : m)))
    }
  }

  const handleSendMessage = () => {
    const trimmed = newMessage.trim()
    if (!trimmed) return

    const localId = `s-${Date.now()}-${Math.random()}`
    setMessages((prev) => [
      ...prev,
      {
        id: localId,
        senderId: currentUserId.current ?? "me",
        content: trimmed,
        sentAt: new Date().toISOString(),
        status: "sending",
      },
    ])
    setNewMessage("")
    inputRef.current?.focus()
    sendPayload(trimmed, localId)
  }

  const handleRetry = (message: Message) => {
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, status: "sending" } : m)))
    sendPayload(message.content, message.id)
  }

  const isMine = (senderId: string) => senderId === currentUserId.current || senderId === "me"

  // --------------------------------------------------------------------
  // Group messages by day for date separators
  // --------------------------------------------------------------------
  const groupedMessages: { label: string; items: Message[] }[] = []
  for (const m of messages) {
    const label = formatDayLabel(m.sentAt)
    const lastGroup = groupedMessages[groupedMessages.length - 1]
    if (lastGroup && lastGroup.label === label) {
      lastGroup.items.push(m)
    } else {
      groupedMessages.push({ label, items: [m] })
    }
  }

  const canSend = !accessError && !isLoadingHistory && connectionState === "connected"

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-hidden">
      <AmbientGlow />
      <Navigation />

      <div className="flex-1 flex pt-20 relative z-10">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          {/* ---------------- Header ---------------- */}
          <div className="border-b border-white/10 px-4 md:px-6 py-4 bg-white/[0.02] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="text-gray-400 hover:text-[#84FF00] transition-colors shrink-0"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="relative shrink-0">
                {partner?.avatarUrl && !avatarFailed ? (
                  <img
                    src={partner.avatarUrl}
                    alt={partner.name}
                    onError={() => setAvatarFailed(true)}
                    className="w-11 h-11 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#84FF00]/20 to-[#00D9FF]/10 border border-white/10 flex items-center justify-center">
                    <span className="text-[#84FF00] font-bold text-xs">
                      {partner ? initials(partner.name) : "··"}
                    </span>
                  </div>
                )}
                <Circle
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#050505] ${
                    connectionState === "connected" ? "fill-[#84FF00] text-[#84FF00]" : "fill-gray-600 text-gray-600"
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-white text-sm uppercase tracking-wide truncate">
                  {partner?.name ?? "Loading..."}
                </h2>
                <p className="text-xs truncate">
                  {connectionState === "connected" && <span className="text-[#84FF00]">Online</span>}
                  {connectionState === "connecting" && <span className="text-gray-500">Connecting…</span>}
                  {connectionState === "reconnecting" && <span className="text-[#FF6B00]">Reconnecting…</span>}
                  {connectionState === "disconnected" && (
                    <span className="text-gray-500">
                      Offline ·{" "}
                      <button onClick={handleRetryConnection} className="text-[#84FF00] hover:underline">
                        Retry
                      </button>
                    </span>
                  )}
                  {partner?.meta && <span className="text-gray-500"> · {partner.meta}</span>}
                </p>
                {connectErrorDetail && connectionState === "disconnected" && (
                  <p className="text-[11px] text-[#FF6B00] truncate mt-0.5">{connectErrorDetail}</p>
                )}
              </div>
            </div>
          </div>

          {/* ---------------- Messages ---------------- */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-1">
            {isLoadingHistory && (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Loader2 className="h-6 w-6 text-[#84FF00] animate-spin" />
                <p className="text-gray-500 text-xs uppercase tracking-wide">Loading conversation</p>
              </div>
            )}

            {!isLoadingHistory && accessError && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-sm rounded-2xl border border-[#FF6B00]/30 bg-[#FF6B00]/[0.06] p-6">
                  <AlertTriangle className="h-6 w-6 text-[#FF6B00] mx-auto mb-3" />
                  <p className="text-white font-semibold text-sm mb-1">Can't open this chat</p>
                  <p className="text-gray-400 text-sm">{accessError}</p>
                </div>
              </div>
            )}

            {!isLoadingHistory && !accessError && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <p className="text-gray-500 text-sm">No messages yet.</p>
                <p className="text-gray-600 text-xs">Say hi to {partner?.name ?? "start the conversation"}.</p>
              </div>
            )}

            {!isLoadingHistory &&
              !accessError &&
              groupedMessages.map((group, gIdx) => (
                <div key={gIdx}>
                  <div className="flex items-center justify-center my-4">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-gray-600 bg-white/[0.03] px-3 py-1 rounded-full border border-white/5">
                      {group.label}
                    </span>
                  </div>

                  {group.items.map((message) => {
                    const mine = isMine(message.senderId)
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-2.5 mb-3 message-in ${mine ? "flex-row-reverse" : ""}`}
                      >
                        <div className="shrink-0 self-end">
                          {mine ? (
                            <div className="w-7 h-7 rounded-full bg-[#84FF00]/15 border border-[#84FF00]/30 flex items-center justify-center">
                              <span className="text-[#84FF00] text-[10px] font-bold">You</span>
                            </div>
                          ) : partner?.avatarUrl && !avatarFailed ? (
                            <img
                              src={partner.avatarUrl}
                              alt={partner.name}
                              onError={() => setAvatarFailed(true)}
                              className="w-7 h-7 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                              <span className="text-gray-400 text-[10px] font-bold">
                                {partner ? initials(partner.name) : "?"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className={`flex flex-col gap-1 max-w-[75%] md:max-w-sm ${mine ? "items-end" : "items-start"}`}>
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words ${
                              mine
                                ? message.status === "failed"
                                  ? "bg-[#FF6B00]/15 text-white border border-[#FF6B00]/40"
                                  : "bg-[#84FF00] text-black"
                                : "bg-white/[0.06] text-white border border-white/10"
                            } ${message.status === "sending" ? "opacity-60" : ""}`}
                          >
                            {message.content}
                          </div>
                          <div className="flex items-center gap-1.5 px-1">
                            <span className="text-[11px] text-gray-600">{formatTime(message.sentAt)}</span>
                            {message.status === "sending" && (
                              <Loader2 className="h-2.5 w-2.5 text-gray-500 animate-spin" />
                            )}
                            {message.status === "failed" && (
                              <button
                                onClick={() => handleRetry(message)}
                                className="flex items-center gap-1 text-[11px] text-[#FF6B00] hover:underline"
                              >
                                <RefreshCw className="h-2.5 w-2.5" /> Failed · Retry
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}

            <div ref={messagesEndRef} />
          </div>

          {/* ---------------- Input ---------------- */}
          <div className="border-t border-white/10 px-4 md:px-6 py-4 bg-white/[0.02] backdrop-blur-sm">
            <div className="flex gap-3 items-center">
              <input
                ref={inputRef}
                type="text"
                placeholder={canSend ? "Type your message..." : "Connecting..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage()
                }}
                disabled={!canSend}
                className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-gray-500 focus:border-[#84FF00]/50 focus:outline-none focus:ring-1 focus:ring-[#84FF00]/20 transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!canSend || !newMessage.trim()}
                className="shrink-0 w-11 h-11 rounded-full bg-[#84FF00] text-black flex items-center justify-center transition-all hover:shadow-[0_0_20px_rgba(132,255,0,0.5)] disabled:opacity-30 disabled:shadow-none"
                aria-label="Send"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- Sidebar: partner info (desktop only) ---------------- */}
        <div className="hidden lg:flex lg:w-80 flex-col border-l border-white/10 bg-white/[0.02]">
          <div className="p-6 border-b border-white/10 text-center">
            {partner?.avatarUrl && !avatarFailed ? (
              <img
                src={partner.avatarUrl}
                alt={partner.name}
                onError={() => setAvatarFailed(true)}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border border-white/10"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#84FF00]/20 to-[#00D9FF]/10 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-[#84FF00] font-bold text-lg">
                  {partner ? initials(partner.name) : "··"}
                </span>
              </div>
            )}
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">{partner?.name ?? "—"}</h3>
            {partner?.meta && <p className="text-[#84FF00] text-xs mt-1">{partner.meta}</p>}
          </div>

          <div className="flex-1 p-6">
            <Link href="/contacts">
              <button className="w-full rounded-full border border-white/10 text-gray-300 hover:border-[#84FF00]/40 hover:text-[#84FF00] text-xs uppercase tracking-wide font-bold py-3 transition-colors">
                Back to messages
              </button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`


        @keyframes message-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .message-in {
          animation: message-in 0.25s ease-out both;
        }
      `}</style>
    </div>
  )
}

// ============================================================================
// Ambient background
// ============================================================================

function AmbientGlow() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.07] blur-[100px]"
        style={{ background: "#00D9FF" }}
      />
      <div
        className="absolute bottom-0 -left-40 w-96 h-96 rounded-full opacity-[0.06] blur-[100px]"
        style={{ background: "#84FF00" }}
      />
    </div>
  )
}