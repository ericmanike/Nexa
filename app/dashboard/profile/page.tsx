"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../DashboardContext";
import {
  User,
  Mail,
  Smartphone,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Key,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function ProfilePage() {
  const { data, setData } = useDashboard();

  // Account form states
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountSuccess, setAccountSuccess] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);

  // Password form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Initialize form fields with user data from context
  useEffect(() => {
    if (data && data.user) {
      setFullName(data.user.name || "");
      setEmailAddress(data.user.email || "");
      setPhoneNumber(data.user.phone || "");
    }
  }, [data]);

  if (!data) return null;

  const user = data.user || { name: "User", email: "guest@dakazina.com", role: "user", walletBalance: 0 };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError(null);
    setAccountSuccess(null);

    if (!fullName.trim()) {
      setAccountError("Full Name is required.");
      return;
    }
    if (!emailAddress.trim()) {
      setAccountError("Email Address is required.");
      return;
    }

    setIsSavingAccount(true);
    try {
      // 1.5s visual mock saver loader
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update context dynamically so user info updates across the entire site/header!
      if (setData) {
        setData({
          ...data,
          user: {
            ...data.user,
            name: fullName,
            email: emailAddress,
            phone: phoneNumber
          }
        });
      }

      setAccountSuccess("Account information updated successfully.");
    } catch (err: any) {
      setAccountError(err.message || "Failed to save account details.");
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      // 1.5s visual mock password changer
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setPasswordSuccess("Your password has been changed successfully.");
      
      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Dynamic User Profile Title Info */}
      <div className="mb-2 select-none">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Profile & Security Settings</h2>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage your personal credentials, contact numbers and account authentication security parameters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* PANEL 1: ACCOUNT INFORMATION */}
        <div className="bg-white rounded-[10px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          
          {/* Card Header Top Bar */}
          <div className="bg-slate-50/70 border-b border-slate-100 py-4 px-6 flex items-center gap-2.5 select-none">
            <Smartphone size={16} className="text-slate-800 shrink-0" />
            <h3 className="font-bold text-slate-800 text-sm tracking-tight">
              Account Information
            </h3>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSaveAccount} className="space-y-5">
              
              {accountSuccess && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-100 flex gap-2.5 items-start animate-in fade-in duration-200">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{accountSuccess}</span>
                </div>
              )}

              {accountError && (
                <div className="p-3.5 bg-red-50 text-red-800 text-xs font-bold rounded-2xl border border-red-100 flex gap-2.5 items-start animate-in fade-in duration-200">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <span>{accountError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5 select-none">
                  Full Name <span className="text-red-500 font-black">*</span>
                </label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter Full Name"
                    className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5 select-none">
                  Email Address <span className="text-red-500 font-black">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-4 text-slate-400 shrink-0" />
                  <input
                    type="email"
                    required
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="Enter Email Address"
                    className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5 select-none">
                  Phone Number
                </label>
                <div className="relative flex items-center">
                  <Smartphone size={16} className="absolute left-4 text-slate-400 shrink-0" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="0241234567"
                    className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-semibold pl-1 select-none">
                  Optional: 10-digit Ghana number
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSavingAccount || !fullName.trim() || !emailAddress.trim()}
                className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 select-none shadow-sm cursor-pointer ${
                  fullName.trim() && emailAddress.trim() && !isSavingAccount
                    ? "bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.99] hover:shadow-md"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isSavingAccount ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 text-white" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} /> Save Changes
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* PANEL 2: SECURITY SETTINGS */}
        <div className="bg-white rounded-[10px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          
          {/* Card Header Top Bar */}
          <div className="bg-slate-50/70 border-b border-slate-100 py-4 px-6 flex items-center gap-2.5 select-none">
            <Shield size={16} className="text-slate-800 shrink-0" />
            <h3 className="font-bold text-slate-800 text-sm tracking-tight">
              Security Settings
            </h3>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleChangePassword} className="space-y-5">
              
              {passwordSuccess && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-100 flex gap-2.5 items-start animate-in fade-in duration-200">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3.5 bg-red-50 text-red-800 text-xs font-bold rounded-2xl border border-red-100 flex gap-2.5 items-start animate-in fade-in duration-200">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5 select-none">
                  Current Password <span className="text-red-500 font-black">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-4 text-slate-400 shrink-0" />
                  <input
                    type={showCurrent ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter Current Password"
                    className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5 select-none">
                  New Password <span className="text-red-500 font-black">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-4 text-slate-400 shrink-0" />
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter New Password"
                    className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-semibold pl-1 select-none">
                  Minimum 6 characters
                </p>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5 select-none">
                  Confirm New Password <span className="text-red-500 font-black">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-4 text-slate-400 shrink-0" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-xs font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isChangingPassword || !currentPassword || newPassword.length < 6 || newPassword !== confirmPassword}
                className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all duration-200 select-none shadow-sm cursor-pointer ${
                  currentPassword && newPassword.length >= 6 && newPassword === confirmPassword && !isChangingPassword
                    ? "bg-red-600 hover:bg-red-700 text-white active:scale-[0.99] hover:shadow-md"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 text-white" /> Changing Password...
                  </>
                ) : (
                  <>
                    <Key size={15} /> Change Password
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
