"use client"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Users, Calendar, TrendingUp, DollarSign, MessageSquare, Edit2, Plus, Clock, CheckCircle } from "lucide-react"

interface Client {
  id: string
  name: string
  avatar: string
  specialty: string
  goal: string
  sessionsCompleted: number
  lastSession: string
}

interface Session {
  id: string
  clientName: string
  clientAvatar: string
  date: string
  time: string
  type: string
  status: "upcoming" | "completed" | "cancelled"
}

export default function TrainerDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "clients" | "sessions" | "income">("overview")

  const trainerInfo = {
    name: "Alex Morgan",
    specialty: "Strength & Conditioning",
    avatar: "/male-trainer-strength.jpg",
    certifications: ["NASM-CPT", "CSCS"],
    experience: "8 years",
  }

  const stats = [
    { icon: Users, label: "Active Clients", value: "12", color: "text-[#84FF00]" },
    { icon: Calendar, label: "Sessions This Month", value: "24", color: "text-[#FF6B00]" },
    { icon: TrendingUp, label: "Client Progress Avg", value: "92%", color: "text-[#00D9FF]" },
    { icon: DollarSign, label: "Monthly Income", value: "$4,800", color: "text-[#FFD700]" },
  ]

  const clients: Client[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      avatar: "/fit-woman-smiling-in-gym.jpg",
      specialty: "Weight Loss",
      goal: "Lose 30 lbs",
      sessionsCompleted: 12,
      lastSession: "Dec 20, 2024",
    },
    {
      id: "2",
      name: "Mike Chen",
      avatar: "/muscular-man-in-gym.jpg",
      specialty: "Strength Training",
      goal: "Build muscle",
      sessionsCompleted: 18,
      lastSession: "Dec 21, 2024",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      avatar: "/athletic-woman-running.jpg",
      specialty: "Endurance",
      goal: "Run faster",
      sessionsCompleted: 10,
      lastSession: "Dec 19, 2024",
    },
  ]

  const upcomingSessions: Session[] = [
    {
      id: "1",
      clientName: "Sarah Johnson",
      clientAvatar: "/fit-woman-smiling-in-gym.jpg",
      date: "Dec 23, 2024",
      time: "10:00 AM",
      type: "Strength Training",
      status: "upcoming",
    },
    {
      id: "2",
      clientName: "Mike Chen",
      clientAvatar: "/muscular-man-in-gym.jpg",
      date: "Dec 23, 2024",
      time: "2:00 PM",
      type: "Cardio & HIIT",
      status: "upcoming",
    },
    {
      id: "3",
      clientName: "Emily Rodriguez",
      clientAvatar: "/athletic-woman-running.jpg",
      date: "Dec 24, 2024",
      time: "9:00 AM",
      type: "Endurance Training",
      status: "upcoming",
    },
  ]

  const recentSessions: Session[] = [
    {
      id: "1",
      clientName: "Sarah Johnson",
      clientAvatar: "/fit-woman-smiling-in-gym.jpg",
      date: "Dec 20, 2024",
      time: "10:00 AM",
      type: "Strength Training",
      status: "completed",
    },
    {
      id: "2",
      clientName: "Mike Chen",
      clientAvatar: "/muscular-man-in-gym.jpg",
      date: "Dec 19, 2024",
      time: "2:00 PM",
      type: "Cardio & HIIT",
      status: "completed",
    },
    {
      id: "3",
      clientName: "Emily Rodriguez",
      clientAvatar: "/athletic-woman-running.jpg",
      date: "Dec 18, 2024",
      time: "9:00 AM",
      type: "Endurance Training",
      status: "completed",
    },
  ]

  const incomeData = [
    { month: "November", amount: 4200, sessions: 22 },
    { month: "October", amount: 4500, sessions: 24 },
    { month: "September", amount: 3800, sessions: 20 },
    { month: "August", amount: 4100, sessions: 22 },
  ]

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navigation />
      <div className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Trainer Header */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
              <div className="flex gap-6 items-start">
                <img
                  src={trainerInfo.avatar || "/placeholder.svg"}
                  alt={trainerInfo.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#84FF00] shadow-[0_0_30px_rgba(132,255,0,0.3)]"
                />
                <div>
                  <h1 className="text-4xl font-black text-white mb-2">{trainerInfo.name}</h1>
                  <p className="text-[#84FF00] font-bold mb-3">{trainerInfo.specialty}</p>
                  <p className="text-gray-400 text-sm mb-3">{trainerInfo.experience} experience</p>
                  <div className="flex flex-wrap gap-2">
                    {trainerInfo.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="bg-[#84FF00]/20 text-[#84FF00] text-xs px-3 py-1 rounded-full font-bold"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Button className="bg-[#84FF00] text-black hover:bg-[#84FF00]/90 font-bold">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#84FF00]/50 transition-all"
              >
                <stat.icon className={`h-8 w-8 ${stat.color} mb-3`} />
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-white/10 overflow-x-auto">
            {(["overview", "clients", "sessions", "income"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-bold capitalize transition-all ${
                  activeTab === tab ? "text-[#84FF00] border-b-2 border-[#84FF00]" : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Upcoming Sessions */}
              <div className="lg:col-span-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Upcoming Sessions</h2>
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div
                        key={session.id}
                        className="border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={session.clientAvatar || "/placeholder.svg"}
                            alt={session.clientName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-white font-bold">{session.clientName}</p>
                            <p className="text-gray-400 text-sm">{session.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#84FF00] font-bold">{session.date}</p>
                            <p className="text-gray-400 text-sm flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {session.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <Button className="w-full bg-[#84FF00] text-black hover:bg-[#84FF00]/90 font-bold justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                  <Button className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/20 font-bold justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Session
                  </Button>
                  <Button className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/20 font-bold justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Messages
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === "clients" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <Link key={client.id} href={`/chat/client-${client.id}`}>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#84FF00]/50 transition-all group cursor-pointer">
                    <img
                      src={client.avatar || "/placeholder.svg"}
                      alt={client.name}
                      className="w-16 h-16 rounded-full object-cover mb-4 group-hover:scale-110 transition-transform"
                    />
                    <h3 className="text-lg font-bold text-white mb-2">{client.name}</h3>
                    <p className="text-[#84FF00] text-sm font-bold mb-3">{client.specialty}</p>
                    <p className="text-gray-400 text-sm mb-4">{client.goal}</p>
                    <div className="flex justify-between text-xs text-gray-500 pt-4 border-t border-white/10">
                      <span>{client.sessionsCompleted} sessions</span>
                      <span>{client.lastSession}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Upcoming Sessions</h2>
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={session.clientAvatar || "/placeholder.svg"}
                            alt={session.clientName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-white font-bold">{session.clientName}</p>
                            <p className="text-gray-400 text-sm">{session.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[#84FF00] font-bold">{session.date}</p>
                          <p className="text-gray-400 text-sm">{session.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Recent Sessions</h2>
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={session.clientAvatar || "/placeholder.svg"}
                            alt={session.clientName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-white font-bold">{session.clientName}</p>
                            <p className="text-gray-400 text-sm">{session.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-[#84FF00]" />
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">{session.date}</p>
                            <p className="text-gray-500 text-xs">{session.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Income Tab */}
          {activeTab === "income" && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Income Summary</h2>
              <div className="space-y-6">
                {incomeData.map((data, index) => (
                  <div key={index} className="border-b border-white/10 pb-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-white font-bold">{data.month}</p>
                        <p className="text-gray-400 text-sm">{data.sessions} sessions</p>
                      </div>
                      <p className="text-3xl font-black text-[#84FF00]">${data.amount}</p>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#84FF00] to-[#00D9FF] h-2 rounded-full"
                        style={{ width: `${(data.amount / 4500) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
