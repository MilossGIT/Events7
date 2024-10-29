import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface AdPartnerResponse {
  ads: string;
}

@Injectable()
export class AdPartnerService {
  constructor(private configService: ConfigService) { }

  async checkAdsPermission(countryCode: string): Promise<boolean> {
    try {
      const response = await axios.get<AdPartnerResponse>(
        'https://us-central1-o7tools.cloudfunctions.net/fun7-ad-partner',
        {
          params: { countryCode },
          auth: {
            username: 'fun7user',
            password: 'fun7pass',
          },
        },
      );

      return response.data.ads === 'sure, why not!';
    } catch (error) {
      if (error.response?.status === 401) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (error.response?.status === 400) {
        throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        'Ad partner service unavailable',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}