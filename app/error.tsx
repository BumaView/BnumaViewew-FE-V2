'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 에러를 콘솔에 로깅
    console.error('Application Error:', error)
    console.error('Error Stack:', error.stack)
    console.error('Error Digest:', error.digest)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-light text-gray-900 mb-4">
          문제가 발생했습니다
        </h2>
        <p className="text-gray-600 mb-6">
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="px-6 py-2 bg-gray-900 text-white rounded-sm text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            다시 시도
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 border border-gray-200 text-gray-700 rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            홈으로 이동
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              개발자 정보 (개발 모드에서만 표시)
            </summary>
            <pre className="mt-4 p-4 bg-gray-100 rounded-sm text-xs text-gray-600 overflow-auto">
              {error.message}
              {error.stack && `\n\nStack Trace:\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
