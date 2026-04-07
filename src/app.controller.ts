import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { TestHealthDto } from './common/dto/test-health.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Temporary: validates that GlobalValidationPipe is active (Phase 1 smoke test)
  @Post('test')
  testValidation(@Body() dto: TestHealthDto): TestHealthDto {
    return dto;
  }
}
