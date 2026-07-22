import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    async function proxy(req: any) {
        // req.nextauth.token is automatically populated by withAuth
        const token = req.nextauth.token;
        const role = token?.role;
        // console.log(token)
        // console.log(role)
        const pathname = req.nextUrl.pathname;
       

// 1. Protect Admin Routes: Redirect non-admins to dashboard

if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
}

// 2. Protect All Dashboard Routes: Redirect unauthenticated users to sign-in
if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/auth/signIn", req.url));
}



        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/auth/signIn",
        },
    }
);

export const config = {
    matcher: [
        "/dashboard/:path*"
          
       
    ],
};
