import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { validateBody, registerSchema } from "@/lib/schemas";
import { loginRateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
    try {
        const identifier = req.headers.get("x-forwarded-for") || "anonymous";
        try {
            const { success } = await loginRateLimit.limit(identifier);
            if (!success) {
                return NextResponse.json({ message: "Too many registration attempts. Please try again in 30 minutes." }, { status: 429 });
            }
        } catch (rateErr) {
            console.warn("Rate limit check warning:", rateErr);
        }

        const validation = await validateBody(req, registerSchema);
        if (!validation.success) {
            return validation.response;
        }

        const { name, email, password, phone } = validation.data;


        await dbConnect();

        // const otpResult = await verifyOTP(phone, reqId,otp);
        // // console.log(otpResult)
        // if (!otpResult.data?.code) {
        //     return NextResponse.json( 
        //         { message: otpResult?.message || "Verify your OTP" },
        //         { status: 400 }
        //     );
        // }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a unique referral code
        let referralCode = "";
        let isUnique = false;
        while (!isUnique) {
            referralCode = "NEXA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
            const existing = await User.findOne({ referralCode });
            if (!existing) {
                isUnique = true;
            }
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            referralCode,
        });

        return NextResponse.json(
            { message: "User created successfully", user: { id: user._id, name: user.name, email: user.email, referralCode: user.referralCode } },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "An error occurred while registering the user." },
            { status: 500 }
        );
    }
}
