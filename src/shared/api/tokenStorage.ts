const ACCESS_TOKEN_KEY = 'accessToken'

export function getAccessToken (): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken (token: string | null): void {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
    return
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function clearAccessToken (): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}
