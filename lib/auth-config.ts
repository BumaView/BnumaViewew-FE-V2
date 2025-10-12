import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { createGoogleUser, findUserByEmail } from '@/lib/auth'

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // 이메일로 기존 사용자 확인
          const existingUser = findUserByEmail(user.email!)
          
          if (!existingUser) {
            // 새 사용자 생성
            createGoogleUser(
              user.email!,
              user.name || user.email!.split('@')[0],
              user.image || undefined
            )
          }
          
          return true
        } catch (error) {
          console.error('Sign in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && user) {
        // 구글 로그인 시 사용자 정보를 토큰에 추가
        const dbUser = findUserByEmail(user.email!)
        if (dbUser) {
          token.userId = dbUser.id
          token.username = dbUser.username
          token.userType = dbUser.role
          token.onboardingCompleted = dbUser.onboardingCompleted || false
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as number
        session.user.username = token.username as string
        session.user.userType = token.userType as string
        session.user.onboardingCompleted = token.onboardingCompleted as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
