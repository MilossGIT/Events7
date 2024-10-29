import { Test, TestingModule } from '@nestjs/testing';
import { GeoLocationService } from './geo-location.service';
import { HttpException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GeoLocationService', () => {
  let service: GeoLocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeoLocationService],
    }).compile();

    service = module.get<GeoLocationService>(GeoLocationService);
  });

  describe('getCountryCode', () => {
    it('should return country code successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { countryCode: 'US' } });
      const result = await service.getCountryCode('127.0.0.1');
      expect(result).toBe('US');
    });

    it('should handle API error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error());
      await expect(service.getCountryCode('127.0.0.1')).rejects.toThrow(HttpException);
    });
  });
});