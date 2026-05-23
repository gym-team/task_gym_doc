// "use client"

// import { useState } from "react"
// import { Clock, Users, TrendingUp } from "lucide-react"
// import { Button } from "@/components/ui/button"

// export function ClassSchedule() {
//   const [selectedDay, setSelectedDay] = useState("Monday")

//   const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

//   const schedule = {
//     Monday: [
//       {
//         time: "6:00 AM",
//         name: "Morning HIIT",
//         trainer: "Marcus Johnson",
//         duration: "45 min",
//         spots: 12,
//         difficulty: "Intermediate",
//         category: "Cardio",
//       },
//       {
//         time: "7:00 AM",
//         name: "Yoga Flow",
//         trainer: "Sarah Chen",
//         duration: "60 min",
//         spots: 8,
//         difficulty: "All Levels",
//         category: "Yoga",
//       },
//       {
//         time: "12:00 PM",
//         name: "Strength & Power",
//         trainer: "Alex Morgan",
//         duration: "60 min",
//         spots: 15,
//         difficulty: "Intermediate",
//         category: "Strength",
//       },
//       {
//         time: "5:30 PM",
//         name: "CrossFit WOD",
//         trainer: "David Kim",
//         duration: "60 min",
//         spots: 10,
//         difficulty: "Advanced",
//         category: "CrossFit",
//       },
//       {
//         time: "7:00 PM",
//         name: "Kickboxing",
//         trainer: "Marcus Johnson",
//         duration: "45 min",
//         spots: 20,
//         difficulty: "All Levels",
//         category: "Martial Arts",
//       },
//     ],
//     Tuesday: [
//       {
//         time: "6:00 AM",
//         name: "Pilates Core",
//         trainer: "Jessica Williams",
//         duration: "45 min",
//         spots: 12,
//         difficulty: "Beginner",
//         category: "Wellness",
//       },
//       {
//         time: "9:00 AM",
//         name: "Functional Fitness",
//         trainer: "David Kim",
//         duration: "60 min",
//         spots: 15,
//         difficulty: "Intermediate",
//         category: "Strength",
//       },
//       {
//         time: "12:00 PM",
//         name: "Spin Class",
//         trainer: "Marcus Johnson",
//         duration: "45 min",
//         spots: 25,
//         difficulty: "All Levels",
//         category: "Cardio",
//       },
//       {
//         time: "6:00 PM",
//         name: "Power Yoga",
//         trainer: "Sarah Chen",
//         duration: "60 min",
//         spots: 10,
//         difficulty: "Intermediate",
//         category: "Yoga",
//       },
//     ],
//     Wednesday: [
//       {
//         time: "6:00 AM",
//         name: "Boot Camp",
//         trainer: "Alex Morgan",
//         duration: "60 min",
//         spots: 18,
//         difficulty: "Advanced",
//         category: "Cardio",
//       },
//       {
//         time: "10:00 AM",
//         name: "Gentle Yoga",
//         trainer: "Sarah Chen",
//         duration: "60 min",
//         spots: 12,
//         difficulty: "Beginner",
//         category: "Yoga",
//       },
//       {
//         time: "5:30 PM",
//         name: "Olympic Lifting",
//         trainer: "David Kim",
//         duration: "60 min",
//         spots: 8,
//         difficulty: "Advanced",
//         category: "Strength",
//       },
//       {
//         time: "7:00 PM",
//         name: "Zumba",
//         trainer: "Emily Rodriguez",
//         duration: "45 min",
//         spots: 30,
//         difficulty: "All Levels",
//         category: "Cardio",
//       },
//     ],
//     Thursday: [
//       {
//         time: "6:00 AM",
//         name: "Strength Training",
//         trainer: "Alex Morgan",
//         duration: "60 min",
//         spots: 15,
//         difficulty: "Intermediate",
//         category: "Strength",
//       },
//       {
//         time: "12:00 PM",
//         name: "HIIT Circuit",
//         trainer: "Marcus Johnson",
//         duration: "45 min",
//         spots: 20,
//         difficulty: "Intermediate",
//         category: "Cardio",
//       },
//       {
//         time: "6:00 PM",
//         name: "CrossFit Fundamentals",
//         trainer: "David Kim",
//         duration: "60 min",
//         spots: 12,
//         difficulty: "Beginner",
//         category: "CrossFit",
//       },
//     ],
//     Friday: [
//       {
//         time: "6:00 AM",
//         name: "Morning Flow",
//         trainer: "Sarah Chen",
//         duration: "60 min",
//         spots: 10,
//         difficulty: "All Levels",
//         category: "Yoga",
//       },
//       {
//         time: "5:30 PM",
//         name: "Friday Night Burn",
//         trainer: "Marcus Johnson",
//         duration: "45 min",
//         spots: 25,
//         difficulty: "Intermediate",
//         category: "Cardio",
//       },
//       {
//         time: "7:00 PM",
//         name: "Stretch & Recovery",
//         trainer: "Jessica Williams",
//         duration: "45 min",
//         spots: 15,
//         difficulty: "All Levels",
//         category: "Wellness",
//       },
//     ],
//     Saturday: [
//       {
//         time: "8:00 AM",
//         name: "Weekend Warrior",
//         trainer: "Alex Morgan",
//         duration: "90 min",
//         spots: 20,
//         difficulty: "Advanced",
//         category: "Strength",
//       },
//       {
//         time: "10:00 AM",
//         name: "Family Yoga",
//         trainer: "Sarah Chen",
//         duration: "60 min",
//         spots: 15,
//         difficulty: "All Levels",
//         category: "Yoga",
//       },
//       {
//         time: "11:30 AM",
//         name: "Boxing Basics",
//         trainer: "Marcus Johnson",
//         duration: "60 min",
//         spots: 18,
//         difficulty: "Beginner",
//         category: "Martial Arts",
//       },
//     ],
//     Sunday: [
//       {
//         time: "9:00 AM",
//         name: "Sunday Stretch",
//         trainer: "Jessica Williams",
//         duration: "60 min",
//         spots: 12,
//         difficulty: "All Levels",
//         category: "Wellness",
//       },
//       {
//         time: "10:30 AM",
//         name: "Restorative Yoga",
//         trainer: "Sarah Chen",
//         duration: "75 min",
//         spots: 10,
//         difficulty: "Beginner",
//         category: "Yoga",
//       },
//       {
//         time: "5:00 PM",
//         name: "Sunday Strength",
//         trainer: "Alex Morgan",
//         duration: "60 min",
//         spots: 15,
//         difficulty: "Intermediate",
//         category: "Strength",
//       },
//     ],
//   }

