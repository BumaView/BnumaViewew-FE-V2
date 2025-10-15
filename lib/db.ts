import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production'

// 사용자 관련 데이터베이스 함수들
export const userDb = {
  // 사용자 생성
  async create(data: {
    email: string
    username: string
    name?: string
    password?: string
    userType?: string
    googleId?: string
    image?: string
  }) {
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 12) : null
    
    return prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        name: data.name,
        password: hashedPassword,
        userType: data.userType || 'USER',
        googleId: data.googleId,
        image: data.image,
      }
    })
  },

  // 이메일로 사용자 찾기
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    })
  },

  // 사용자명으로 사용자 찾기
  async findByUsername(username: string) {
    return prisma.user.findUnique({
      where: { username }
    })
  },

  // Google ID로 사용자 찾기
  async findByGoogleId(googleId: string) {
    return prisma.user.findUnique({
      where: { googleId }
    })
  },

  // 사용자 ID로 찾기
  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id }
    })
  },

  // 비밀번호 검증
  async validatePassword(user: { password: string | null }, password: string) {
    if (!user.password) return false
    return bcrypt.compare(password, user.password)
  },

  // 사용자 정보 업데이트
  async update(id: number, data: Partial<{
    name?: string
    email?: string
    username?: string
    userType?: string
    image?: string
    age?: number
    desiredField?: string
    desiredCompany?: string
    experience?: string
    education?: string
    skills?: string
    onboardingCompleted?: boolean
    googleId?: string
    refreshToken?: string
  }>) {
    return prisma.user.update({
      where: { id },
      data
    })
  },

  // 온보딩 완료
  async completeOnboarding(id: number, onboardingData: {
    age?: number
    desiredField?: string
    desiredCompany?: string
    experience?: string
    education?: string
    skills?: string[]
  }) {
    return prisma.user.update({
      where: { id },
      data: {
        ...onboardingData,
        skills: onboardingData.skills ? JSON.stringify(onboardingData.skills) : undefined,
        onboardingCompleted: true
      }
    })
  }
}

// JWT 토큰 관련 함수들
export const tokenUtils = {
  // 액세스 토큰 생성
  generateAccessToken(user: { id: number; email: string; userType: string }) {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        userType: user.userType 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )
  },

  // 리프레시 토큰 생성
  generateRefreshToken(user: { id: number; email: string }) {
    return jwt.sign(
      { userId: user.id, email: user.email },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )
  },

  // 토큰 검증
  verifyAccessToken(token: string) {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string; userType: string }
  },

  // 리프레시 토큰 검증
  verifyRefreshToken(token: string) {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: number; email: string }
  }
}

// 질문 관련 데이터베이스 함수들
export const questionDb = {
  // 질문 생성
  async create(data: {
    question: string
    company?: string
    year?: number
    category: string
    field?: string
    tag?: string
    authorId: number
  }) {
    return prisma.question.create({
      data
    })
  },

  // 질문 목록 조회
  async findMany(options: {
    skip?: number
    take?: number
    where?: Record<string, unknown>
    orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[]
  } = {}) {
    return prisma.question.findMany({
      ...options,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    })
  },

  // 질문 검색
  async search(query: string, options: {
    skip?: number
    take?: number
  } = {}) {
    return prisma.question.findMany({
      where: {
        OR: [
          { question: { contains: query } },
          { company: { contains: query } },
          { category: { contains: query } }
        ]
      },
      ...options,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    })
  },

  // 질문 삭제
  async delete(id: number) {
    return prisma.question.delete({
      where: { id }
    })
  },

  // 여러 질문 삭제
  async deleteMany(ids: number[]) {
    return prisma.question.deleteMany({
      where: {
        id: { in: ids }
      }
    })
  }
}

// 북마크 관련 데이터베이스 함수들
export const bookmarkDb = {
  // 북마크 폴더 생성
  async createFolder(data: {
    name: string
    userId: number
  }) {
    return prisma.bookmarkFolder.create({
      data
    })
  },

  // 사용자의 북마크 폴더 목록 조회
  async getFolders(userId: number) {
    return prisma.bookmarkFolder.findMany({
      where: { userId },
      include: {
        bookmarks: {
          include: {
            question: true
          }
        }
      }
    })
  },

  // 질문 북마크
  async bookmark(data: {
    questionId: number
    folderId: number
    userId: number
  }) {
    return prisma.bookmark.create({
      data,
      include: {
        question: true
      }
    })
  },

  // 북마크 해제
  async unbookmark(bookmarkId: number) {
    return prisma.bookmark.delete({
      where: { id: bookmarkId }
    })
  }
}

// 면접 관련 데이터베이스 함수들
export const interviewDb = {
  // 면접 생성
  async create(data: {
    title: string
    category: string
    userId: number
    questionIds: number[]
  }) {
    return prisma.interview.create({
      data: {
        title: data.title,
        category: data.category,
        userId: data.userId,
        questions: {
          create: data.questionIds.map((questionId, index) => ({
            questionId,
            order: index
          }))
        }
      },
      include: {
        questions: {
          include: {
            question: true
          }
        }
      }
    })
  },

  // 면접 조회
  async findById(id: number) {
    return prisma.interview.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: true
          },
          orderBy: { order: 'asc' }
        },
        answers: true
      }
    })
  },

  // 사용자의 면접 목록 조회
  async findByUserId(userId: number, options: {
    skip?: number
    take?: number
  } = {}) {
    return prisma.interview.findMany({
      where: { userId },
      ...options,
      include: {
        questions: {
          include: {
            question: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  },

  // 답변 기록
  async recordAnswer(data: {
    interviewId: number
    questionId: number
    answer: string
    timeSpent: number
  }) {
    return prisma.interviewAnswer.create({
      data
    })
  },

  // 면접 완료
  async finish(id: number, totalTime: number) {
    return prisma.interview.update({
      where: { id },
      data: {
        status: 'completed',
        totalTime
      }
    })
  }
}
