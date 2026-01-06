export class UserPublicDto {
  uuid: string;
  name: string;
  email: string;
  points: number;
  totalVotes: number;
  correctPredictions: number;
  accuracy: number; // вычисляемое поле
  createdAt: Date;
  updatedAt: Date;
  // votesHistory?: any[]; // добавь, если нужно в профиле
}