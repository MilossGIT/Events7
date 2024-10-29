import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AdPartnerService } from './ad-partner.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AdPartnerService', () => {
  let service: AdPartnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdPartnerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-value'),
          },
        },
      ],
    }).compile();

    service = module.get<AdPartnerService>(AdPartnerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAdsPermission', () => {
    it('should return true when ads type is enabled', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: { ads: 'sure, why not!' }
      });

      const result = await service.checkAdsPermission('US');

      expect(result).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://us-central1-o7tools.cloudfunctions.net/fun7-ad-partner',
        {
          params: { countryCode: 'US' },
          auth: {
            username: 'fun7user',
            password: 'fun7pass',
          },
        }
      );
    });

    it('should return false when ads type is disabled', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        status: 200,
        data: { ads: 'you shall not pass!' }
      });

      const result = await service.checkAdsPermission('US');

      expect(result).toBe(false);
    });

    it('should handle unauthorized access (401)', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 401 }
      });

      await expect(service.checkAdsPermission('US'))
        .rejects
        .toThrow(new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED));
    });

    it('should handle bad request (400)', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 400 }
      });

      await expect(service.checkAdsPermission('US'))
        .rejects
        .toThrow(new HttpException('Bad Request', HttpStatus.BAD_REQUEST));
    });

    it('should handle server errors (500)', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        response: { status: 500 }
      });

      await expect(service.checkAdsPermission('US'))
        .rejects
        .toThrow(new HttpException(
          'Ad partner service unavailable',
          HttpStatus.INTERNAL_SERVER_ERROR
        ));
    });

    it('should handle network errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(service.checkAdsPermission('US'))
        .rejects
        .toThrow(new HttpException(
          'Ad partner service unavailable',
          HttpStatus.INTERNAL_SERVER_ERROR
        ));
    });
  });
});