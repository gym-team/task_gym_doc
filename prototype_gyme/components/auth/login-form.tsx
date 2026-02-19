"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://fitzonetrack.runasp.net";

const REDIRECT_AFTER_LOGIN = "/membership";

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const setField = (key: string, value: string) =>
    setFormData((p) => ({ ...p, [key]: value }));

  const setErrorsFromApi = (apiData: any) => {
    const newErrors: { [k: string]: string } = {};
    if (!apiData) return newErrors;

    if (apiData.errors && typeof apiData.errors === "object") {
      for (const k of Object.keys(apiData.errors)) {
        const v = apiData.errors[k];
        newErrors[k] =
          Array.isArray(v) && v.length > 0 ? String(v[0]) : String(v);
      }
    } else if (apiData.message) {
      newErrors["general"] = String(apiData.message);
    } else if (typeof apiData === "string") {
      newErrors["general"] = apiData;
    }

    return newErrors;
  };

  const validateForm = () => {
    const newErrors: { [k: string]: string } = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch(`${API_URL}/api/Account/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const resJson = await res.json().catch(() => null);

      if (!res.ok) {
        const apiErrors = setErrorsFromApi(resJson);

        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
          toast({
            title: "Validation Error",
            description: "Fix the highlighted fields",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description:
              resJson?.message || resJson?.error || "Login failed",
            variant: "destructive",
          });
        }
        return;
      }

      // store token if returned
      if (resJson?.token) {
        if (rememberMe)
          localStorage.setItem("token", resJson.token);
        else
          sessionStorage.setItem("token", resJson.token);
      }

      toast({
        title: "Login successful 🎉",
        description: "Welcome back to FitZone!",
      });

      setTimeout(() => router.push(REDIRECT_AFTER_LOGIN), 700);
    } catch (err) {
      console.error("Login error:", err);
      toast({
        title: "Network Error",
        description: "Couldn't reach the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

return (
    <div className="container mx-auto px-4 py-16">
      <div
        className={`max-w-md mx-auto transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Dumbbell className="h-10 w-10 text-[#84FF00]" />
            <span className="text-3xl font-black text-white">
              FIT<span className="text-[#84FF00]">ZONE</span>
            </span>
          </Link>
          <h1 className="text-4xl font-black text-white mb-2">Welcome Back</h1>
          <p className="text-white">Login to continue your fitness journey</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 border border-white/10 rounded-2xl p-8 shadow-[0_0_0.5px_0.5px_#84FF00] backdrop-blur-xl"
        >
          {/* General API error (non-field) */}
          {errors.general && (
            <div className="mb-4 rounded-md bg-red-600/10 border border-red-500 p-3 text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          {/* Email Field */}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-bold text-white mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setField("email", e.target.value)}
                className={`w-full bg-white/5 border ${errors.email ? "border-red-500" : "border-white/10"} rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white focus:outline-none focus:border-[#84FF00] transition-colors`}
                placeholder="your@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-2">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-bold text-white mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={(e) => setField("password", e.target.value)}
                className={`w-full bg-white/5 border ${errors.password ? "border-red-500" : "border-white/10"} rounded-xl pl-12 pr-12 py-3 text-white placeholder:text-white focus:outline-none focus:border-[#84FF00] transition-colors`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-2">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-right mb-6">
            <Link
              href="/forgot-password"
              className="text-sm text-[#84FF00] hover:text-[#84FF00]/80 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Remember Me */}
          <div className="flex items-center mb-6">
            <label className="flex items-center gap-3 cursor-pointer select-none relative">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="peer h-5 w-5 appearance-none rounded-md border-2 border-[#84FF00] bg-black/40 checked:bg-[#84FF00] transition-all duration-200"
              />
              <svg
                className="absolute pointer-events-none hidden peer-checked:block ml-[2px]"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-sm text-white">Remember Me</span>
            </label>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#84FF00] text-black hover:bg-[#84FF00]/90 font-bold text-lg h-12 mb-4"
          >
            {isLoading ? "Signing in..." : "Login"}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-white">OR</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-white">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-[#84FF00] hover:text-[#84FF00]/80 font-bold transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
