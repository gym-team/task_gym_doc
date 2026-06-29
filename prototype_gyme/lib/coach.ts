const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "https://fitzone-16.runasp.net";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || localStorage.getItem("accessToken") || "";
}

// شكل الـ response الكامل من GET /api/Coach/me
export interface Coach {
  id: number;
  fullName: string;
  about: string;
  yearsOfExperience: number;
  rating: number;
  price: number;
  photoUrl: string | null;
  programCount: number;
}

// الحقول اللي PUT /api/Coach/me بتقبلها فعليًا.
// fullName / rating / photoUrl / programCount مش موجودين هنا لأن
// السيرفر لا يستقبلهم ولا يرجعهم في الـ PUT response
export interface CoachUpdateInput {
  about: string;
  yearsOfExperience: number;
  price: number;
}

// الـ PUT برجع بس الحقول اللي حدثها (about, yearsOfExperience, price)
export type CoachUpdateResponse = CoachUpdateInput;

export async function getMyCoachProfile(): Promise<Coach> {
  const token = getToken();
  if (!token) throw new Error("No auth token found. Please log in again.");

  const res = await fetch(`${API_URL}/api/Coach/me`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  return (await res.json()) as Coach;
}

export async function updateMyCoachProfile(
  data: CoachUpdateInput
): Promise<CoachUpdateResponse> {
  const token = getToken();
  if (!token) throw new Error("No auth token found. Please log in again.");

  const res = await fetch(`${API_URL}/api/Coach/me`, {
    method: "PUT",
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  // بعض endpoints الـ PUT بترجع 204 No Content أو body فاضي،
  // فبنتعامل مع الحالتين بدل ما نفترض إن فيه JSON دايمًا
  const text = await res.text();
  if (!text) {
    return data;
  }

  try {
    return JSON.parse(text) as CoachUpdateResponse;
  } catch {
    return data;
  }
}