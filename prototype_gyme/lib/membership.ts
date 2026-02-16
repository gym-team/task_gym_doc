export type Membership = {
  id: number
  name: string
  description: string
  price: number
  title: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL!

export async function getMemberships(): Promise<Membership[]> {
  const res = await fetch(`${API_URL}/api/Membership`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch memberships")
  }

  return res.json()
}
