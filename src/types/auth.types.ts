export interface LoginRequestDto {
  email: string
  password: string
}

export interface RegisterRequestDto {
  email: string
  name: string
  surname: string
  password: string
}

export interface LoginResponseDto {
  accessToken: string
}

export interface RefreshResponseDto {
  accessToken: string
}

export interface RegisterResponseDto {
  id: number
  email: string
  createdAt: string
}

export const AUTH_LIMITS = {
  name: 32,
  surname: 32,
  passwordMin: 8,
  passwordMax: 32,
} as const
