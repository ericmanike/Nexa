import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string | null;
      role?: string | null;
      referralCode?: string | null
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string | null;
    referralCode: string | null
    role?: string | null;
  }
}
