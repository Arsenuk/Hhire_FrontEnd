const ACCESS_TOKEN_KEY = 'accessToken'
const USER_KEY = 'user'

export function getAccessToken () {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken (token) {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
    return
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function clearAuthStorage () {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
