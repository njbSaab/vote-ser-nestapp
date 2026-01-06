import { UserPublicDto } from "./user-public.dto";

/**
 * DTO для админки (больше полей)
 */
export class UserAdminDto extends UserPublicDto {
  emailVerified: boolean;
  browserInfo?: any;
  lastActive?: Date; // если добавишь поле
}