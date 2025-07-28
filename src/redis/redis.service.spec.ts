import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config: Record<string, any> = {
                REDIS_HOST: 'localhost',
                REDIS_PORT: 6379,
                REDIS_PASSWORD: undefined,
                REDIS_DB: 0,
                REDIS_KEY_PREFIX: 'test:',
                REDIS_RETRY_DELAY: 100,
                REDIS_MAX_RETRIES: null,
                REDIS_ENABLE_READY_CHECK: true,
                REDIS_LAZY_CONNECT: false,
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get Redis configuration', () => {
    const config = (service as any).config;
    expect(config.host).toBe('localhost');
    expect(config.port).toBe(6379);
    expect(config.keyPrefix).toBe('test:');
  });

  it('should handle health check', async () => {
    // Mock the Redis client for testing
    const mockClient = {
      ping: jest.fn().mockResolvedValue('PONG'),
    };
    (service as any).redisClient = mockClient;

    const result = await service.healthCheck();
    expect(result).toBe(true);
    expect(mockClient.ping).toHaveBeenCalled();
  });

  it('should handle health check failure', async () => {
    // Mock the Redis client for testing
    const mockClient = {
      ping: jest.fn().mockRejectedValue(new Error('Connection failed')),
    };
    (service as any).redisClient = mockClient;

    const result = await service.healthCheck();
    expect(result).toBe(false);
  });

  it('should handle JSON operations', async () => {
    const mockClient = {
      set: jest.fn().mockResolvedValue('OK'),
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue('{"test": "value"}'),
    };
    (service as any).redisClient = mockClient;

    const testData = { test: 'value' };
    await service.setJson('test-key', testData, 3600);
    expect(mockClient.setex).toHaveBeenCalledWith('test-key', 3600, JSON.stringify(testData));

    const result = await service.getJson('test-key');
    expect(result).toEqual(testData);
  });

  it('should handle basic operations', async () => {
    const mockClient = {
      set: jest.fn().mockResolvedValue('OK'),
      setex: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue('test-value'),
      del: jest.fn().mockResolvedValue(1),
      exists: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
    };
    (service as any).redisClient = mockClient;

    await service.set('test-key', 'test-value', 3600);
    expect(mockClient.setex).toHaveBeenCalledWith('test-key', 3600, 'test-value');

    const result = await service.get('test-key');
    expect(result).toBe('test-value');

    const deleted = await service.del('test-key');
    expect(deleted).toBe(1);

    const exists = await service.exists('test-key');
    expect(exists).toBe(1);
  });
}); 