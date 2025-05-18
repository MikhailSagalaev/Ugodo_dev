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
    // Логируем ошибку 
    console.error('Произошла ошибка приложения:', error)
  }, [error])

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Что-то пошло не так</h1>
        <p className="text-gray-600 mb-6">
          Произошла непредвиденная ошибка. Наша команда уже работает над её исправлением.
        </p>
        <button
          className="py-2 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
          onClick={() => reset()}
        >
          Попробовать снова
        </button>
      </div>
    </div>
  )
} 