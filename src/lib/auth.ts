import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            const adminEmail = process.env.ADMIN_EMAIL || "genkikun0513@gmail.com";
            if (user.email === adminEmail) {
                return true;
            }
            return false;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
