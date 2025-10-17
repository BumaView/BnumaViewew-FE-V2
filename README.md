# BumaView Frontend

면접 준비의 새로운 기준을 제시하는 BumaView의 프론트엔드 애플리케이션입니다.

## 🚀 주요 기능

- **인증 시스템**: 일반 로그인 및 Google OAuth 로그인
- **면접 연습**: 실시간 모의면접 시스템
- **문제 관리**: 다양한 카테고리의 면접 문제
- **북마크 관리**: 폴더별 문제 관리
- **관리자 기능**: 문제 CRUD 및 일괄 등록
- **대시보드**: 통계 및 최근 활동

## 🛠️ 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Authentication**: NextAuth.js
- **UI Components**: Custom Components

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
bun install
# 또는
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://bnuma-viewew-be.vercel.app

# NextAuth Configuration
NEXTAUTH_URL=https://bnuma-viewew-fe-v2.vercel.app
NEXTAUTH_SECRET=dkjmklopuitrewsdfhgfdeeuyjjhm+==dnkgljjnnmmkjnbvzzxdsdfgh

# Google OAuth Configuration
GOOGLE_CLIENT_ID=1055022639559-es8qf9ldooropmnm5a1l2oj1o2tip1qi.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_USER_INFO_URL=https://www.googleapis.com/oauth2/v3/userinfo
GOOGLE_TOKEN_URL=https://oauth2.googleapis.com/token
GOOGLE_REDIRECT_URI=https://bnuma-viewew-fe-v2.vercel.app/login

# Database Configuration (if using Prisma)
DATABASE_URL="mariadb://admin:qwer!Q@svc.sel3.cloudtype.app:31480/animal"
```

### 3. 개발 서버 실행

```bash
bun dev
# 또는
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 🏗️ 프로젝트 구조

```
bumaview/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── admin/             # 관리자 페이지
│   ├── bookmarks/         # 북마크 페이지
│   ├── dashboard/         # 대시보드 페이지
│   ├── login/             # 로그인 페이지
│   ├── practice/          # 면접 연습 페이지
│   └── register/          # 회원가입 페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # UI 컴포넌트
│   ├── Header.tsx        # 헤더 컴포넌트
│   └── Layout.tsx        # 레이아웃 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── api.ts            # API 클라이언트
│   ├── auth-config.ts    # NextAuth 설정
│   ├── google-auth.ts    # Google OAuth 유틸리티
│   └── utils.ts          # 유틸리티 함수
├── services/              # API 서비스
│   ├── auth.service.ts   # 인증 서비스
│   ├── question.service.ts # 문제 관리 서비스
│   ├── interview.service.ts # 면접 서비스
│   ├── bookmark.service.ts # 북마크 서비스
│   └── dashboard.service.ts # 대시보드 서비스
├── store/                 # 상태 관리
│   ├── auth.store.ts     # 인증 상태
│   ├── question.store.ts # 문제 상태
│   └── interview.store.ts # 면접 상태
└── types/                 # 타입 정의
    ├── api.ts            # API 타입
    └── next-auth.d.ts    # NextAuth 타입 확장
```

## 🔧 API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/login/google` - Google 로그인
- `POST /api/auth/sign-up` - 회원가입
- `POST /api/auth/logout` - 로그아웃

### 문제 관리
- `GET /api/questions` - 문제 목록 조회
- `GET /api/questions/{id}` - 문제 단건 조회
- `POST /api/questions/search` - 문제 검색
- `GET /api/interviews/random` - 랜덤 질문 추출
- `POST /api/interviews/random/filter` - 범위 지정 랜덤 질문

### 면접 세션
- `POST /api/interviews` - 모의면접 세션 생성
- `POST /api/interviews/{id}` - 답변 기록
- `POST /api/interviews/{id}/finish` - 면접 종료

### 북마크
- `GET /user/bookmarks` - 북마크 폴더 목록
- `POST /user/bookmarks/forders` - 폴더 생성
- `POST /user/bookmarks` - 문제 북마크
- `GET /api/bookmarks/{id}` - 폴더별 북마크 조회

### 대시보드
- `GET /api/dashboard` - 대시보드 데이터

### 관리자 기능
- `POST /admin/questions` - 문제 단건 등록
- `POST /admin/questions/sheets` - Google Sheets 일괄 등록
- `PATCH /admin/questions/{id}` - 문제 수정
- `DELETE /admin/questions/{id}` - 문제 단건 삭제
- `DELETE /admin/questions` - 문제 일괄 삭제

## 🎨 UI/UX 특징

- **반응형 디자인**: 모든 디바이스에서 완벽 작동
- **모던한 디자인**: Tailwind CSS 기반의 아름다운 UI
- **직관적인 UX**: 사용자 친화적인 인터페이스
- **다크 모드 지원**: (향후 구현 예정)
- **애니메이션**: 부드러운 전환 효과

## 🚀 배포

### Vercel 배포

1. GitHub에 코드 푸시
2. Vercel에서 프로젝트 연결
3. 환경 변수 설정
4. 자동 배포 완료

### 환경 변수 설정 (Vercel)

Vercel 대시보드에서 다음 환경 변수들을 설정하세요:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해 주세요.

---

**BUMAVIEW** - 면접 준비의 새로운 기준을 제시합니다.