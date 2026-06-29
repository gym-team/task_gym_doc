"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, CreditCard, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";

type Plan = {
  id: number;
  name: string;
  price: number;
  title: string;
  description?: string;
};

type MembershipIntentResponse = {
  paymentIntentId: string;
  membershipPlanId: number;
  amount: number;
  currency: string;
  status: string;
};

type ConfirmResponse = {
  success?: boolean;
  message?: string;
};

type ActivateResponse = {
  isActive: boolean;
  membershipPlanId: number;
  planTitle: string;
  membershipName: string;
  isPremium: boolean;
  startDate: string;
  endDate: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://fitzonetrack931-1.runasp.net";

function getAuthHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB");
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planIdFromQuery = searchParams.get("planId");
  const initialPlanId = planIdFromQuery ? Number(planIdFromQuery) : null;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(
    initialPlanId
  );

  const [intent, setIntent] = useState<MembershipIntentResponse | null>(null);
  const [activateResult, setActivateResult] = useState<ActivateResponse | null>(null);
  const [confirmResult, setConfirmResult] = useState<ConfirmResponse | null>(null);

  const [step, setStep] = useState<
    "idle" | "intent" | "confirming" | "activating" | "done" | "error"
  >("idle");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoadingPlans(true);
        const res = await fetch(`${API_URL}/api/Membership/Plans`, {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to load plans");

        const data = await res.json();
        setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("تعذر تحميل الخطط.");
      } finally {
        setLoadingPlans(false);
      }
    }

    loadPlans();
  }, []);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) ?? null,
    [plans, selectedPlanId]
  );

  async function createIntent() {
    if (!selectedPlanId) {
      setError("اختار خطة أولًا.");
      return;
    }

    try {
      setError(null);
      setStep("intent");
      setActivateResult(null);
      setConfirmResult(null);
      setIntent(null);

      const res = await fetch(
        `${API_URL}/api/Payment/membership-intent/${selectedPlanId}`,
        {
          method: "POST",
          headers: {
            ...getAuthHeaders(),
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to create payment intent");
      }

      const data: MembershipIntentResponse = await res.json();
      setIntent(data);
      setStep("idle");
    } catch (err) {
      console.error(err);
      setError("فشل إنشاء Payment Intent.");
      setStep("error");
    }
  }

  async function confirmAndActivate() {
    if (!selectedPlanId || !intent?.paymentIntentId) {
      setError("اعمل إنشاء للدفع أولًا.");
      return;
    }

    try {
      setError(null);
      setStep("confirming");

      const confirmRes = await fetch(`${API_URL}/api/Payment/confirm`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          paymentIntentId: intent.paymentIntentId,
        }),
      });

      if (!confirmRes.ok) {
        throw new Error("Payment confirm failed");
      }

      const confirmData: ConfirmResponse = await confirmRes.json();
      setConfirmResult(confirmData);

      setStep("activating");

      const activateRes = await fetch(`${API_URL}/api/Membership/activate`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          membershipPlanId: selectedPlanId,
          paymentIntentId: intent.paymentIntentId,
        }),
      });

      if (!activateRes.ok) {
        throw new Error("Membership activation failed");
      }

      const activateData: ActivateResponse = await activateRes.json();
      setActivateResult(activateData);
      setStep("done");

      setTimeout(() => {
        router.push("/membership");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("حصلت مشكلة أثناء تأكيد الدفع أو تفعيل الاشتراك.");
      setStep("error");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href="/membership"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-[#84FF00] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Membership
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#84FF00]/30 bg-[#84FF00]/10 px-4 py-2 text-sm text-[#84FF00]">
            <ShieldCheck size={16} />
            Secure Checkout
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
            <div className="mb-6">
              <h1 className="text-3xl font-black md:text-4xl">
                Complete Your <span className="text-[#84FF00]">Payment</span>
              </h1>
              <p className="mt-3 text-sm text-gray-400">
                اختر الخطة ثم أنشئ الـ payment intent وبعدها أكد الدفع وفعّل الاشتراك.
              </p>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-2">
              {loadingPlans ? (
                <>
                  <div className="h-28 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
                  <div className="h-28 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
                </>
              ) : plans.length ? (
                plans.map((plan) => {
                  const isSelected = plan.id === selectedPlanId;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        setIntent(null);
                        setActivateResult(null);
                        setConfirmResult(null);
                        setError(null);
                        setStep("idle");
                      }}
                      className={`rounded-2xl border p-5 text-left transition-all duration-300 ${
                        isSelected
                          ? "border-[#84FF00] bg-[#84FF00]/10 shadow-[0_0_25px_rgba(132,255,0,0.18)]"
                          : "border-white/10 bg-white/5 hover:border-[#84FF00]/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold">{plan.name}</h3>
                          <p className="mt-1 text-sm text-gray-400">{plan.title}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-[#84FF00]">
                            ${plan.price}
                          </div>
                        </div>
                      </div>

                      {plan.description ? (
                        <p className="mt-4 text-sm leading-relaxed text-gray-300">
                          {plan.description}
                        </p>
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-gray-400">
                  لا توجد خطط متاحة حاليًا.
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={createIntent}
                disabled={!selectedPlanId || loadingPlans || step === "intent"}
                className="inline-flex items-center gap-2 rounded-xl bg-[#84FF00] px-5 py-3 font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              >
                {step === "intent" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CreditCard size={18} />
                )}
                Create Payment Intent
              </button>

              <button
                type="button"
                onClick={confirmAndActivate}
                disabled={!intent?.paymentIntentId || step === "confirming" || step === "activating"}
                className="inline-flex items-center gap-2 rounded-xl border border-[#84FF00]/40 bg-black/40 px-5 py-3 font-bold text-[#84FF00] transition-colors hover:bg-[#84FF00] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {step === "confirming" || step === "activating" ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                Confirm & Activate
              </button>

              <Link
                href="/membership"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white transition-colors hover:border-white/25 hover:bg-white/10"
              >
                Cancel
              </Link>
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {intent ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5">
                <h3 className="mb-3 text-lg font-bold text-[#84FF00]">
                  Payment Intent Created
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p><span className="text-gray-500">paymentIntentId:</span> {intent.paymentIntentId}</p>
                  <p><span className="text-gray-500">membershipPlanId:</span> {intent.membershipPlanId}</p>
                  <p><span className="text-gray-500">amount:</span> {intent.amount}</p>
                  <p><span className="text-gray-500">currency:</span> {intent.currency}</p>
                  <p><span className="text-gray-500">status:</span> {intent.status}</p>
                </div>
              </div>
            ) : null}

            {confirmResult ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-5 text-sm text-gray-300">
                <p className="font-bold text-[#84FF00]">Confirm Result</p>
                <pre className="mt-3 overflow-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(confirmResult, null, 2)}
                </pre>
              </div>
            ) : null}

            {activateResult ? (
              <div className="mt-6 rounded-2xl border border-[#84FF00]/30 bg-[#84FF00]/10 p-5">
                <h3 className="mb-3 text-lg font-bold text-[#84FF00]">
                  Membership Activated
                </h3>
                <div className="space-y-2 text-sm text-white">
                  <p>Plan: {activateResult.membershipName}</p>
                  <p>Title: {activateResult.planTitle}</p>
                  <p>Status: {activateResult.isActive ? "Active" : "Inactive"}</p>
                  <p>Premium: {activateResult.isPremium ? "Yes" : "No"}</p>
                  <p>Start: {formatDate(activateResult.startDate)}</p>
                  <p>End: {formatDate(activateResult.endDate)}</p>
                </div>
              </div>
            ) : null}

            {step === "done" ? (
              <div className="mt-6 rounded-2xl border border-[#84FF00]/30 bg-[#84FF00]/10 p-4 text-sm text-[#84FF00]">
                تم التفعيل بنجاح، سيتم تحويلك إلى صفحة العضوية.
              </div>
            ) : null}
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black">
              Order <span className="text-[#84FF00]">Summary</span>
            </h2>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-sm text-gray-400">Selected Plan</p>
                <p className="mt-1 text-lg font-bold">
                  {selectedPlan ? selectedPlan.name : "No plan selected"}
                </p>
                <p className="text-sm text-gray-300">
                  {selectedPlan ? selectedPlan.title : "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-sm text-gray-400">Price</p>
                <p className="mt-1 text-3xl font-black text-[#84FF00]">
                  {selectedPlan ? `$${selectedPlan.price}` : "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-sm text-gray-400">Flow</p>
                <ol className="mt-3 space-y-2 text-sm text-gray-300">
                  <li>1. Create payment intent</li>
                  <li>2. Confirm payment</li>
                  <li>3. Activate membership</li>
                  <li>4. Redirect to membership page</li>
                </ol>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}