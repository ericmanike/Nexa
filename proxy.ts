import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";





export default withAuth(
    async function proxy(req) {
        // req.nextauth.token is automatically populated by withAuth
        const token = req.nextauth.token;
        const role = token?.role;
        console.log(token)
        console.log(role)
        const pathname = req.nextUrl.pathname;
       

// 1. Protect Admin Routes: Redirect non-admins to dashboard
// FIXED: Added missing leading slash to "/dashboard/admin"
if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
}

// 2. Protect All Dashboard Routes: Redirect unauthenticated users to sign-in
if (pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/auth/signIn", req.url));
}

// 3. Protect Guest Routes: Redirect authenticated users away from auth pages
const isAuthPage = pathname.startsWith("/auth/signIn") || 
                   pathname.startsWith("/auth/signUp") || 
                   pathname.startsWith("/auth/forgot-password");

if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
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
        "/dashboard/:path*",
          '/auth/signIn/:path*', 
          '/auth/signUp/:path*',
          '/auth/forgot-password/:path*', 
       
    ],
};
