"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TrainerDetail, Trainer } from "@/components/trainers/trainer-detail";

export default function TrainerPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function getTrainer() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/Coach/${id}`
        );

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        setTrainer(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) getTrainer();
  }, [id]);

  // 🔄 Loading
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  // ❌ Error
  if (error || !trainer) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-red-500">
        Trainer not found
      </div>
    );
  }

  return <TrainerDetail trainer={trainer} />;
}