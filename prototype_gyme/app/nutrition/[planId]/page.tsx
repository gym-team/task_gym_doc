import { notFound } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { getPlanDetails } from "@/services/nutrition-plan";
import { NutritionPlan } from "@/types/nutrition-plan";
import { PlanDetails } from "@/components/nutrition/plan-details";

function normalizePlanResponse(response: unknown): NutritionPlan | null {
  if (!response) return null;

  if (typeof response === "object" && !Array.isArray(response)) {
    const data = response as { data?: unknown; result?: unknown };

    if (
      data.data &&
      typeof data.data === "object" &&
      !Array.isArray(data.data)
    ) {
      return data.data as NutritionPlan;
    }

    if (
      data.result &&
      typeof data.result === "object" &&
      !Array.isArray(data.result)
    ) {
      return data.result as NutritionPlan;
    }
  }

  if (typeof response === "object" && !Array.isArray(response)) {
    return response as NutritionPlan;
  }

  return null;
}

async function getNutritionHeroImage(): Promise<string> {
  const fallback = "/feature-nutrition-plan.jpg";

  try {
    const res = await fetch(
      "https://www.themealdb.com/api/json/v1/1/random.php",
      {
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return fallback;

    const data = await res.json();
    const image = data?.meals?.[0]?.strMealThumb;

    return typeof image === "string" && image.length > 0 ? image : fallback;
  } catch {
    return fallback;
  }
}

export default async function NutritionPlanDetailsPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const id = Number(planId);

  if (!Number.isFinite(id)) {
    notFound();
  }

  const [planResponse, heroImage] = await Promise.all([
    getPlanDetails(id).catch(() => null),
    getNutritionHeroImage(),
  ]);

  const plan = normalizePlanResponse(planResponse);

  if (!plan) {
    notFound();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <Navigation />

      {/* Background system */}
      <div className="fixed inset-0 -z-30 bg-[#050505]" />
      <div className="fixed inset-0 -z-20 bg-[linear-gradient(to_bottom,rgba(132,255,0,0.08),transparent_35%,#050505)]" />
      <div className="fixed inset-0 -z-20 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="fixed left-0 top-0 -z-10 h-[520px] w-[520px] rounded-full bg-[#84FF00]/10 blur-[160px]" />
      <div className="fixed bottom-0 right-0 -z-10 h-[520px] w-[520px] rounded-full bg-[#00D9FF]/10 blur-[160px]" />

      <main className="relative z-10 pt-16">
        <section className="relative overflow-hidden">
  <div className="absolute inset-0">
    <img
      src={heroImage}
      alt={plan.name}
      className="h-full w-full object-cover"
    />

    <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-[#050505]/60" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/30" />
  </div>

  <div className="relative container mx-auto px-5 pt-32 pb-24">
    <div className="max-w-4xl">

      <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#84FF00]/30 bg-[#84FF00]/10 px-6 py-3 backdrop-blur-xl">
        <span className="h-2.5 w-2.5 rounded-full bg-[#84FF00] animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#84FF00]">
          Premium Nutrition Program
        </span>
      </div>

      <h1 className="text-5xl font-black leading-none text-white md:text-7xl">
        {plan.name}
      </h1>

      <p className="mt-8 max-w-3xl text-lg leading-8 text-white/70">
        {plan.description}
      </p>

      <div className="mt-10 flex flex-wrap gap-4">

        <div className="rounded-3xl border border-white/10 bg-white/5 px-7 py-5 backdrop-blur-2xl">
          <div className="text-4xl font-black text-[#84FF00]">
            {plan.durationOnWeeks}
          </div>

          <div className="mt-1 text-xs uppercase tracking-[0.25em] text-white/50">
            Weeks
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 px-7 py-5 backdrop-blur-2xl">
          <div className="text-2xl font-black text-[#84FF00]">
            {plan.trainingGoal}
          </div>

          <div className="mt-1 text-xs uppercase tracking-[0.25em] text-white/50">
            Goal
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 px-7 py-5 backdrop-blur-2xl">
          <div className="text-2xl font-black text-[#84FF00]">
            {plan.fitnessLevel}
          </div>

          <div className="mt-1 text-xs uppercase tracking-[0.25em] text-white/50">
            Level
          </div>
        </div>
      </div>
    </div>
  </div>

  <div className="absolute left-0 bottom-0 h-px w-full bg-gradient-to-r from-transparent via-[#84FF00]/40 to-transparent" />
</section>

<section className="relative -mt-20 pb-20">
  <div className="container mx-auto px-5">
    <PlanDetails plan={plan} heroImage={heroImage} />
  </div>
</section>
      </main>
    </div>
  );
}