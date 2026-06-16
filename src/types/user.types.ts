/**
 * User contract, kept 1:1 with the backend NestJS `GetUserResponseDto`.
 *
 * The aggregate metrics are nullable: a freshly registered user with no
 * completed simulations has `null` for every rate (there is nothing to average
 * yet). `completed_simulations` is always a number (0 when none).
 */
export interface GetUserResponseDto {
  name: string
  surname: string
  completed_simulations: number
  average_score: number | null
  survival_rate: number | null
  correct_diagnosis_rate: number | null
}
