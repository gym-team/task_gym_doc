"use client";

import { useState } from "react";
import {
  CreditCard,
  Wallet,
  Smartphone,
  Banknote,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";

import {
  createMembershipIntent,
  confirmPayment,
  activateMembership,
  Membership,
  MembershipStatus,
} from "@/lib/membership";

type Props = {
  open: boolean;
  plan: Membership | null;
  onClose: () => void;
  onSuccess: (membership: MembershipStatus) => void;
};

const methods = [
  { id: "card", title: "Credit Card", icon: CreditCard },
  { id: "instapay", title: "Instapay", icon: Wallet },
  { id: "vodafone", title: "Vodafone Cash", icon: Smartphone },
  { id: "cash", title: "Cash", icon: Banknote },
];

type FlowState = "idle" | "intent" | "confirm" | "activate" | "success" | "error";

const STEP_LABELS: Record<string, string> = {
  intent: "Creating Payment Intent...",
  confirm: "Confirming Payment...",
  activate: "Activating Membership...",
};

export function PaymentModal({ open, plan, onClose, onSuccess }: Props) {
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [flowState, setFlowState] = useState<FlowState>("idle");
  const [error, setError] = useState("");

  // آخر حالة وصلنا لها بالنجاح، تستخدم في الـ Retry علشان لو حصل error بعد
  // إنشاء الـ intent مثلاً، ما نعيدش إنشاء intent جديد من الصفر
  const [savedIntentId, setSavedIntentId] = useState<string | null>(null);

  const isLoading =
    flowState === "intent" || flowState === "confirm" || flowState === "activate";

  if (!open || !plan) return null;

  function resetAndClose() {
    setFlowState("idle");
    setError("");
    setSavedIntentId(null);
    setSelectedMethod("card");
    onClose();
  }

  async function handlePayment() {
    setError("");

    try {
      let intentId = savedIntentId;

      // الخطوة 1: إنشاء Payment Intent (لو لسه معندناش واحد محفوظ من محاولة سابقة)
      if (!intentId) {
        setFlowState("intent");
        const intent = await createMembershipIntent(plan.id);
        intentId = intent.paymentIntentId;
        setSavedIntentId(intentId);
      }

      // الخطوة 2: تأكيد الدفع
      setFlowState("confirm");
      await confirmPayment(intentId);

      // الخطوة 3: تفعيل الاشتراك
      setFlowState("activate");
      const membership = await activateMembership(plan.id, intentId);

      setFlowState("success");
      onSuccess(membership);

      setTimeout(() => {
        resetAndClose();
      }, 1400);
    } catch (err: any) {
      setFlowState("error");
      setError(err?.message ?? "حدث خطأ ما، حاول مرة أخرى.");
    }
  }

  function handleRetry() {
    setError("");
    handlePayment();
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) resetAndClose();
      }}
    >
      <div className="w-full max-w-xl rounded-3xl border border-[#84FF00]/20 bg-[#090909] p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">Payment</h2>

          <button
            disabled={isLoading}
            onClick={resetAndClose}
            className="text-zinc-400 hover:text-white transition disabled:opacity-40"
          >
            <X size={22} />
          </button>
        </div>

        {/* Plan Summary */}
        <div className="mt-8 rounded-xl bg-black/40 border border-zinc-800 p-5">
          <div className="flex justify-between">
            <span className="text-zinc-400">Plan</span>
            <span className="font-bold text-white">{plan.name}</span>
          </div>

          <div className="mt-3 flex justify-between">
            <span className="text-zinc-400">Duration</span>
            <span className="text-white">{plan.title}</span>
          </div>

          <div className="mt-3 flex justify-between">
            <span className="text-zinc-400">Total</span>
            <span className="text-2xl font-black text-[#84FF00]">
              {plan.price} EGP
            </span>
          </div>
        </div>

        {/* Payment Methods - مخفية بعد النجاح */}
        {flowState !== "success" && (
          <>
            <h3 className="mt-8 mb-4 text-white font-semibold">Payment Method</h3>

            <div className="grid grid-cols-2 gap-4">
              {methods.map((method) => {
                const Icon = method.icon;
                const active = selectedMethod === method.id;

                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    disabled={isLoading}
                    className={`rounded-xl border p-5 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      active
                        ? "border-[#84FF00] bg-[#84FF00]/10"
                        : "border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <Icon className="mb-3 h-6 w-6 text-[#84FF00]" />
                    <p className="text-white">{method.title}</p>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mt-8 rounded-xl bg-[#84FF00]/10 border border-[#84FF00]/20 p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-[#84FF00]" />
              <span className="text-white">{STEP_LABELS[flowState]}</span>
            </div>
          </div>
        )}

        {/* Success State */}
        {flowState === "success" && (
          <div className="mt-8 rounded-xl border border-green-500/30 bg-green-500/10 p-6 flex flex-col items-center text-center gap-3">
            <CheckCircle2 className="text-green-400 h-12 w-12" />
            <span className="font-semibold text-green-300 text-lg">
              Membership Activated Successfully
            </span>
            <span className="text-zinc-400 text-sm">
              Welcome to {plan.name}! Your plan is now active.
            </span>
          </div>
        )}

        {/* Error State */}
        {flowState === "error" && error && (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
            <div className="flex gap-3">
              <XCircle className="text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-red-300 block">{error}</span>
                <button
                  onClick={handleRetry}
                  className="mt-3 text-sm font-bold text-[#84FF00] hover:underline"
                >
                  Retry Payment →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pay Button - مخفي بعد النجاح */}
        {flowState !== "success" && (
          <button
            disabled={isLoading}
            onClick={handlePayment}
            className="mt-8 h-14 w-full rounded-xl bg-[#84FF00] text-black font-bold transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          >
            {isLoading ? "Processing..." : `Pay ${plan.price} EGP`}
          </button>
        )}
      </div>
    </div>
  );
}