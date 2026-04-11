export function StatsSection() {
  const stats = [
    {
      value: "10K+",
      label: "Workouts Completed",
      color: "text-[#84FF00]",
    },
    {
      value: "98%",
      label: "Member Satisfaction",
      color: "text-[#FF6B00]",
    },
    {
      value: "24/7",
      label: "Gym Access",
      color: "text-[#00D9FF]",
    },
    {
      value: "15+",
      label: "Years Experience",
      color: "text-[#84FF00]",
    },
  ]

  return (
    <section className="py-20 bg-black border-y border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-5xl md:text-6xl font-black ${stat.color} mb-2`}>{stat.value}</div>
              <div className="text-gray-400 uppercase tracking-wide text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
