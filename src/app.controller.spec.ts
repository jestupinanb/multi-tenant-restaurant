import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health check status', () => {
      const result = appController.healthCheck();
      expect(result.status).toBe('ok');
      expect(result.timestamp).toEqual(
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      );
    });
  });
});
