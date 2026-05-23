"use client";

import { ChevronDown } from "lucide-react";

export default function Filters({ filters, setFilters }: any) {
  return (
    <div className="flex flex-wrap gap-5 mb-12">

      {/* ================= LEVEL ================= */}
      <div className="relative group">
        <select
          value={filters.level}
          onChange={(e) =>
            setFilters((prev: any) => ({
              ...prev,
              level: e.target.value,
            }))
          }
          className="
            appearance-none
            min-w-[220px]
            bg-white/[0.04]
            backdrop-blur-xl
            border border-white/10
            hover:border-[#84FF00]/40
            focus:border-[#84FF00]
            text-white
            px-5
            py-3
            pr-12
            rounded-2xl
            outline-none
            transition-all
            duration-300
            shadow-[0_0_20px_rgba(0,0,0,0.35)]
            hover:shadow-[0_0_25px_rgba(132,255,0,0.15)]
            cursor-pointer
          "
        >
          <option className="bg-[#111] text-white" value="">
            All Levels
          </option>

          <option className="bg-[#111]" value="Beginner">
            Beginner
          </option>

          <option className="bg-[#111]" value="Intermediate">
            Intermediate
          </option>

          <option className="bg-[#111]" value="Advanced">
            Advanced
          </option>
        </select>

        {/* Icon */}
        <ChevronDown
          className="
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            h-5
            w-5
            text-[#84FF00]
            pointer-events-none
            transition-transform
            duration-300
            group-hover:rotate-180
          "
        />
      </div>

      {/* ================= GOAL ================= */}
      <div className="relative group">
        <select
          value={filters.goal}
          onChange={(e) =>
            setFilters((prev: any) => ({
              ...prev,
              goal: e.target.value,
            }))
          }
          className="
            appearance-none
            min-w-[220px]
            bg-white/[0.04]
            backdrop-blur-xl
            border border-white/10
            hover:border-[#84FF00]/40
            focus:border-[#84FF00]
            text-white
            px-5
            py-3
            pr-12
            rounded-2xl
            outline-none
            transition-all
            duration-300
            shadow-[0_0_20px_rgba(0,0,0,0.35)]
            hover:shadow-[0_0_25px_rgba(132,255,0,0.15)]
            cursor-pointer
          "
        >
          <option className="bg-[#111] text-white" value="">
            All Goals
          </option>

          <option className="bg-[#111]" value="LoseFat">
            Lose Fat
          </option>

          <option className="bg-[#111]" value="BuildMuscle">
            Build Muscle
          </option>

          <option className="bg-[#111]" value="GetStronger">
            Get Stronger
          </option>

          <option className="bg-[#111]" value="ImproveEndurance">
            Endurance
          </option>
        </select>

        {/* Icon */}
        <ChevronDown
          className="
            absolute
            right-4
            top-1/2
            -translate-y-1/2
            h-5
            w-5
            text-[#84FF00]
            pointer-events-none
            transition-transform
            duration-300
            group-hover:rotate-180
          "
        />
      </div>
    </div>
  );
}