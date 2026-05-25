const ACCESS_TOKEN_KEY = 'accessToken'
const USER_KEY = 'user'

export function getAccessToken (): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken (token: string | null | undefined): void {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
    return
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function clearAuthStorage (): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
