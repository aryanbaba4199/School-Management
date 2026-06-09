import type { IUser } from '../../../common/types/user.types';

export interface LoginResponse {
  user: IUser;
  token: string;
}

export interface PromoSlide {
  id: number;
  title: string;
  description: string;
  badge: string;
  icon: string; // Name of react-icon to render
}
