import { Injectable, OnModuleInit } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';

//entity
import { Profile } from '@entity';

//interface
import {
  AuthProvider,
  JwtToken,
  ResponseAccessToken,
} from '@domain/auth/interface/auth-service.interface';

//service
import { ProfileService } from '@domain/profile/profile.service';
import { getAccountPayload } from '@common/util/decode-token.util';

@Injectable()
export class MicrosoftAuthService implements AuthProvider, OnModuleInit {
  private client_id: string;
  private tenant_id: string;
  private secret_key: string;
  private redirect_uri: string;
  private scope: string;

  async onModuleInit(): Promise<void> {
    await this.initialize();
  }

  private async initialize(): Promise<void> {
    const [clientId, tanantId, secretKey, redirectUri, scope] =
      await Promise.all([
        this.profileService.getProfile({
          section: 'OAUTH',
          entry: 'MICROSOFT_CLIENT_ID',
        }),
        this.profileService.getProfile({
          section: 'OAUTH',
          entry: 'MICROSOFT_TENANT_ID',
        }),
        this.profileService.getProfile({
          section: 'OAUTH',
          entry: 'MICROSOFT_SECRET_KEY',
        }),
        this.profileService.getProfile({
          section: 'OAUTH',
          entry: 'MICROSOFT_REDIRECT_URL',
        }),
        this.profileService.getProfile({
          section: 'OAUTH',
          entry: 'MICROSOFT_SCOPE',
        }),
      ]);

    this.client_id = clientId;
    this.tenant_id = tanantId;
    this.secret_key = secretKey;
    this.redirect_uri = redirectUri;
    this.scope = scope;
  }

  constructor(
    private readonly profileService: ProfileService,
    private readonly jwtService: JwtService,
  ) {}

  async generateIdToken(item: { email: string }) {
    const payload = {
      item,
    };

    const idToken = this.jwtService.sign(payload, {
      // expiresIn: '1h', // ID Token도 만료 시간 있음
      // audience: 'your-client-id', // 선택 사항 (OpenID Connect 참고)
      issuer: 'your-auth-server',
    });

    return idToken;
  }

  async getAuthorizationUrl(): Promise<string> {
    const microsoftSignUrl = await this.profileService.getProfile({
      section: 'OAUTH',
      entry: 'MICROSOFT_SIGNIN_URL',
    });

    let redirectUrl = microsoftSignUrl
      .replace('${CLIENT_ID}', this.client_id)
      .replace('${TENANT_ID}', this.tenant_id)
      .replace('${REDIRECT_URL}', this.redirect_uri)
      .replace('${SCOPE}', this.scope);

    return redirectUrl;
  }

  async getUnuthorizationUrl(): Promise<string> {
    const [authUrlProfile, redirectPageProfile, frontRedirectUrl] =
      await Promise.all([
        this.profileService.getProfile({
          section: 'OAUTH',
          entry: 'MICROSOFT_SIGNOUT_URL',
        }),
        this.profileService.getProfile({
          section: 'REDIRECT_PAGE',
          entry: 'LOGIN',
        }),
        this.profileService.getProfile({
          section: 'FRONT',
          entry: 'SERVER_URL',
        }),
      ]);

    let redirectUrl = authUrlProfile
      .replace('${CLIENT_ID}', this.tenant_id)
      .replace('${FRONT_REDIRECT_URL}', frontRedirectUrl)
      .replace('${LOGINPATH}', redirectPageProfile);

    return redirectUrl;
  }

  async getToken(code: string): Promise<JwtToken> {
    try {
      const microsoftGetTokenUrl = await this.profileService.getProfile({
        section: 'OAUTH',
        entry: 'MICROSOFT_TOKEN_URL',
      });
      const requestUrl: string = microsoftGetTokenUrl.replace(
        '${TENANT_ID}',
        this.tenant_id,
      );

      const tokenResponse = await axios.post(
        requestUrl,
        new URLSearchParams({
          client_id: this.client_id,
          client_secret: this.secret_key,
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirect_uri,
          scope: this.scope,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const jwtAccountData = getAccountPayload(tokenResponse.data.access_token);

      return {
        idToken: await this.generateIdToken({
          email: jwtAccountData.unique_name,
        }),
        accessToken: tokenResponse.data.access_token,
        refreshToken: tokenResponse.data.refresh_token,
      };
    } catch (error) {
      return error;
    }
  }

  async getAccessToken(refreshToken: string): Promise<JwtToken> {
    const microsoftGetTokenUrl = await this.profileService.getProfile({
      section: 'OAUTH',
      entry: 'MICROSOFT_TOKEN_URL',
    });
    const requestUrl: string = microsoftGetTokenUrl.replace(
      '${TENANT_ID}',
      this.tenant_id,
    );

    const params = new URLSearchParams({
      client_id: this.client_id,
      client_secret: this.secret_key,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      redirect_uri: this.redirect_uri,
    });

    try {
      const response = await axios.post(requestUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const jwtAccountData = getAccountPayload(response.data.access_token);

      return {
        idToken: await this.generateIdToken({
          email: jwtAccountData.unique_name,
        }),
        accessToken: response.data.access_token,
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Unable to refresh access token');
    }
  }

  async getUserProfile(accessToken: string): Promise<any> {
    const requestUrl: string = await this.profileService.getProfile({
      section: 'OAUTH',
      entry: 'MICROSOFT_PROFILE_URL',
    });

    const userProfileResponse = await axios.get(requestUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return userProfileResponse.data;
  }

  async loginToken(email: string, password: string): Promise<JwtToken> {
    try {
      const microsoftGetTokenUrl = await this.profileService.getProfile({
        section: 'OAUTH',
        entry: 'MICROSOFT_SKIP_SIGNIN_URL',
      });
      const requestUrl: string = microsoftGetTokenUrl.replace(
        '${TENANT_ID}',
        this.tenant_id,
      );

      const tokenResponse = await axios.post(
        requestUrl,
        new URLSearchParams({
          client_id: this.client_id,
          scope: 'offline_access https://graph.microsoft.com/.default',
          username: email,
          password: password,
          grant_type: 'password',
          client_secret: this.secret_key,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const jwtAccountData = getAccountPayload(tokenResponse.data.access_token);

      return {
        idToken: await this.generateIdToken({
          email: jwtAccountData.unique_name,
        }),
        accessToken: tokenResponse.data.access_token,
        refreshToken: tokenResponse.data.refresh_token,
      };
    } catch (error) {
      return undefined;
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const decoded = jwt.decode(token) as { exp: number };
      const currentTime = Math.floor(Date.now() / 1000);

      if (decoded.exp < currentTime) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}
