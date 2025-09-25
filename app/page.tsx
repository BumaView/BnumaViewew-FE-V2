import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-light text-gray-900 tracking-wide">
              BUMAVIEW
            </h1>
            <Link 
              href="/login"
              className="bg-gray-900 text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              로그인
            </Link>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-6xl font-light text-gray-900 leading-tight mb-6">
            면접 준비의
            <br />
            새로운 기준
          </h1>
          <p className="text-lg text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
            AI 기반 맞춤형 면접 연습으로 자신감 있는 면접을 준비하세요.
            <br />
            체계적인 피드백과 함께 성장하는 여정을 시작해보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-gray-900 text-white px-8 py-3 rounded-sm text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              지금 시작하기
            </Link>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-sm text-sm font-medium hover:bg-gray-100 transition-colors">
              더 알아보기
            </button>
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              왜 BUMAVIEW인가요?
            </h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-sm mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-3">AI 기반 분석</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                최신 AI 기술로 답변을 분석하고
                <br />
                개선점을 제시합니다
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-sm mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-3">맞춤형 연습</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                개인의 수준과 목표에 맞는
                <br />
                맞춤형 면접 문제를 제공합니다
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-sm mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-light text-gray-900 mb-3">실시간 피드백</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                즉시 받는 상세한 피드백으로
                <br />
                빠른 실력 향상을 경험하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-light text-white mb-4">
            지금 시작해보세요
          </h2>
          <p className="text-gray-300 mb-8 leading-relaxed">
            무료로 면접 연습을 시작하고, 꿈의 직장에 한 걸음 더 가까워지세요.
          </p>
          <Link
            href="/login"
            className="bg-white text-gray-900 px-8 py-3 rounded-sm text-sm font-medium hover:bg-gray-100 transition-colors inline-block"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-gray-400">
            © 2024 BUMAVIEW. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
