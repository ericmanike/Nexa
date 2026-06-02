"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Check, Loader2, ArrowRight } from "lucide-react";



export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();


      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
       
        setIsLoading(true);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                toast.error(res.error);
            } else {
              toast.success("Login Successful");
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err: any) {
            toast.error("Too many attempts , try again later");
        } finally {
            setIsLoading(false);
        }
    };
  return (
    <div className="w-full rounded-[24px] border border-slate-100 bg-white p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-9 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ToastContainer />
      {/* Title & Subtitle */}
      <div className="mb-6 space-y-1 text-left">
        <h1 className="text-[22px] font-bold tracking-tight text-[#0f172a]">
          Welcome back
        </h1>
        <p className="text-[13px] font-medium text-slate-500">
          Sign in to your account
        </p>
      </div>

      {/* Sign In Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Email input */}
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-slate-400">
            <Mail className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="block w-full rounded-xl border border-slate-200 bg-[#f4f5f7] py-3.5 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* Password Input */}
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-slate-400">
            <Lock className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="block w-full rounded-xl border border-slate-200 bg-[#f4f5f7] py-3.5 pl-12 pr-12 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400"
          />
          {/* Password Visibility Toggle */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 z-10 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" strokeWidth={1.8} />
            ) : (
              <Eye className="h-5 w-5" strokeWidth={1.8} />
            )}
          </button>
        </div>

        {/* Remember me Checkbox & Forgot Password */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="relative flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-4.5 w-4.5 rounded bg-white border border-slate-300 peer-checked:bg-[#1e3a8a] peer-checked:border-[#1e3a8a] flex items-center justify-center transition-all peer-focus:ring-2 peer-focus:ring-slate-300">
              <Check className="h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
            </div>
            <span className="ml-2.5 text-[13px] font-medium text-slate-600 hover:text-slate-800 transition-colors">
              Remember me
            </span>
          </label>

          <Link
            href="/auth/forgot-password"
            className="text-[13px] font-bold text-[#fb923c] hover:text-[#f97316] transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Yellow Submit CTA (Vibrant Gold from Screenshot) */}
        <button
          type="submit"
          disabled={isLoading}
          className="relative flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#fbcb08] hover:bg-[#eab308] py-3.5 px-4 text-sm font-bold text-slate-900 shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
          ) : (
            <>
            <Link href={'/dashboard'} className="flex gap-3">
              Sign In
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
            </>
          )}
        </button>
      </form>

      {/* Footer Switch Page link (Orange/Amber text color matching Datamart design) */}
      <p className="mt-6 text-center text-[13px] font-medium text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signUp"
          className="font-bold text-[#fb923c] hover:text-[#f97316] transition-colors"
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
