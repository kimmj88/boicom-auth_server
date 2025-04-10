import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { AppService } from "./app.service";
import { Response } from "express";

@Controller("app")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getEcho();
  }

  @Get("version")
  async find(@Res() res: Response) {
    return res.json(await this.appService.getVersion());
  }
}
