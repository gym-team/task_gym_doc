"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Eye, EyeOff, Dumbbell, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://fitzonetrack931-1.runasp.net";

export function RegisterForm() {
  const { toast } = useToast();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const setField = (key: string, value: string) => {
    setFormData((p) => ({ ...p, [key]: value }));
  };

  const setErrorsFromApi = (apiData: any) => {
    const newErrors: { [k: string]: string } = {};
    if (!apiData) return newErrors;

    if (apiData.errors && typeof apiData.errors === "object") {
      for (const k of Object.keys(apiData.errors)) {
        const v = apiData.errors[k];
        newErrors[k] = Array.isArray(v) ? String(v[0]) : String(v);
      }
    } else if (apiData.message) {
      newErrors["general"] = String(apiData.message);
    }

    return newErrors;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors: { [k: string]: string } = {};

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";

    if (!formData.confirmEmail)
      newErrors.confirmEmail = "Please confirm your email";
    else if (formData.email !== formData.confirmEmail)
      newErrors.confirmEmail = "Emails do not match";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const form = new FormData();
      form.append("FirstName", formData.firstName);
      form.append("LastName", formData.lastName);
      form.append("Email", formData.email);
      form.append("Password", formData.password);

      if (profileImage) {
        const blob = await fetch(profileImage).then((r) => r.blob());
        form.append("Photo", blob, "profile.jpg");
      }

      const res = await fetch(`${API_URL}/api/Account/Register`, {
        method: "POST",
        body: form,
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
              resJson?.message || resJson?.error || "Registration failed",
            variant: "destructive",
          });
        }

        return;
      }

      toast({
        title: "Account Created 🎉",
        description: "Welcome to FitZone!",
      });

      setTimeout(() => router.push("/"), 900);
    } catch (err) {
      console.error("Register error:", err);
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div
        className={`max-w-sm sm:max-w-md lg:max-w-lg mx-auto transition-all duration-1000 ease-out ${
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
          <h1 className="text-4xl font-black text-white mb-2">Join FitZone</h1>
          <p className="text-gray-400">
            Create your account and start your transformation
          </p>
        </div>

        {/* Register Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-[0_0_0.5px_0.5px_#84FF00] backdrop-blur-xl"
        >
          {/* Profile Picture */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-white mb-2">
              Profile Picture (Optional)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-white/10 overflow-hidden flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:border-[#84FF00]/50 transition-colors">
                  <Upload className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Upload Photo</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* First + Last on same row */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2">
              <label
                htmlFor="firstName"
                className="block text-sm font-bold text-white mb-2"
              >
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setField("firstName", e.target.value)}
                  className={`w-full bg-white/5 border ${errors.firstName ? "border-red-500" : "border-white/10"} rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#84FF00] transition-colors`}
                  placeholder="John"
                />
              </div>
              {errors.firstName && (
                <p className="text-red-400 text-sm mt-2">{errors.firstName}</p>
              )}
            </div>

            <div className="w-full sm:w-1/2">
              <label
                htmlFor="lastName"
                className="block text-sm font-bold text-white mb-2"
              >
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setField("lastName", e.target.value)}
                  className={`w-full bg-white/5 border ${errors.lastName ? "border-red-500" : "border-white/10"} rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#84FF00] transition-colors`}
                  placeholder="Doe"
                />
              </div>
              {errors.lastName && (
                <p className="text-red-400 text-sm mt-2">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm font-bold text-white mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setField("email", e.target.value)}
                className={`w-full bg-white/5 border ${errors.email ? "border-red-500" : "border-white/10"} rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#84FF00] transition-colors`}
                placeholder="your@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm mt-2">{errors.email}</p>
            )}
          </div>

          {/* Confirm Email */}
          <div className="mb-6">
            <label
              htmlFor="confirmEmail"
              className="block text-sm font-bold text-white mb-2"
            >
              Confirm Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="confirmEmail"
                type="email"
                value={formData.confirmEmail}
                onChange={(e) => setField("confirmEmail", e.target.value)}
                className={`w-full bg-white/5 border ${errors.confirmEmail ? "border-red-500" : "border-white/10"} rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#84FF00] transition-colors`}
                placeholder="Re-enter your email"
              />
            </div>
            {errors.confirmEmail && (
              <p className="text-red-400 text-sm mt-2">{errors.confirmEmail}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-bold text-white mb-2"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setField("password", e.target.value)}
                className={`w-full bg-white/5 border ${errors.password ? "border-red-500" : "border-white/10"} rounded-xl pl-12 pr-12 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#84FF00] transition-colors`}
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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

          {/* Confirm Password */}
          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-bold text-white mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)}
                className={`w-full bg-white/5 border ${errors.confirmPassword ? "border-red-500" : "border-white/10"} rounded-xl pl-12 pr-12 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#84FF00] transition-colors`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-2">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#84FF00] text-black hover:bg-[#84FF00]/90 font-bold text-lg h-12 mb-4"
          >
            {isLoading ? "Creating..." : "Create Account"}
          </Button>

          {/* Divider + Login link */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-gray-400">OR</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#84FF00] hover:text-[#84FF00]/80 font-bold transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
