const ACCESS_TOKEN_KEY = 'accessToken'

type TokenStorageMode = 'local' | 'session'

function getStorage (mode: TokenStorageMode): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  return mode === 'local' ? window.localStorage : window.sessionStorage
}

function readToken (mode: TokenStorageMode): string | null {
  return getStorage(mode)?.getItem(ACCESS_TOKEN_KEY) ?? null
}

export function getStoredAccessToken (): { rememberMe: boolean; token: string | null } {
  const localToken = readToken('local')

  if (localToken) {
    return {
      rememberMe: true,
      token: localToken,
    }
  }

  const sessionToken = readToken('session')

  if (sessionToken) {
    return {
      rememberMe: false,
      token: sessionToken,
    }
  }

  return {
    rememberMe: true,
    token: null,
  }
}

export function setAccessToken (token: string | null, rememberMe: boolean): void {
  const localStorageRef = getStorage('local')
  const sessionStorageRef = getStorage('session')

  if (!localStorageRef || !sessionStorageRef) {
    return
  }

  if (token) {
    if (rememberMe) {
      localStorageRef.setItem(ACCESS_TOKEN_KEY, token)
      sessionStorageRef.removeItem(ACCESS_TOKEN_KEY)
      return
    }

    sessionStorageRef.setItem(ACCESS_TOKEN_KEY, token)
    localStorageRef.removeItem(ACCESS_TOKEN_KEY)
    return
  }

  localStorageRef.removeItem(ACCESS_TOKEN_KEY)
  sessionStorageRef.removeItem(ACCESS_TOKEN_KEY)
}

export function clearAccessToken (): void {
  const localStorageRef = getStorage('local')
  const sessionStorageRef = getStorage('session')

  localStorageRef?.removeItem(ACCESS_TOKEN_KEY)
  sessionStorageRef?.removeItem(ACCESS_TOKEN_KEY)
}
