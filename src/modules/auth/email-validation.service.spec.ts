import { Test, TestingModule } from '@nestjs/testing';
import { EmailValidationService } from './email-validation.service';

describe('EmailValidationService', () => {
  let service: EmailValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailValidationService],
    }).compile();

    service = module.get<EmailValidationService>(EmailValidationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
