import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';

//interface
import {
  JwtPayload,
  JwtToken,
} from '@domain/auth/interface/auth-service.interface';

//guard
import { JwtAuthGuard } from '@domain/auth/guard/jwt-auth.guard';

//dto
import {
  AccountDto,
  CreateAccountDto,
  LoginAccountDto,
} from '@domain/account/account.dto';

//service
import { AuthService } from '@domain/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  async userAccountSignIn(@Body() body: LoginAccountDto, @Res() res: Response) {
    const result = await this.authService.signIn(body, res);

    return res.json(result);
  }

  @Get('signout')
  async userAccountSignOut(@Res() res: Response) {
    const logoutUrl = await this.authService.getUnuthorizationUrl(res);
    return res.redirect(logoutUrl);
  }

  @Get('/redirect/:provider')
  async redirectToAzureAD(
    @Param('provider') provider: string,
    @Res() res: Response,
  ) {
    const authorizationUrl =
      await this.authService.getAuthorizationUrl(provider);

    return res.redirect(authorizationUrl);
  }

  @Get('/callback')
  async handleAzureADCallback(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const tokens: JwtToken = await this.authService.getToken(
        'microsoft',
        code,
      );
      const redirectionPage: string =
        await this.authService.getRegisterRedirect(tokens, res);

      //return res.redirect('http://localhost:8108');
      return res.redirect(redirectionPage);
    } catch (error) {
      console.error('Error during Azure AD callback:', error);
      return res.status(500).json({ message: 'Authentication failed' });
    }
  }

  @Post('/register')
  async register(
    @Body() body: AccountDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.authService.Register({
      email: body.email,
      name: body.name,
      department: body.department,
    });

    return res.json({
      provider: result,
    });
  }

  @Post('/refresh-token/:provider')
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
    @Param('provider') provider: string,
    @Res() res: Response,
  ) {
    if (!refreshToken) {
      return res
        .status(400)
        .json({ message: 'not found accessToken from header' });
    }

    try {
      const result = await this.authService.getAccessToken(
        provider,
        refreshToken,
        res,
      );

      return res.json({
        idToken: result.idToken,
        accessToken: result.accessToken,
      });
    } catch (error) {
      return res
        .status(401)
        .json({ message: 'Unable to refresh access token' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/validate')
  async vefifyToken(@Res() res: Response) {
    return res.status(200).json({ data: { result: true } });
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify-token')
  verifyToken() {
    return { message: 'ok' };
  }
}
