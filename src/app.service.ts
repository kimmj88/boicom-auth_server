import { Injectable } from '@nestjs/common';
import gitSync = require('git-rev-sync');
@Injectable()
export class AppService {
  getEcho(): string {
    return 'Service is running';
  }

  async getVersion(): Promise<
    | {
        version: string;
      }
    | undefined
  > {
    return {
      version: gitSync.tag(),
    };
  }
}
