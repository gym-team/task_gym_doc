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
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-5">
            <div className="mx-auto max-w-6xl">
              <div className="mb-10 text-center">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#84FF00]/20 bg-[#84FF00]/10 px-5 py-2 backdrop-blur-xl">
                  <div className="h-2 w-2 rounded-full bg-[#84FF00]" />
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#84FF00]">
                    Elite Nutrition Protocol
                  </span>
                </div>

                <h1 className="mx-auto max-w-5xl text-4xl font-black uppercase tracking-tight text-white md:text-6xl xl:text-7xl">
                  {plan.name}
                </h1>

                <p className="mx-auto mt-6 max-w-4xl text-base leading-8 text-white/70 md:text-lg">
                  {plan.description}
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 backdrop-blur-xl">
                    <div className="text-3xl font-black text-[#84FF00]">
                      {plan.durationWeeks}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/55">
                      Weeks
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 backdrop-blur-xl">
                    <div className="text-3xl font-black text-[#84FF00]">
                      {plan.trainingGoal}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/55">
                      Goal
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 backdrop-blur-xl">
                    <div className="text-3xl font-black text-[#84FF00]">
                      {plan.fitnessLevel}
                    </div>
                    <div className="text-xs uppercase tracking-[0.2em] text-white/55">
                      Level
                    </div>
                  </div>
                </div>
              </div>

              <PlanDetails plan={plan} heroImage={heroImage} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}