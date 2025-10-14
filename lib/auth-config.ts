import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { authService } from '@/services/authService'

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
          // 백엔드 API를 통한 구글 로그인
          const response = await authService.googleLogin({
            authorizationCode: account.access_token || '',
            role: 'User'
          })
          
          // 사용자 정보를 user 객체에 저장
          if ('accessToken' in response) {
            user.accessToken = response.accessToken
            user.refreshToken = response.refreshToken
          }
          
          return true
        } catch (error) {
          console.error('Google sign in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && user) {
        // 구글 로그인 시 사용자 정보를 토큰에 추가
        token.userId = Number(user.id) || 0
        token.username = user.name || user.email!.split('@')[0]
        token.userType = 'user'
        token.onboardingCompleted = false
        
        // 백엔드에서 받은 토큰들을 저장
        if (user.accessToken) {
          token.accessToken = user.accessToken
          if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', user.accessToken)
          }
        }
        if (user.refreshToken) {
          token.refreshToken = user.refreshToken
          if (typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', user.refreshToken)
          }
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
