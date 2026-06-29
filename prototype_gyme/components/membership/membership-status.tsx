"use client";

import { Crown, Calendar, CheckCircle2 } from "lucide-react";
import { MembershipStatus as MembershipStatusType } from "@/lib/membership";

type Props = {
  membership: MembershipStatusType;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MembershipStatusCard({ membership }: Props) {
  return (
    <div className="max-w-2xl mx-auto mb-12 rounded-3xl border border-[#84FF00]/30 bg-gradient-to-br from-[#84FF00]/10 via-[#090909] to-[#090909] p-8 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#84FF00]/20 blur-3xl pointer-events-none" />

      <div className="relative flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-[#84FF00]/15 border border-[#84FF00]/30 flex items-center justify-center">
            {membership.isPremium ? (
              <Crown className="h-7 w-7 text-[#84FF00]" />
            ) : (
              <CheckCircle2 className="h-7 w-7 text-[#84FF00]" />
            )}
          </div>

          <div>
            <p className="text-zinc-400 text-sm uppercase tracking-wide font-bold">
              Current Plan
            </p>
            <h3 className="text-2xl font-black text-white">
              {membership.membershipName}{" "}
              <span className="text-[#84FF00]">{membership.planTitle}</span>
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-300 text-sm font-bold">ACTIVE</span>
        </div>
      </div>

      <div className="relative mt-6 flex items-center gap-2 text-zinc-400 text-sm">
        <Calendar size={16} className="text-[#84FF00]" />
        <span>
          {formatDate(membership.startDate)} → {formatDate(membership.endDate)}
        </span>
      </div>
    </div>
  );
}