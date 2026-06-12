/**
 * Auth contracts — kept 1:1 with the backend NestJS DTOs so the forms and
 * client validation stay compatible. Limits below mirror the `class-validator`
 * decorators on the request DTOs.
 */

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

/** POST /auth/login — refresh token is set as an httpOnly cookie server-side. */
export interface LoginResponseDto {
  accessToken: string
}

/** POST /auth/refresh — exchanges the refresh cookie for a new access token. */
export interface RefreshResponseDto {
  accessToken: string
}

/** POST /auth/register — returns the created user, NOT an auth session. */
export interface RegisterResponseDto {
  id: number
  email: string
  createdAt: string
}

/**
 * Client-side validation limits, mirroring the backend DTO decorators:
 *   email    @IsEmail()            (no max length)
 *   name     @MaxLength(32)
 *   surname  @MaxLength(32)
 *   password @MinLength(8) @MaxLength(32)
 */
export const AUTH_LIMITS = {
  name: 32,
  surname: 32,
  passwordMin: 8,
  passwordMax: 32,
} as const
