import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { logger } from 'util/logger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    logger({
      message: "nice thing",
      desc: "Text successfully changed to audio",
      type: "success"
    })
    return this.appService.getHello();
  }
}
