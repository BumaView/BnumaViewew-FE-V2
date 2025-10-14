import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: number
      username: string
      userType: string
      onboardingCompleted: boolean
      email?: string
      image?: string
      name?: string
    }
  }

  interface User {
    id: number
    username: string
    userType: string
    onboardingCompleted: boolean
    accessToken?: string
    refreshToken?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: number
    username: string
    userType: string
    onboardingCompleted: boolean
    accessToken?: string
    refreshToken?: string
  }
}

declare module 'next-auth' {
  interface Account {
    access_token?: string
  }
}
