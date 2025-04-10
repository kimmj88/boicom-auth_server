import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '@domain/auth/interface/auth-service.interface';

export const getAccountPayload = (accessToken: string): JwtPayload => {
  const userProfile: JwtPayload = jwt.decode(accessToken) as JwtPayload;
  return userProfile;
};
