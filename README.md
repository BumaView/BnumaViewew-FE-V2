# BUMAVIEW

> AI 기반 맞춤형 면접 연습 플랫폼

BUMAVIEW는 마이스터고 학생들을 위한 AI 기반 면접 연습 플랫폼입니다. 개인의 수준과 목표에 맞는 맞춤형 면접 문제를 제공하고, 실시간 피드백을 통해 면접 실력을 향상시킬 수 있습니다.

## 🚀 주요 기능

### 📝 면접 연습
- **맞춤형 문제 제공**: 개인의 수준과 관심 분야에 맞는 면접 문제 추천
- **다양한 카테고리**: 기술, 인성, 상황판단 등 다양한 면접 유형 지원
- **난이도 조절**: 초급부터 고급까지 단계별 연습 가능
- **실시간 피드백**: AI 기반 답변 분석 및 개선점 제시

### 📊 학습 관리
- **대시보드**: 학습 진도와 통계를 한눈에 확인
- **북마크 기능**: 중요한 문제를 저장하고 반복 학습
- **학습 기록**: 면접 연습 이력과 성과 추적
- **진도 관리**: 단계별 학습 목표 설정 및 달성도 확인

### 👤 사용자 관리
- **회원가입/로그인**: 안전한 계정 관리
- **구글 로그인**: OAuth 2.0 기반 소셜 로그인
- **온보딩**: 초기 설정을 통한 맞춤형 경험 제공
- **프로필 관리**: 개인 정보 및 학습 목표 설정

### 🔧 관리자 기능
- **문제 관리**: 면접 문제 추가, 수정, 삭제
- **사용자 관리**: 회원 정보 및 학습 현황 관리
- **통계 분석**: 플랫폼 사용 현황 및 성과 분석

## 🛠 기술 스택

### Frontend
- **Next.js 15.5.4** - React 기반 풀스택 프레임워크
- **React 19.1.0** - 사용자 인터페이스 라이브러리
- **TypeScript** - 타입 안전성을 위한 정적 타입 언어
- **Tailwind CSS 4** - 유틸리티 우선 CSS 프레임워크

### Backend
- **Next.js API Routes** - 서버리스 API 엔드포인트
- **NextAuth.js** - 인증 및 세션 관리
- **JWT (jsonwebtoken)** - 인증 및 보안
- **bcryptjs** - 비밀번호 암호화

### 상태 관리 & 데이터 페칭
- **Zustand** - 경량 상태 관리 라이브러리
- **TanStack Query** - 서버 상태 관리 및 캐싱
- **Axios** - HTTP 클라이언트

### 유틸리티
- **Zod** - 스키마 검증
- **XLSX** - 엑셀 파일 처리

## 📁 프로젝트 구조

```
bumaview/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── auth/          # 인증 관련 API
│   │   ├── bookmarks/     # 북마크 API
│   │   ├── dashboard/     # 대시보드 API
│   │   ├── profile/       # 프로필 API
│   │   └── questions/     # 문제 관리 API
│   ├── admin/             # 관리자 페이지
│   ├── bookmarks/         # 북마크 페이지
│   ├── dashboard/         # 대시보드 페이지
│   ├── login/             # 로그인 페이지
│   ├── onboarding/        # 온보딩 페이지
│   ├── practice/          # 면접 연습 페이지
│   ├── register/          # 회원가입 페이지
│   └── user/              # 사용자 관련 페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── common/           # 공통 UI 컴포넌트
│   └── Header.tsx        # 헤더 컴포넌트
├── lib/                   # 유틸리티 및 설정
│   ├── auth.ts           # 인증 관련 함수
│   ├── data.ts           # 데이터 관리
│   ├── middleware.ts     # 미들웨어
│   ├── types.ts          # 타입 정의
│   └── util.ts           # 유틸리티 함수
└── types/                # 타입 정의 파일
```

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0 이상
- Bun (권장) 또는 npm/yarn

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/BumaView/BumaView-FE.git
   cd BumaView-FE
   ```

2. **의존성 설치**
   ```bash
   bun install
   # 또는
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env.local
   ```
   
   `.env.local` 파일에 필요한 환경 변수를 설정하세요:
   ```env
   # JWT Secrets
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   
   # NextAuth.js
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # Google OAuth (구글 로그인용)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # API Base URL
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   ```

4. **구글 OAuth 설정**
   - [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
   - OAuth 2.0 클라이언트 ID 생성
   - 승인된 리디렉션 URI에 `http://localhost:3000/api/auth/callback/google` 추가
   - 클라이언트 ID와 시크릿을 환경 변수에 설정

5. **개발 서버 실행**
   ```bash
   bun dev
   # 또는
   npm run dev
   ```

5. **브라우저에서 확인**
   ```
   http://localhost:3000
   ```

### 빌드 및 배포

```bash
# 프로덕션 빌드
bun run build

# 프로덕션 서버 실행
bun run start
```

## 📖 사용법

### 1. 회원가입 및 로그인
- 홈페이지에서 "지금 시작하기" 버튼 클릭
- 회원가입 후 이메일 인증 완료
- 로그인하여 대시보드 접근

### 2. 온보딩 완료
- 첫 로그인 시 온보딩 과정 진행
- 개인 정보, 관심 분야, 경험 수준 등 설정
- 맞춤형 학습 경험을 위한 프로필 완성

### 3. 면접 연습
- 대시보드에서 "면접 연습 시작" 클릭
- 원하는 카테고리와 난이도 선택
- 문제를 읽고 답변 준비 후 녹화 시작
- AI 피드백 확인 및 개선점 학습

### 4. 학습 관리
- 북마크한 문제로 반복 학습
- 대시보드에서 학습 진도 확인
- 통계를 통한 성과 분석

## 🔧 개발

### 코드 스타일
- ESLint를 사용한 코드 품질 관리
- TypeScript를 통한 타입 안전성 확보
- Tailwind CSS를 활용한 일관된 디자인

### 주요 스크립트
```bash
# 개발 서버 실행 (Turbopack 사용)
bun dev

# 프로덕션 빌드
bun run build

# 린팅
bun run lint

# 프로덕션 서버 실행
bun run start
```

### API 엔드포인트

#### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/verify` - 토큰 검증

#### 문제 관리
- `GET /api/questions` - 문제 목록 조회
- `GET /api/questions/[id]` - 특정 문제 조회
- `POST /api/questions/search` - 문제 검색

#### 북마크
- `GET /api/bookmarks` - 북마크 목록
- `POST /api/bookmarks` - 북마크 추가
- `DELETE /api/bookmarks/[id]` - 북마크 삭제

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해 주세요.

---

**BUMAVIEW** - 면접 준비의 새로운 기준을 제시합니다.