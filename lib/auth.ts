import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import dbConnect from './mongoose';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter an email and password');
                }

                await dbConnect();
                const user = await User.findOne({ email: credentials.email }).select('+password');

                if (!user) {
                    throw new Error('No user found with this email');
                }

                const isValid = await bcrypt.compare(credentials.password, user.password!);

                if (!isValid) {
                    throw new Error('Incorrect password');
                }

                 return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    referralCode: user.referralCode,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                if (!user.email) {
                    return false;
                }

                await dbConnect();
                try {
                    const existingUser = await User.findOne({ email: user.email });
                    if (!existingUser) {
                        // Generate unique referral code for Google registration
                        let referralCode = "";
                        let isUnique = false;
                        while (!isUnique) {
                            referralCode = "NEXA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
                            const existing = await User.findOne({ referralCode });
                            if (!existing) {
                                isUnique = true;
                            }
                        }

                        const newUser = await User.create({
                            name: user.name || 'Google User',
                            email: user.email,
                            role: 'user',
                            walletBalance: 0,
                            referralCode,
                        }) as any;
                        user.id = newUser._id.toString();
                        (user as any).role = newUser.role;
                        (user as any).referralCode = newUser.referralCode;
                    } else {
                        user.id = (existingUser as any)._id.toString();
                        (user as any).role = (existingUser as any).role;
                        (user as any).referralCode = (existingUser as any).referralCode;
                    }
                    return true;
                } catch (error) {
                    console.error('Error during Google sign-in:', error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.referralCode = (user as any).referralCode;
            }

            // Support for updating the session securely from the DB
            if (trigger === "update") {
                await dbConnect();
                const dbUser = await User.findById(token.id);
                if (dbUser) {
                    token.role = dbUser.role;
                    token.referralCode = dbUser.referralCode;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).role = token.role as string;
                (session.user as any).referralCode = token.referralCode as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 60 * 60 * 8, // 5 hours
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: false,
};
 

