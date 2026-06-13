"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast,ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { User, Phone, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, KeyRound, Copy, ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep]= useState(1);
  const [otp,setOtp]= useState('')
  const [otpres, setotpres] = useState<any>({}); 
   
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reqId,setReqId] = useState('')
  const [notValid, setNotValid] = useState(false)


  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();


    
        //if password does not contain a special character
        if(!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)){  
          toast.error('Password must contain at least one lowercase letter, one uppercase letter, and one number')
          setIsLoading(false)
          return
        }
        
    setIsLoading(true)
    if(!phone){
      toast.error('Enter phone number')
      setIsLoading(false)
      return 
    }
    const res = await fetch('/api/sendOTP',{method:"POST",
      headers:{ "Content-Type": "application/json" },
      body: JSON.stringify({phone}),
    })
    const data = await res.text() 
    const result = JSON.parse(data)
    setotpres(result)
    console.log(data)
   if(result.data.otp){
      setReqId(result.data.otp.requestId)
      setStep(2)
      toast.success('OTP sent successfully')
      setStep(2)
   }else{
      toast.error(result.message)
    }
    setIsLoading(false)
  }



  
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
       
        setIsLoading(true);
        if(password.length < 6){
          toast.error('Password must be at least 6 characters')
          setIsLoading(false)
          return
        }
    
     

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name,
                  email,
                  password,
                  phone,
                  otp,
                  reqId,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }
   
    if(!email || !password){
        toast.error('something went wrong missing email and paddword')
        return
    }

   const Loginres =  await signIn("credentials",{
          email,
          password,
          redirect:false,
             }
             )
            if (Loginres?.error) {
              toast.error(Loginres.error);
            } else {
              toast.success("Account created successfully");
                router.push("/dashboard");
                router.refresh();
            }

         console.log(Loginres)

        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    }

  if (step === 2) {
    return ( 
      <div className="w-full rounded-[24px] border border-slate-100 bg-white p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-9 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <ToastContainer />
        
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-[22px] font-bold tracking-tight text-[#0f172a]">
            Verify your phone  Number
          </h1>
          <p className="mt-1.5 text-[13px] font-medium text-slate-500">
            We need to verify your number before creating your account
          </p>
        </div>

        {/* USSD Instructions Card */}
        <div className="mb-6 rounded-2xl bg-amber-50/70 border border-amber-100 p-5 text-slate-700">
        
          <p className="text-[13px] leading-relaxed text-justify text-slate-600 mb-4">
            A 4-digit verification code has been sent to {phone}, please enter it below
            <br  className="my-2"/>
            Or Dial <span className="text-amber-600 font-bold">{otpres.data?.otp.ussd_code}</span>  to retrieve  the code
          </p>
          
          {/* USSD Code Display & Copy */}
          {/* <div className="flex items-center justify-between rounded-xl bg-white border border-amber-200/60 p-3 shadow-sm">
            <code className="text-base font-bold text-slate-900 font-mono tracking-wide">
              {otpres.data?.otp.ussd_code || "Try resend OTP"}
            </code>
            <button
              type="button"
              disabled={!otpres.data?.otp.ussd_code}
              onClick={() => {
                const code = otpres.data?.otp.ussd_code ;
                navigator.clipboard.writeText(code);
                toast.success("USSD code copied to clipboard!");
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 transition-colors bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1.5 rounded-lg border border-amber-200/50 cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </button>
          </div> */}
        </div>

        {/* OTP Input Form */}
        <div className="space-y-4">
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-4 text-slate-400">
              <Lock className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              minLength={4}
              required
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, "");
                setOtp(val);
              }}
              placeholder="Enter 4-Digit OTP" 
              className="block w-full rounded-xl border border-slate-200 bg-[#f4f5f7] py-3.5 pl-12 pr-4 text-center text-lg font-bold tracking-[0.5em] text-slate-800 placeholder-slate-400 placeholder:tracking-normal outline-none transition-all duration-200 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400"
            />
          </div>

          <div className="flex items-center justify-between px-1 text-[13px]">
           

            <button 
              type="button"
              onClick={()=>setStep(1)}
              disabled={isLoading}
              className="font-bold text-[#fb923c] hover:text-[#f97316] disabled:opacity-50 transition-colors cursor-pointer"
            >
              Resend OTP
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !name || !phone || !email || !password || !otp || otp.length !== 4}
            className="relative mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#fbcb08] hover:bg-[#eab308] py-3.5 px-4 text-sm font-bold text-slate-900 shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
            ) : (
              <>
                Verify & Create Account
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      </div>
    
    );
  }



  return (
    <div className="w-full rounded-[24px] border border-slate-100 bg-white p-7 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-9 animate-in fade-in slide-in-from-bottom-4 duration-500">
<ToastContainer/>
      {/* Title & Subtitle */}
      <div className="mb-6 space-y-1 text-left">
        <h1 className="text-[22px] font-bold tracking-tight text-[#0f172a]">
          Create account
        </h1>
        <p className="text-[13px] font-medium text-slate-500">
          Sign up to get started as a reseller
        </p>
      </div>

      {/* Sign Up Form */}
      <form  className="space-y-4" onSubmit={handleSendOtp}>

        {/* Full Name input */}
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-slate-400">
            <User className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="block w-full rounded-xl border border-slate-200 bg-[#f4f5f7] py-3.5 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* phone input */}
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-4 text-slate-400">
            <Phone className="h-5 w-5" strokeWidth={1.8} />
          </div>
          <input
            type="text"
            required
            autoComplete="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            className="block w-full rounded-xl border border-slate-200 bg-[#f4f5f7] py-3.5 pl-12 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400"
          />
        </div>

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
            placeholder="Email Address"
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
            autoComplete="new-password"
            value={password}
            onChange={(e) =>{
        
              setPassword(e.target.value)}}
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
         {password.length < 8 && ( 
            <div className="text-red-500 text-sm">
              Password must be at least 8 characters long
            </div>
          )}
          {password.length >= 8 && !/[a-z]/.test(password) && ( 
            <div className="text-red-500 text-sm">
              Password must contain at least one lowercase letter
            </div>
          )}
          {password.length >= 8 && !/[A-Z]/.test(password) && ( 
            <div className="text-red-500 text-sm">
              Password must contain at least one uppercase letter
            </div>
          )}
          {password.length >= 8 && !/[0-9]/.test(password) && ( 
            <div className="text-red-500 text-sm">
              Password must contain at least one number
            </div>
          )}




        {/* Yellow Submit CTA (Vibrant Gold from Screenshot) */}
        <button
        type="submit" 
         
          disabled={isLoading || !name || !phone || !email || !password || password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)}
          className="relative flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#fbcb08] hover:bg-[#eab308] py-3.5 px-4 text-sm font-bold text-slate-900 shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-900" />
          ) : (
            <>
              Create Account
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </>
          )}
        </button>
      </form>

      {/* Footer Switch Page link (Orange/Amber text color matching Datamart design) */}
      <p className="mt-6 text-center text-[13px] font-medium text-slate-500">
        Already have an account?{" "}
        <Link
          href="/auth/signIn"
          className="font-bold text-[#fb923c] hover:text-[#f97316] transition-colors"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
