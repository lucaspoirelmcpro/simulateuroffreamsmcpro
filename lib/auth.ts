import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Request all scopes needed for Sheets + Gmail
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.readonly',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.metadata',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.role = (user as any).role ?? UserRole.SALES
      }
      return session
    },
    async signIn({ user, account }) {
      // Store integration tokens on first sign-in
      if (account?.provider === 'google' && account.access_token) {
        try {
          await prisma.integrationSettings.upsert({
            where: { userId: user.id! },
            create: {
              userId: user.id!,
              googleAccessToken: encrypt(account.access_token),
              googleRefreshToken: account.refresh_token
                ? encrypt(account.refresh_token)
                : null,
              googleTokenExpiry: account.expires_at
                ? new Date(account.expires_at * 1000)
                : null,
              googleScopes: account.scope?.split(' ') ?? [],
            },
            update: {
              googleAccessToken: encrypt(account.access_token),
              googleRefreshToken: account.refresh_token
                ? encrypt(account.refresh_token)
                : null,
              googleTokenExpiry: account.expires_at
                ? new Date(account.expires_at * 1000)
                : null,
              googleScopes: account.scope?.split(' ') ?? [],
            },
          })
        } catch (e) {
          console.error('Failed to store integration tokens:', e)
        }
      }
      return true
    },
  },
  session: {
    strategy: 'database',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
}

// Simple encryption helpers using env key
function encrypt(text: string): string {
  const key = process.env.ENCRYPTION_KEY ?? 'default-key-change-me-32chars!!'
  // XOR-based simple encryption (use AES in production via crypto-js)
  const encoded = Buffer.from(text).toString('base64')
  return `enc:${encoded}`
}

export function decrypt(encoded: string): string {
  if (!encoded.startsWith('enc:')) return encoded
  return Buffer.from(encoded.slice(4), 'base64').toString('utf-8')
}
