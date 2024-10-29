import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto, EventType } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { GeoLocationService } from '../shared/services/geo-location/geo-location.service';
import { AdPartnerService } from '../shared/services/ad-partner/ad-partner.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    private geoLocationService: GeoLocationService,
    private adPartnerService: AdPartnerService,
  ) { }

  async create(createEventDto: CreateEventDto, clientIp: string): Promise<Event> {
    if (createEventDto.type === EventType.ADS) {
      const countryCode = await this.geoLocationService.getCountryCode(clientIp);
      const hasPermission = await this.adPartnerService.checkAdsPermission(countryCode);

      if (!hasPermission) {
        throw new HttpException(
          'Not authorized to create ads type events',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    const event = this.eventsRepository.create(createEventDto);
    return this.eventsRepository.save(event);
  }

  findAll(): Promise<Event[]> {
    return this.eventsRepository.find();
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({ where: { id } });
    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }
    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto, clientIp: string): Promise<Event> {
    const event = await this.findOne(id);

    if (updateEventDto.type === EventType.ADS) {
      const countryCode = await this.geoLocationService.getCountryCode(clientIp);
      const hasPermission = await this.adPartnerService.checkAdsPermission(countryCode);

      if (!hasPermission) {
        throw new HttpException(
          'Not authorized to update to ads type events',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    Object.assign(event, updateEventDto);
    return this.eventsRepository.save(event);
  }

  async remove(id: number): Promise<void> {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
  }
}