//   const currentSchedule = schedule[selectedDay as keyof typeof schedule] || []

//   return (
//     <section className="py-24 bg-gradient-to-b from-black to-[#0A0A0A]">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-12">
//           <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
//             WEEKLY <span className="text-[#84FF00]">SCHEDULE</span>
//           </h2>
//           <p className="text-xl text-gray-400 max-w-2xl mx-auto">
//             Browse our class schedule and book your spot. Classes fill up fast!
//           </p>
//         </div>

//         {/* Day Selector */}
//         <div className="flex flex-wrap justify-center gap-2 mb-12">
//           {days.map((day) => (
//             <button
//               key={day}
//               onClick={() => setSelectedDay(day)}
//               className={`px-6 py-3 rounded-full font-bold transition-all ${
//                 selectedDay === day
//                   ? "bg-[#84FF00] text-black"
//                   : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
//               }`}
//             >
//               {day}
//             </button>
//           ))}
//         </div>

//         {/* Schedule Grid */}
//         <div className="max-w-5xl mx-auto space-y-4">
//           {currentSchedule.map((classItem, index) => (
//             <div
//               key={index}
//               className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-[#84FF00]/50 transition-all duration-300"
//             >
//               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-2">
//                     <span className="text-[#84FF00] font-bold text-lg">{classItem.time}</span>
//                     <span className="bg-white/10 px-3 py-1 rounded-full text-xs text-gray-300">
//                       {classItem.category}
//                     </span>
//                   </div>
//                   <h3 className="text-2xl font-black text-white mb-1">{classItem.name}</h3>
//                   <p className="text-gray-400">with {classItem.trainer}</p>
//                 </div>

//                 <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
//                   <div className="flex gap-4 text-sm text-gray-400">
//                     <div className="flex items-center gap-1">
//                       <Clock className="h-4 w-4" />
//                       {classItem.duration}
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Users className="h-4 w-4" />
//                       {classItem.spots} spots
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <TrendingUp className="h-4 w-4" />
//                       {classItem.difficulty}
//                     </div>
//                   </div>

//                   <Button className="bg-[#84FF00] text-black hover:bg-[#84FF00]/90 font-bold whitespace-nowrap">
//                     Book Class
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Note */}
//         <div className="max-w-5xl mx-auto mt-8 text-center">
//           <p className="text-gray-400 text-sm">
//             Standard and Premium members can book classes up to 7 days in advance. Basic members can book 24 hours in
//             advance.
//           </p>
//         </div>
//       </div>
//     </section>
//   )
// }
