import { Test, TestingModule } from '@nestjs/testing';
import { ServersGateway } from './servers.gateway';

describe('ServersGateway', () => {
  let gateway: ServersGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServersGateway],
    }).compile();

    gateway = module.get<ServersGateway>(ServersGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
