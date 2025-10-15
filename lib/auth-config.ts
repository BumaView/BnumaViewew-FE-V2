import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { userDb, tokenUtils } from '@/lib/db'

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
          // 구글 사용자 정보로 데이터베이스에서 사용자 찾기 또는 생성
          let dbUser = await userDb.findByGoogleId(account.providerAccountId)
          
          if (!dbUser) {
            // 새 사용자 생성
            dbUser = await userDb.create({
              email: user.email!,
              username: user.email!.split('@')[0],
              name: user.name || user.email!.split('@')[0],
              userType: 'USER',
              googleId: account.providerAccountId,
              image: user.image || undefined
            })
          } else {
            // 기존 사용자 정보 업데이트
            dbUser = await userDb.update(dbUser.id, {
              name: user.name || dbUser.name || undefined,
              image: user.image || dbUser.image || undefined
            })
          }
          
          // 사용자 ID를 user 객체에 저장
          user.id = dbUser.id.toString()
          
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
        token.userType = 'USER'
        token.onboardingCompleted = false
        token.email = user.email || undefined
        token.image = user.image || undefined
        
        // JWT 토큰 생성
        const accessToken = tokenUtils.generateAccessToken({
          id: Number(user.id),
          email: user.email!,
          userType: 'USER'
        })
        
        const refreshToken = tokenUtils.generateRefreshToken({
          id: Number(user.id),
          email: user.email!
        })
        
        token.accessToken = accessToken
        token.refreshToken = refreshToken
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
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
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
