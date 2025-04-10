import { Injectable } from '@nestjs/common';
import { CookieOptions, Response } from 'express';

//Dto
import {
  AccountDto,
  CreateAccountDto,
  LoginAccountDto,
  LoginResponse,
} from '@domain/account/account.dto';

//Entity
import { Account, Provider } from '@entity';

//interface
import {
  AuthProvider,
  JwtPayload,
  JwtToken,
  ResponseAccessToken,
} from '@domain/auth/interface/auth-service.interface';

//service
import { MicrosoftAuthService } from '@domain/auth/service/microsoft-auth.service';
import { ProfileService } from '@domain/profile/profile.service';
import { getAccountPayload } from '@common/util/decode-token.util';
import { AccountService } from '@domain/account/account.service';
import { ProviderService } from '@domain/provider/provider.service';

@Injectable()
export class AuthService {
  private authProviders: Map<string, AuthProvider>;
  constructor(
    private readonly microsoftAuthService: MicrosoftAuthService,
    private readonly profileService: ProfileService,
    private readonly accountService: AccountService,
    private readonly providerService: ProviderService,
  ) {
    this.initialize();
  }
  private async initialize() {
    this.authProviders = new Map([
      ['microsoft', this.microsoftAuthService],
      //['google', googleAuthService],
    ]);
  }

  async getAuthorizationUrl(provider: string): Promise<string> {
    const authProvider = this.authProviders.get(provider);
    if (!authProvider) {
      throw new Error(`Unsupported auth provider: ${provider}`);
    }
    return await authProvider.getAuthorizationUrl();
  }

  async getToken(provider: string, code: string): Promise<JwtToken> {
    const authProvider = this.authProviders.get(provider);
    if (!authProvider) {
      throw new Error(`Unsupported auth provider: ${provider}`);
    }

    const tokens = await authProvider.getToken(code);

    console.log(tokens.accessToken);
    return tokens;
  }

  async getAccessToken(
    provider: string,
    refreshToken: string,
    res: Response,
  ): Promise<ResponseAccessToken> {
    const authProvider = this.authProviders.get(provider);

    if (!authProvider) {
      throw new Error(`Unsupported auth provider: ${provider}`);
    }

    const tokens = await authProvider.getAccessToken(refreshToken);
    const userProfile: JwtPayload = getAccountPayload(tokens.accessToken);
    const account: Account = (
      await this.accountService.list({ email: userProfile.unique_name })
    ).at(0);

    return { idToken: tokens.idToken, accessToken: tokens.accessToken };
  }

  async getRegisterRedirect(tokens: JwtToken, res: Response): Promise<string> {
    const [redirectHost, completePageUrl, secure, sameSite, maxAge] =
      await Promise.all([
        this.profileService.getProfile({
          section: 'FRONT',
          entry: 'SERVER_URL',
        }),
        this.profileService.getProfile({
          section: 'REDIRECT_PAGE',
          entry: 'COMPLETE',
        }),
        this.profileService.getProfile({
          section: 'COOKIE',
          entry: 'SECURE',
        }),
        this.profileService.getProfile({
          section: 'COOKIE',
          entry: 'SAMESITE',
        }),
        this.profileService.getProfile({
          section: 'COOKIE',
          entry: 'MAXAGE',
        }),
      ]);

    let redirectUrl = redirectHost;

    const accountProfile = await this.microsoftAuthService.getUserProfile(
      tokens.accessToken,
    );
    let account: Partial<AccountDto> = (
      await this.accountService.list({
        email: accountProfile.mail,
      })
    ).at(0);

    const cookieOptions: CookieOptions = {
      secure: secure == true,
      maxAge: Number(maxAge) * 1000,
      sameSite: sameSite,
    };

    if (!account) {
      const userProfile: JwtPayload = getAccountPayload(tokens.accessToken);
      this.Register({
        email: userProfile.unique_name,
        name: userProfile.name,
        department: 'PACS개발1팀',
      });
    }

    res.cookie('idToken', tokens.idToken, {
      ...cookieOptions,
    });
    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
    });

    return redirectUrl;
  }

  async Register(account: CreateAccountDto): Promise<Provider> {
    const newAccount: Account = await this.accountService.create({
      email: account.email,
      name: account.name,
      department: account.department,
    });

    const newProvider = await this.providerService.create({
      name: 'microsoft',
      account: newAccount,
    });

    return newProvider;
  }

  async signIn(
    accountReq: LoginAccountDto,
    res: Response,
  ): Promise<LoginResponse> {
    let loginResponse: LoginResponse = { redirectUrl: null, result: false };

    const [redirectHost, completePageUrl, secure, sameSite, maxAge] =
      await Promise.all([
        this.profileService.getProfile({
          section: 'FRONT',
          entry: 'SERVER_SIGNIN_URL',
        }),
        this.profileService.getProfile({
          section: 'REDIRECT_PAGE',
          entry: 'COMPLETE',
        }),
        this.profileService.getProfile({
          section: 'COOKIE',
          entry: 'SECURE',
        }),
        this.profileService.getProfile({
          section: 'COOKIE',
          entry: 'SAMESITE',
        }),
        this.profileService.getProfile({
          section: 'COOKIE',
          entry: 'MAXAGE',
        }),
      ]);

    let redirectUrl = `${redirectHost}`;

    const cookieOptions: CookieOptions = {
      secure: secure == true,
      maxAge: Number(maxAge) * 1000,
      sameSite: sameSite,
    };

    const account = (
      await this.accountService.list({
        email: accountReq.email,
        name: accountReq.name,
      })
    ).at(0);

    const tokens: JwtToken = await this.microsoftAuthService.loginToken(
      accountReq.email,
      accountReq.password,
    );

    if (account && tokens) {
      res.cookie('idToken', tokens.idToken, {
        ...cookieOptions,
      });
      res.cookie('accessToken', tokens.accessToken, {
        ...cookieOptions,
      });
      res.cookie('refreshToken', tokens.refreshToken, {
        ...cookieOptions,
      });

      loginResponse = { redirectUrl: redirectUrl, result: true };
    }

    return loginResponse;
  }

  async getUnuthorizationUrl(res: Response): Promise<string> {
    res.cookie('accessToken', '', {
      expires: new Date(0),
      path: '/',
      secure: true,
    });

    const logoutUrl = this.microsoftAuthService.getUnuthorizationUrl();
    return logoutUrl;
  }

  async validateAccessToken(accessToken: string): Promise<boolean> {
    const userProfile: JwtPayload = getAccountPayload(accessToken);

    const _account: Account = (
      await this.accountService.list({
        email: userProfile.unique_name,
      })
    ).at(0);

    return !!_account;
  }
}
