import { Account } from '@entity';

export interface JwtPayload {
  iss: string; // Issuer
  sub: string; // Subject (typically the user ID)
  aud: string; // Audience
  exp: number; // Expiration time
  nbf: number; // Not before time
  iat: number; // Issued at time
  jti: string; // JWT ID
  [key: string]: any; // 만약 추가적인 필드가 있을 경우
}

export interface JwtToken {
  idToken?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface ResponseAccessToken {
  idToken?: string;
  accessToken?: string;
  account?: Account;
}

export interface AuthProvider {
  getAuthorizationUrl(): Promise<string>;
  getUnuthorizationUrl(): Promise<string>;
  getToken(code: string): Promise<JwtToken>;
  getAccessToken(refreshToken: string): Promise<JwtToken>;
}
