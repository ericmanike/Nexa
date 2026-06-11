import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";
import { verifyOTP } from "@/lib/bulkclick";

export async function POST(req: Request) {
    try {
        const { name, email, password, phone, reqId, otp } = await req.json();
      //  console.log("The details are : ", { name, email, password, phone, reqId , otp})
        if (!name || !email || !password || !phone || !reqId || !otp) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }


        await dbConnect();

        const otpResult = await verifyOTP(phone, reqId,otp);
        // console.log(otpResult)
        if (!otpResult.data?.code) {
            return NextResponse.json( 
                { message: otpResult?.message || "Verify your OTP" },
                { status: 400 }
            );
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
        });

        return NextResponse.json(
            { message: "User created successfully", user: { id: user._id, name: user.name, email: user.email } },
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
