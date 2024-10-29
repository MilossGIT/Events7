import { Module } from '@nestjs/common';
import { GeoLocationService } from './services/geo-location/geo-location.service';
import { AdPartnerService } from './services/ad-partner/ad-partner.service';

@Module({
  providers: [GeoLocationService, AdPartnerService],
  exports: [GeoLocationService, AdPartnerService],
})
export class SharedModule { }