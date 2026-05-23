import Link from "next/link";
import {
  Flame,
  BarChart3,
  Clock,
  Dumbbell,
  Timer,
  Star
} from "lucide-react";

// format enum
function formatEnum(value: string) {
  return value
    ?.replace(/([A-Z])/g, " $1")
    ?.replace(/^./, (s) => s.toUpperCase());
}

const goalColors: any = {
  LoseFat: "text-orange-400",
  BuildMuscle: "text-green-400",
  ImproveEndurance: "text-cyan-400",
  GetStronger: "text-yellow-400",
  GeneralFitness: "text-white",
};

export default function PlanCard({ plan, trackId }: any) {
  return (
    <div
      className="
      group relative rounded-2xl overflow-hidden 
      border border-white/10
      bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a]
      backdrop-blur-xl
      transition-all duration-500
      hover:-translate-y-3
      hover:shadow-[0_20px_60px_rgba(132,255,0,0.25)]
    "
    >
      {/* IMAGE */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={plan.photoThumbnailUrl || "/placeholder.jpg"}
          alt={plan.name}
          className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* CONTENT */}
      <div className="p-6 flex flex-col h-[340px]">

        {/* TITLE */}
        <h3 className="text-xl font-bold text-white mb-2">
          {plan.name}
        </h3>

        {/* DESC */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {plan.description}
        </p>

        {/* GOAL + LEVEL */}
        <div className="flex justify-between items-center text-sm mb-4">

          <span className={`flex items-center gap-1 ${goalColors[plan.trainingGoal]}`}>
            <Flame size={16} />
            {formatEnum(plan.trainingGoal)}
          </span>

          <span className="flex items-center gap-1 text-gray-300">
            <BarChart3 size={16} />
            {formatEnum(plan.fitnessLevel)}
          </span>
        </div>

        {/* DETAILS */}
        <div className="text-gray-400 text-sm space-y-2 mb-4">

          <div className="flex items-center gap-2">
            <Clock size={16} />
            {plan.durationOnWeeks} Weeks
          </div>

          <div className="flex items-center gap-2">
            <Dumbbell size={16} />
            {plan.sessionsPerWeeks} Sessions / week
          </div>

          <div className="flex items-center gap-2">
            <Timer size={16} />
            {plan.sessionsDuration} min / session
          </div>

          <div className="flex items-center gap-2">
            ⚙️ {formatEnum(plan.equipmentType)}
          </div>
        </div>

        {/* RATING */}
        <div className="flex items-center gap-2 text-yellow-400 mb-4">
          <Star size={16} />
          {plan.coachRating || "N/A"}
        </div>

        {/* BUTTON */}
        <Link
          href={`/plans/${trackId}/${plan.id}`}
          className="
          mt-auto text-center 
          bg-white text-black 
          py-2 rounded-lg font-semibold 
          hover:bg-[#84FF00] transition
        "
        >
          View Plan
        </Link>
      </div>
    </div>
  );
}