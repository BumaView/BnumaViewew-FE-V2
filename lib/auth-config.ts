import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { authService } from '@/services/authService'

export const authOptions: AuthOptions = {
  debug: true, // 디버깅 활성화
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
          console.log('Google sign in attempt:', { user, account })
          
          // 백엔드 API를 통한 구글 로그인
          const response = await authService.googleLogin({
            authorizationCode: account.access_token || '',
            role: 'User'
          })
          
          console.log('Google login response from backend:', response)
          
          // 사용자 정보를 user 객체에 저장
          if ('accessToken' in response) {
            user.accessToken = response.accessToken
            user.refreshToken = response.refreshToken
            user.id = response.userId?.toString() || '1'
            user.userType = response.userType || 'USER'
            user.name = response.name || user.name
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
        token.userType = user.userType || 'USER' // 백엔드에서 받은 userType 사용
        token.onboardingCompleted = false
        token.email = user.email || undefined
        token.image = user.image || undefined
        
        // 백엔드에서 받은 토큰들을 저장
        if (user.accessToken) {
          token.accessToken = user.accessToken
        }
        if (user.refreshToken) {
          token.refreshToken = user.refreshToken
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
        session.user.email = token.email as string
        session.user.image = token.image as string
        session.accessToken = token.accessToken as string
        session.refreshToken = token.refreshToken as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // 구글 로그인 후 리다이렉션 처리
      console.log('Redirect callback:', { url, baseUrl })
      
      // URL이 없거나 기본 URL인 경우 대시보드로 리다이렉션
      if (!url || url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`
      }
      
      // URL이 상대 경로인 경우
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      
      // URL이 같은 도메인인 경우
      try {
        const urlObj = new URL(url)
        const baseUrlObj = new URL(baseUrl)
        if (urlObj.origin === baseUrlObj.origin) {
          return url
        }
      } catch (error) {
        console.error('URL parsing error:', error)
      }
      
      // 기본적으로 대시보드로 리다이렉션
      return `${baseUrl}/dashboard`
    }
  },
  pages: {
    signIn: '/login',
    error: '/login?error=OAuthSignin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
