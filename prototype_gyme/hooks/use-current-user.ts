"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/services/auth";
import { CurrentUser } from "@/types/user";

export function useCurrentUser() {
  const [user, setUser] =
    useState<CurrentUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response: any =
          await getCurrentUser();

        const data =
          response?.data ??
          response;

        if (mounted) {
          setUser(data);
        }
      } catch {
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    user,
    loading,

    isAuthenticated: !!user,

    isTrainee:
      user?.isTrainee ?? false,

    isCoach:
      user?.isCoach ?? false,

    isAdmin:
      user?.isAdmin ?? false,
  };
}