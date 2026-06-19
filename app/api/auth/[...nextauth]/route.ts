import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import {  NextRequest } from "next/server";

const handler = NextAuth(authOptions);

async function POST(req: Request, ctx: any) {

    const bodyText = await req.text();
  
    

    const newReq = new NextRequest(req.url, {
        method: req.method,
        headers: req.headers,
        body: bodyText,
    });

   
    return handler(newReq, ctx);
}

export { handler as GET, POST };
