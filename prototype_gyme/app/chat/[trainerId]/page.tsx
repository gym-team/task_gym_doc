"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, Phone, Video, Info, ArrowLeft, Circle, Loader2 } from "lucide-react"
import * as signalR from "@microsoft/signalr"

// ============================================================================
// Types
// ============================================================================

interface Message {
  id: string
  senderId: string
  content: string
  sentAt: string // ISO string from backend, or generated client-side for optimistic messages
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

// ============================================================================
// Config
// ============================================================================

const API_BASE_URL = "https://fitzone-16.runasp.net"
const HUB_URL = `${API_BASE_URL}/chatHub`

function getToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

function getCurrentUserId(): string | null {
  const token = getToken()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    // ClaimTypes.NameIdentifier maps to this claim URI in the JWT
    return (
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ??
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

// ============================================================================
// Singleton SignalR connection
// ============================================================================
// One shared HubConnection across the app (and across remounts in dev/StrictMode),
// so we don't open duplicate sockets per chat page visit.

let connectionInstance: signalR.HubConnection | null = null

function getChatConnection(): signalR.HubConnection {
  if (connectionInstance) return connectionInstance

  connectionInstance = new signalR.HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => getToken() ?? "",
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build()

  return connectionInstance
}

// ============================================================================
// Page
// ============================================================================

export default function ChatPage({ params }: { params: { trainerId: string } }) {
  const receiverId = params.trainerId

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [connectionState, setConnectionState] = useState<
    "connecting" | "connected" | "reconnecting" | "disconnected"
  >("connecting")
  const [accessError, setAccessError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = useRef<string | null>(null)

  useEffect(() => {
    currentUserId.current = getCurrentUserId()
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // --------------------------------------------------------------------
  // 1) Check chat access, then load history
  // --------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false

    async function init() {
      setIsLoadingHistory(true)
      setAccessError(null)

      try {
        const token = getToken()

        const accessRes = await fetch(
          `${API_BASE_URL}/api/Chat/access/${receiverId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (!accessRes.ok) throw new Error("Failed to verify chat access.")

        const access: ChatAccessResponse = await accessRes.json()

        if (cancelled) return

        if (!access.canChat) {
          setAccessError(access.message || "You are not allowed to chat with this user.")
          setIsLoadingHistory(false)
          return
        }

        const convRes = await fetch(
          `${API_BASE_URL}/api/Chat/conversation/${receiverId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        if (!convRes.ok) throw new Error("Failed to load conversation.")

        const history: ConversationMessage[] = await convRes.json()

        if (cancelled) return

        setMessages(
          history.map((m, idx) => ({
            id: `${m.sentAt}-${idx}`,
            senderId: m.senderId,
            content: m.message,
            sentAt: m.sentAt,
          }))
        )
      } catch (err) {
        if (!cancelled) {
          setAccessError(
            err instanceof Error ? err.message : "Something went wrong loading the chat."
          )
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
  // 2) SignalR connection lifecycle + incoming messages
  // --------------------------------------------------------------------
  const handleReceiveMessage = useCallback((senderId: string, message: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        senderId,
        content: message,
        sentAt: new Date().toISOString(),
      },
    ])
  }, [])

  useEffect(() => {
    const connection = getChatConnection()

    connection.off("ReceiveMessage")
    connection.on("ReceiveMessage", handleReceiveMessage)

    connection.onreconnecting(() => setConnectionState("reconnecting"))
    connection.onreconnected(() => setConnectionState("connected"))
    connection.onclose(() => setConnectionState("disconnected"))

    if (connection.state === signalR.HubConnectionState.Disconnected) {
      setConnectionState("connecting")
      connection
        .start()
        .then(() => setConnectionState("connected"))
        .catch((err) => {
          console.error("SignalR connection error:", err)
          setConnectionState("disconnected")
        })
    } else if (connection.state === signalR.HubConnectionState.Connected) {
      setConnectionState("connected")
    }

    return () => {
      // Keep the singleton connection alive across navigations;
      // just detach this component's listener.
      connection.off("ReceiveMessage", handleReceiveMessage)
    }
  }, [handleReceiveMessage])

  // --------------------------------------------------------------------
  // 3) Send message
  // --------------------------------------------------------------------
  const handleSendMessage = async () => {
    const trimmed = newMessage.trim()
    if (!trimmed || isSending) return

    const connection = getChatConnection()

    if (connection.state !== signalR.HubConnectionState.Connected) {
      console.warn("Cannot send message: not connected.")
      return
    }

    setIsSending(true)
    setNewMessage("")

    try {
      await connection.invoke("SendMessage", receiverId, trimmed)
      // No optimistic push here: the hub echoes the message back to
      // Clients.Caller via "ReceiveMessage", so it'll arrive through
      // handleReceiveMessage and render once.
    } catch (err) {
      console.error("Failed to send message:", err)
      setNewMessage(trimmed) // restore so the user doesn't lose their text
    } finally {
      setIsSending(false)
    }
  }

  const isMine = (senderId: string) => senderId === currentUserId.current

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navigation />
      <div className="flex-1 flex">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full border-l border-r border-white/10">
          {/* Chat Header */}
          <div className="border-b border-white/10 p-4 md:p-6 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="md:hidden">
                  <ArrowLeft className="h-5 w-5 text-white hover:text-[#84FF00]" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="/male-trainer-strength.jpg"
                      alt="Trainer"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <Circle
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black ${
                        connectionState === "connected"
                          ? "bg-green-500 text-green-500"
                          : "bg-gray-500 text-gray-500"
                      }`}
                    />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">Alex Morgan</h2>
                    <p className="text-xs flex items-center gap-1">
                      {connectionState === "connected" && (
                        <span className="text-green-400 flex items-center gap-1">
                          <Circle className="h-2 w-2 fill-green-400" /> Online
                        </span>
                      )}
                      {connectionState === "connecting" && (
                        <span className="text-gray-400">Connecting...</span>
                      )}
                      {connectionState === "reconnecting" && (
                        <span className="text-orange-400">Reconnecting...</span>
                      )}
                      {connectionState === "disconnected" && (
                        <span className="text-gray-500">Offline</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="text-white hover:text-[#84FF00] hover:bg-white/10">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" className="text-white hover:text-[#84FF00] hover:bg-white/10">
                  <Video className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" className="text-white hover:text-[#84FF00] hover:bg-white/10">
                  <Info className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-black">
            {isLoadingHistory && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 text-[#84FF00] animate-spin" />
              </div>
            )}

            {!isLoadingHistory && accessError && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-sm">
                  <p className="text-orange-400 font-medium mb-2">Can't open this chat</p>
                  <p className="text-gray-400 text-sm">{accessError}</p>
                </div>
              </div>
            )}

            {!isLoadingHistory && !accessError && messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-sm">No messages yet. Say hi!</p>
              </div>
            )}

            {!isLoadingHistory &&
              !accessError &&
              messages.map((message) => {
                const mine = isMine(message.senderId)
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 animate-[fadeInUp_0.3s_ease-out] ${
                      mine ? "flex-row-reverse" : ""
                    }`}
                  >
                    <img
                      src={mine ? "/fit-woman-smiling-in-gym.jpg" : "/male-trainer-strength.jpg"}
                      alt={mine ? "You" : "Trainer"}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className={`flex flex-col gap-1 max-w-xs ${mine ? "items-end" : ""}`}>
                      <span className="text-xs text-gray-400">{mine ? "You" : "Alex Morgan"}</span>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          mine
                            ? "bg-[#84FF00] text-black"
                            : "bg-white/10 text-white border border-white/20"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <span className="text-xs text-gray-500">{formatTime(message.sentAt)}</span>
                    </div>
                  </div>
                )
              })}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-white/10 p-4 md:p-6 bg-white/5">
            <div className="flex gap-3">
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:text-[#84FF00] hover:bg-white/10 flex-shrink-0"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={!!accessError || isLoadingHistory}
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white placeholder-gray-500 focus:border-[#84FF00] focus:outline-none transition-colors disabled:opacity-50"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                disabled={!!accessError || isLoadingHistory || isSending || connectionState !== "connected"}
                className="bg-[#84FF00] text-black hover:bg-[#84FF00]/90 flex-shrink-0 transition-all hover:shadow-[0_0_20px_rgba(132,255,0,0.5)] disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar - Trainer Info (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-80 flex-col border-r border-white/10 bg-white/5">
          <div className="p-6 border-b border-white/10">
            <img
              src="/male-trainer-strength.jpg"
              alt="Trainer"
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
            />
            <h3 className="text-xl font-bold text-white text-center">Alex Morgan</h3>
            <p className="text-[#84FF00] text-sm text-center font-medium">Strength & Conditioning</p>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-2">Experience</p>
              <p className="text-white">8 years</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-2">Certifications</p>
              <div className="flex flex-wrap gap-2">
                {["NASM-CPT", "CSCS"].map((cert) => (
                  <span key={cert} className="bg-[#84FF00]/20 text-[#84FF00] text-xs px-2 py-1 rounded">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-2">Bio</p>
              <p className="text-gray-300 text-sm">Specializing in powerlifting and functional strength training.</p>
            </div>

            <div className="border-t border-white/10 pt-6">
              <Link href={`/trainers/alex-morgan`}>
                <Button className="w-full bg-[#84FF00] text-black hover:bg-[#84FF00]/90 font-bold">
                  View Full Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}