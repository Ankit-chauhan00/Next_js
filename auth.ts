import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { ActionResponse } from "./types/global";
import { api } from "./lib/api";
import Account, { IAccountDoc } from "./database/account.model";
import { SignInSchema } from "./lib/validation";
import User from "./database/user.model";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import dbConnect from "./lib/mongoose";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub,
    Google,
    Credentials({
      async authorize(credentials) {
        
        const validatedFields = SignInSchema.safeParse(credentials);

        if (!validatedFields.success) {
          console.log("❌ validation failed");
          return null;
        }

        const email = validatedFields.data.email.toLowerCase().trim();
        const password = validatedFields.data.password;

        await dbConnect();

        const account = await Account.findOne({
          provider: "credentials",
          providerAccountId: email,
        });

        console.log("ACCOUNT:", account);

        if (!account) return null;

        const user = await User.findById(account.userId);
        console.log("USER:", user);

        if (!user) return null;

        const isValidPassword = await bcrypt.compare(password, account.password!);
        console.log("PASSWORD MATCH:", isValidPassword);

        if (!isValidPassword) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,

          // 👇 attach account info
          accountId: account._id.toString(),
          provider: account.provider,
        };

        return null;
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },

    async jwt({ token, user, account }) {
      // first time login (credential or oAuth)

      if (user) {
        token.id = user.id; // stores directly
      }

      if (account && account.type !== "credentials") {
        const { data: existingAccount, success } = (await api.accounts.getByProvider(
          account.providerAccountId
        )) as ActionResponse<IAccountDoc>;

        if (success && existingAccount?.userId) {
          token.id = existingAccount.userId.toString();
        }
      }

      // ✅ VERY IMPORTANT: keep existing id
      if (!token.id && token.sub) {
        token.id = token.sub;
      }

      return token;
    },

    async signIn({ user, profile, account }) {
      if (account?.type === "credentials") return true;
      if (!account || !user) return false;

      const userInfo = {
        name: user.name || user.email?.split('@')[0] || 'User',
        email: user.email || profile?.email || undefined,
        image: user.image || profile?.avatar_url || undefined,
        username: account.provider === "github" 
          ? (profile?.login as string) 
          : (user.name?.toLowerCase().replace(/\s+/g, '') || user.email?.split('@')[0] || 'user'),
      };

      console.log("NextAuth user object:", user);
      console.log("NextAuth profile object:", profile);
      console.log("Constructed userInfo:", userInfo);

      if (!userInfo.email) {
        console.error("No email found in OAuth user data");
        return false;
      }

      const { success } = (await api.auth.oAuthSignIn({
        user: userInfo,
        provider: account.provider as "github" | "google",
        providerAccountId: account.providerAccountId as string,
      })) as ActionResponse;

      if (!success) return false;

      return true;
    },
  },
});
