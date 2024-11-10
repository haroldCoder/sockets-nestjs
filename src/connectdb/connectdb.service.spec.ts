import { Test, TestingModule } from '@nestjs/testing';
import { ConnectdbService } from './connectdb.service';

describe('ConnectdbService', () => {
  let service: ConnectdbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectdbService],
    }).compile();

    service = module.get<ConnectdbService>(ConnectdbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
