export interface CurrentUser {
  userId: string;
  email: string;
  fullName: string;

  role: string;

  traineeId?: number;
  coachId?: number;

  isTrainee: boolean;
  isCoach: boolean;
  isAdmin: boolean;
}