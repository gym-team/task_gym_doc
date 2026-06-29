export type Membership = {
  id: number;
  name: string;
  description: string;
  price: number;
  title: string;
};

export type MembershipStatus = {
  isActive: boolean;
  membershipPlanId: number;
  planTitle: string;
  membershipName: string;
  isPremium: boolean;
  startDate: string;
  endDate: string;
};

export type PaymentIntent = {
  paymentIntentId: string;
  membershipPlanId: number;
  amount: number;
  currency: string;
  status: string;
};

export type PaymentConfirm = {
  paymentIntentId: string;
  status: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

function getHeaders() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || localStorage.getItem("accessToken")
      : null;

  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
}

/* =====================================
        MEMBERSHIP PLANS
===================================== */

export async function getMemberships(): Promise<Membership[]> {
  const res = await fetch(`${API_URL}/api/Membership`, {
    cache: "no-store",
    headers: getHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to load memberships");
  }

  return res.json();
}

/* =====================================
        CURRENT MEMBERSHIP
===================================== */

export async function getMyMembership(): Promise<MembershipStatus | null> {
  const res = await fetch(`${API_URL}/api/Membership/me`, {
    headers: getHeaders(),
    cache: "no-store",
  });

  // مفيش اشتراك للمستخدم لسه، ده مش error
  if (res.status === 404) {
    return null;
  }

  // المستخدم مش مسجل دخول، عاملينها زي مفيش اشتراك بدل ما نرمي error
  if (res.status === 401) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch membership");
  }

  return res.json();
}

/* =====================================
        CREATE PAYMENT INTENT
===================================== */

export async function createMembershipIntent(
  membershipPlanId: number
): Promise<PaymentIntent> {
  const res = await fetch(
    `${API_URL}/api/Payment/membership-intent/${membershipPlanId}`,
    {
      method: "POST",
      headers: getHeaders(),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to create payment intent");
  }

  return res.json();
}

/* =====================================
        CONFIRM PAYMENT
===================================== */

export async function confirmPayment(
  paymentIntentId: string
): Promise<PaymentConfirm> {
  const res = await fetch(`${API_URL}/api/Payment/confirm`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      paymentIntentId,
    }),
  });

  if (!res.ok) {
    throw new Error("Payment confirmation failed");
  }

  return res.json();
}

/* =====================================
        ACTIVATE MEMBERSHIP
===================================== */

export async function activateMembership(
  membershipPlanId: number,
  paymentIntentId: string
): Promise<MembershipStatus> {
  const res = await fetch(`${API_URL}/api/Membership/activate`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      membershipPlanId,
      paymentIntentId,
    }),
  });

  if (!res.ok) {
    throw new Error("Membership activation failed");
  }

  return res.json();
}

/* =====================================
        COMPLETE FLOW
===================================== */

export async function purchaseMembership(
  membershipPlanId: number
): Promise<MembershipStatus> {
  // 1. Create payment intent
  const intent = await createMembershipIntent(membershipPlanId);

  // 2. Confirm payment
  await confirmPayment(intent.paymentIntentId);

  // 3. Activate membership
  return activateMembership(membershipPlanId, intent.paymentIntentId);
}