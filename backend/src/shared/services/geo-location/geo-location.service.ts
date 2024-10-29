import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeoLocationService {
  async getCountryCode(ip: string): Promise<string> {
    try {
      // Handle localhost cases
      if (ip === '::1' || ip === '127.0.0.1' || ip.includes('localhost')) {
        return 'US'; // Default to US for localhost
      }

      // For all other IPs, use the real API
      const response = await axios.get(`http://ip-api.com/json/${ip}`);
      return response.data.countryCode;
    } catch (error) {
      throw new HttpException(
        'Failed to get location information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}