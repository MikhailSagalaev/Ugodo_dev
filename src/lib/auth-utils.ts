// Utility функции для работы с авторизацией через SMS

export const setMedusaAuthToken = async (token: string) => {
  try {
    // Устанавливаем cookie для server-side использования через API
    await fetch('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    }).catch(error => {
      console.warn('[Auth Utils] Failed to set server cookie:', error)
    })

    // Также устанавливаем client-side cookie для совместимости
    const isSecure = location.protocol === 'https:'
    const cookieString = `_medusa_jwt=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=strict${isSecure ? '; secure' : ''}`
    document.cookie = cookieString
    
    // Генерируем cache_id для кэширования
    const cacheId = Math.random().toString(36).substring(2) + Date.now().toString(36)
    const cacheString = `_medusa_cache_id=${cacheId}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=strict${isSecure ? '; secure' : ''}`
    document.cookie = cacheString
    
    console.log('[Auth Utils] Tokens set successfully')
    return true
  } catch (error) {
    console.error('[Auth Utils] Failed to set tokens:', error)
    return false
  }
}

export const clearMedusaAuthToken = () => {
  try {
    document.cookie = `_medusa_jwt=; path=/; max-age=-1`
    document.cookie = `_medusa_cache_id=; path=/; max-age=-1`
    console.log('[Auth Utils] Tokens cleared successfully')
    return true
  } catch (error) {
    console.error('[Auth Utils] Failed to clear tokens:', error)
    return false
  }
}

export const redirectToAccount = () => {
  // Добавляем небольшую задержку чтобы cookies успели установиться
  setTimeout(() => {
    // Используем replace для полной перезагрузки и обновления server-side состояния
    window.location.replace('/account')
  }, 200)
} 