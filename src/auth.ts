import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/rate-limit';

class RateLimitedSignin extends CredentialsSignin {
  code = 'rate_limited';
}

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const DUMMY_PASSWORD_HASH =
  '$2b$10$3rvdLKLBLrwrCCsL1CYmLuCeRZv1ARUSW.SFmyvf5olPtBkrMKgYq';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        const limited = await checkRateLimit(request, {
          key: 'auth:credentials',
          limit: 15,
          windowMs: 15 * 60 * 1000,
        });
        if (limited) throw new RateLimitedSignin();

        if (
          typeof credentials?.email !== 'string' ||
          typeof credentials?.password !== 'string'
        ) {
          return null;
        }
        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;
        if (
          !email ||
          email.length > 254 ||
          !password ||
          new TextEncoder().encode(password).length > 72
        ) {
          return null;
        }
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
        const valid = await bcrypt.compare(password, user?.password ?? DUMMY_PASSWORD_HASH);
        if (!user?.password || !valid) return null;
        return { id: String(user.id), email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { id: string; email: string | null; name: string | null; role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { id: string; role: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
});
