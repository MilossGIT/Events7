import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { GeoLocationService } from '../shared/services/geo-location/geo-location.service';
import { AdPartnerService } from '../shared/services/ad-partner/ad-partner.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EventType } from './dto/create-event.dto';

describe('EventsService', () => {
  let service: EventsService;
  let adPartnerService: AdPartnerService;
  let geoLocationService: GeoLocationService;

  const mockRepository = {
    create: jest.fn(dto => dto),
    save: jest.fn(event => Promise.resolve({ id: 1, ...event })),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockGeoLocationService = {
    getCountryCode: jest.fn(),
  };

  const mockAdPartnerService = {
    checkAdsPermission: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockRepository,
        },
        {
          provide: GeoLocationService,
          useValue: mockGeoLocationService,
        },
        {
          provide: AdPartnerService,
          useValue: mockAdPartnerService,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    adPartnerService = module.get<AdPartnerService>(AdPartnerService);
    geoLocationService = module.get<GeoLocationService>(GeoLocationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createEventDto = {
      name: 'Test Event',
      description: 'Test Description',
      type: EventType.APP,
      priority: 5,
    };

    it('should create non-ads event without checking permissions', async () => {
      const result = await service.create(createEventDto, '127.0.0.1');
      expect(result).toBeDefined();
      expect(adPartnerService.checkAdsPermission).not.toHaveBeenCalled();
    });

    it('should create ads event when permission granted', async () => {
      const adsEvent = { ...createEventDto, type: EventType.ADS };
      mockGeoLocationService.getCountryCode.mockResolvedValue('US');
      mockAdPartnerService.checkAdsPermission.mockResolvedValue(true);

      const result = await service.create(adsEvent, '127.0.0.1');
      expect(result).toBeDefined();
      expect(result.type).toBe(EventType.ADS);
    });

    it('should reject ads event when permission denied', async () => {
      const adsEvent = { ...createEventDto, type: EventType.ADS };
      mockGeoLocationService.getCountryCode.mockResolvedValue('US');
      mockAdPartnerService.checkAdsPermission.mockResolvedValue(false);

      await expect(service.create(adsEvent, '127.0.0.1'))
        .rejects
        .toThrow(new HttpException(
          'Not authorized to create ads type events',
          HttpStatus.FORBIDDEN
        ));
    });

    it('should handle geolocation service failure', async () => {
      const adsEvent = { ...createEventDto, type: EventType.ADS };
      mockGeoLocationService.getCountryCode.mockRejectedValue(new HttpException(
        'Geolocation service unavailable',
        HttpStatus.INTERNAL_SERVER_ERROR
      ));

      await expect(service.create(adsEvent, '127.0.0.1'))
        .rejects
        .toThrow(HttpException);
    });
  });

  describe('findAll', () => {
    it('should return an array of events', async () => {
      const events = [
        { id: 1, name: 'Event 1', type: EventType.APP },
        { id: 2, name: 'Event 2', type: EventType.LIVEOPS },
      ];
      mockRepository.find.mockResolvedValue(events);

      const result = await service.findAll();
      expect(result).toEqual(events);
    });
  });

  describe('findOne', () => {
    it('should return a single event', async () => {
      const event = { id: 1, name: 'Test Event' };
      mockRepository.findOne.mockResolvedValue(event);

      const result = await service.findOne(1);
      expect(result).toEqual(event);
    });

    it('should throw error if event not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999))
        .rejects
        .toThrow(new HttpException('Event not found', HttpStatus.NOT_FOUND));
    });
  });

  describe('update', () => {
    const existingEvent = {
      id: 1,
      name: 'Existing Event',
      description: 'Description',
      type: EventType.APP,
      priority: 5,
    };

    beforeEach(() => {
      mockRepository.findOne.mockResolvedValue(existingEvent);
    });

    it('should validate event exists before update', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.update(999, { priority: 3 }, '127.0.0.1'))
        .rejects
        .toThrow(new HttpException('Event not found', HttpStatus.NOT_FOUND));
    });

    it('should handle ads type update with permission', async () => {
      mockGeoLocationService.getCountryCode.mockResolvedValue('US');
      mockAdPartnerService.checkAdsPermission.mockResolvedValue(true);

      const result = await service.update(1, { type: EventType.ADS }, '127.0.0.1');
      expect(result.type).toBe(EventType.ADS);
    });

    it('should handle ads type update without permission', async () => {
      mockGeoLocationService.getCountryCode.mockResolvedValue('US');
      mockAdPartnerService.checkAdsPermission.mockResolvedValue(false);

      await expect(service.update(1, { type: EventType.ADS }, '127.0.0.1'))
        .rejects
        .toThrow(new HttpException(
          'Not authorized to update to ads type events',
          HttpStatus.FORBIDDEN
        ));
    });

    it('should update non-ads type event without checking permissions', async () => {
      const updateDto = { name: 'Updated Name', type: EventType.APP };
      mockRepository.save.mockResolvedValue({ ...existingEvent, ...updateDto });

      const result = await service.update(1, updateDto, '127.0.0.1');
      expect(result.name).toBe(updateDto.name);
      expect(adPartnerService.checkAdsPermission).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should validate event exists before removal', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999))
        .rejects
        .toThrow(new HttpException('Event not found', HttpStatus.NOT_FOUND));
    });

    it('should remove existing event', async () => {
      const event = { id: 1, name: 'Test' };
      mockRepository.findOne.mockResolvedValue(event);

      await service.remove(1);
      expect(mockRepository.remove).toHaveBeenCalledWith(event);
    });
  });
});