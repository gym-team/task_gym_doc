export type Gender = "Male" | "Female";

export type Trainee = {
  id: number;
  fullName: string;
  email: string;
  photoUrl: string | null;
  gender: Gender;
  dateOfBirth: string;
  weight: number;
  height: number;
  address: string;
};

export type UpdateTraineePayload = {
  gender: Gender;
  weight: number;
  height: number;
  address: string;
  dateOfBirth: string;
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
        GET CURRENT TRAINEE PROFILE
===================================== */

export async function getMyProfile(): Promise<Trainee> {
  const res = await fetch(`${API_URL}/api/Trainee/me`, {
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load profile");
  }

  return res.json();
}

/* =====================================
        UPDATE CURRENT TRAINEE PROFILE
===================================== */

export async function updateMyProfile(
  payload: UpdateTraineePayload
): Promise<Trainee> {
  const res = await fetch(`${API_URL}/api/Trainee/me`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to update profile");
  }

  // الـ PUT في بعض الـ APIs بيرجع 204 No Content، فبنتعامل مع الحالتين
  const text = await res.text();
  return text ? JSON.parse(text) : (payload as unknown as Trainee);
}