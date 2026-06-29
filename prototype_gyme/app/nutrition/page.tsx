import { Navigation } from "@/components/navigation";
import { PlanCard } from "@/components/nutrition/plan-card";
import { getPlans } from "@/services/nutrition-plan";
import { NutritionPlan } from "@/types/nutrition-plan";

function normalizePlansResponse(response: unknown): NutritionPlan[] {
  if (Array.isArray(response)) {
    return response as NutritionPlan[];
  }

  if (response && typeof response === "object") {
    const data = response as {
      data?: unknown;
      items?: unknown;
      result?: unknown;
    };

    if (Array.isArray(data.data)) return data.data as NutritionPlan[];
    if (Array.isArray(data.items)) return data.items as NutritionPlan[];
    if (Array.isArray(data.result)) return data.result as NutritionPlan[];
  }

  return [];
}

export default async function NutritionPage() {
  let plans: NutritionPlan[] = [];
  let errorMessage = "";

  try {
    const response = await getPlans();
    plans = normalizePlansResponse(response);
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Failed to load nutrition plans.";
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505]">

      {/* Navigation */}
      <Navigation />

      {/* Background Effects */}
      <div className="fixed inset-0 -z-30 bg-[#050505]" />

      <div className="fixed inset-0 -z-20 bg-[linear-gradient(to_bottom,rgba(132,255,0,0.08),transparent_40%,#050505)]" />

      <div className="fixed inset-0 -z-20 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="fixed left-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-[#84FF00]/10 blur-[150px]" />

      <div className="fixed bottom-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-[#84FF00]/5 blur-[150px]" />

      <main className="relative z-10 pt-16">

        {/* HERO */}
        <section className="relative overflow-hidden py-28 md:py-40">

          <div className="absolute inset-0 bg-black/60" />

          <div className="container relative mx-auto px-5">

            <div className="mx-auto max-w-4xl text-center">

              {/* Eyebrow */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#84FF00]/20 bg-[#84FF00]/10 px-5 py-2 backdrop-blur-xl">
                <div className="h-2 w-2 rounded-full bg-[#84FF00]" />
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#84FF00]">
                  Elite Nutrition System
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-5xl font-black uppercase tracking-tight text-white md:text-7xl">
                Nutrition
                <br />
                <span className="text-[#84FF00]">
                  Plans
                </span>
              </h1>

              {/* Description */}
              <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-white/70">
                Discover premium nutrition systems designed to maximize
                performance, accelerate recovery, optimize body composition,
                and fuel elite-level training.
              </p>

              {/* Stats */}
              <div className="mt-12 flex flex-wrap justify-center gap-4">

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 backdrop-blur-xl">
                  <div className="text-3xl font-black text-[#84FF00]">
                    {plans.length}
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                    Plans
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 backdrop-blur-xl">
                  <div className="text-3xl font-black text-[#84FF00]">
                    Elite
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                    Coaching
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 backdrop-blur-xl">
                  <div className="text-3xl font-black text-[#84FF00]">
                    100%
                  </div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                    Structured
                  </div>
                </div>

              </div>

              {/* Guarantee Pill */}
              <div className="mx-auto mt-10 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 backdrop-blur-xl">
                <span className="font-bold text-[#84FF00]">
                  ✓
                </span>
                <span className="text-sm text-white/70">
                  Personalized • Goal Oriented • Coach Approved
                </span>
              </div>

            </div>
          </div>
        </section>

        {/* PLANS SECTION */}
        <section className="pb-24">

          <div className="container mx-auto px-5">

            <div className="mb-14 text-center">

              <h2 className="text-4xl font-black uppercase tracking-tight text-white">
                Available{" "}
                <span className="text-[#84FF00]">
                  Nutrition Plans
                </span>
              </h2>

              <p className="mt-4 text-white/60">
                Select the nutrition strategy that matches your goals.
              </p>

            </div>

            {errorMessage ? (
              <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-300">
                {errorMessage}
              </div>
            ) : null}

            {plans.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-14 text-center backdrop-blur-xl">

                <div className="mb-4 text-5xl">
                  🥗
                </div>

                <h3 className="mb-2 text-2xl font-bold text-white">
                  No Plans Available
                </h3>

                <p className="text-white/60">
                  Nutrition plans will appear here once published.
                </p>

              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                  />
                ))}
              </div>
            )}

          </div>

        </section>

      </main>
    </div>
  );
}