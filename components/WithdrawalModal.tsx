"use client";

import { useState } from "react";
import { Loader2, X, Wallet, MessageSquare, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import clsx from "clsx";

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    maxAmount: number;
    onSuccess: (amount: number) => void;
}

export default function WithdrawalModal({ isOpen, onClose, maxAmount, onSuccess }: WithdrawalModalProps) {
    const [amount, setAmount] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [momoName, setMomoName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const val = parseFloat(amount);
        if (isNaN(val) || !val || val < 50) {
            setError("Minimum withdrawal amount is GH₵ 50.00.");
            return;
        }

        if (val > maxAmount) {
            setError(`Insufficient balance. Max: ${formatCurrency(maxAmount)}`);
            return;
        }

        if (phoneNumber.length < 10) {
            setError("Valid phone number is required.");
            return;
        }

        if (!momoName) {
            setError("MoMo name is required.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/agent/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: val,
                    phoneNumber,
                    momoName
                })
            });

            const data = await res.json();
            if (res.ok) {
                onSuccess(val);
                onClose();
            } else {
                setError(data.error || "Failed to submit withdrawal request.");
            }
        } catch (error) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[1rem  ]  overflow-hidden animate-in zoom-in duration-300">
                <div className="bg-black text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <Wallet size={20} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold">Withdraw Profit</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 text-sm rounded-xl font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1 font-mono">
                            Amount to Withdraw (MAX: {formatCurrency(maxAmount)})
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400">GH₵</span>
                            <input
                                type="number"
                                step="0.5"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-2 border-zinc-100 focus:border-black rounded-2xl outline-none font-bold text-2xl"
                                placeholder="0.00"
                                required
                                min={50}
                                max={maxAmount}
                            />
                        </div>
                    </div>
                    

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1 font-mono">
                            MoMo Phone Number
                        </label>
                        <div className="relative">
                            <MessageSquare size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={e => setPhoneNumber(e.target.value)}
                                className="w-full pl-12 pr-4 py-2 bg-zinc-50 border-2 border-zinc-100 focus:border-black rounded-2xl outline-none"
                                placeholder="024 XXX XXXX"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1 font-mono">
                            MoMo Account Name
                        </label>
                        <div className="relative">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                value={momoName}
                                onChange={e => setMomoName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-2 border-zinc-100 focus:border-black rounded-2xl outline-none"
                                placeholder="Full Name on Account"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit" 
                            disabled={loading || !amount || !phoneNumber || !momoName}
                            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-1xl font-black text-lg transition-all  hover:shadow-green-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >

                            {loading ? <Loader2 className="animate-spin" /> : <Wallet size={20} />}
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
