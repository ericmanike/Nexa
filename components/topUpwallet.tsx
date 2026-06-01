'use client'
import React from 'react'
import { useSession, } from 'next-auth/react'
import { useEffect, useState } from 'react'
import RechargeModal from './rechargeModal'

 declare global {
    interface Window {
        PaystackPop: any
    }
 }

function topUpwallet() {

    const { data: session } = useSession()

    const [amount, setAmount] = useState<number | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const loadPaystackScript = () => {
        const script = document.createElement('script')
        script.src = 'https://js.paystack.co/v1/inline.js'
        script.async = true
        document.body.appendChild(script)
    }

    useEffect(() => {

        loadPaystackScript()
    }, [])

    const handleTopUp = () => {

        console.log(session)
        console.log(session?.user?.email)
        console.log(session?.user?.name)
        if (!session) {
            alert('Please login to continue')
            return;
        }

        if (!amount) {
            alert('Please enter an amount')
            return;
        }

        try {

            const reference = Date.now().toString()

            const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
            if (!paystackKey) {
                console.log('   Paystack public key not found', paystackKey)
                throw new Error('Paystack public key not found');

            }
            if (!window.PaystackPop) {
                console.log('Paystack script not loaded');
                return;
            }



            const handler = window.PaystackPop.setup({
                key: paystackKey!,
                email: session?.user?.email!,
                currency: 'GHS',
                amount: Math.round((amount! + (amount! * 0.02)) * 100), // Convert to kobo

                ref: reference,
                onClose: () => {

                },
                callback: function (response : any) {
                    (async () => {
                        try {
                            const verifyResponse = await fetch('/api/topupWallet', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    email: session?.user?.email!,
                                    amount,
                                    reference,
                                }),
                            });

                            if (verifyResponse.ok) {
                                console.log('Payment verified');
                                window.location.reload();
                            } else {
                                console.log('Payment verification failed');
                            }
                        } catch (err) {
                            console.error('Error verifying payment', err);
                        } finally {

                        }
                    })();
                },

            })



            handler.openIframe()
        } catch (error) {

            console.log(error)
            console.error(error);
            alert("Something went wrong with the purchase.");
        } finally {

        }

    }





    return (
        <>
            <RechargeModal isOpen={isOpen} handleTopUp={handleTopUp} setIsOpen={setIsOpen} setAmount={setAmount} amount={amount} />
            <button
                onClick={() => {
                    setIsOpen(true) }}
               
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#fb923c] hover:bg-[#fb923q] text-slate-900 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg w-full sm:w-auto active:scale-[0.99] cursor-pointer"
            >
                <span className="font-black text-base leading-none">GH₵</span>
                Top up your wallet
            </button>
        </>

    )
}

export default topUpwallet