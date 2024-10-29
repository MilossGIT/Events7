import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto, EventType } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

describe('EventsController', () => {
  let controller: EventsController;

  const mockEventsService = {
    create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 1, ...dto })),
    findAll: jest.fn().mockImplementation(() => Promise.resolve([
      { id: 1, name: 'Test Event', type: EventType.APP, priority: 1 }
    ])),
    findOne: jest.fn().mockImplementation((id) => Promise.resolve({
      id,
      name: 'Test Event',
      type: EventType.APP,
      priority: 1
    })),
    update: jest.fn().mockImplementation((id, dto) => Promise.resolve({ id, ...dto })),
    remove: jest.fn().mockImplementation(() => Promise.resolve()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const createEventDto: CreateEventDto = {
        name: 'Test Event',
        description: 'Test Description',
        type: EventType.APP,
        priority: 1,
      };

      const result = await controller.create(createEventDto, '127.0.0.1');
      expect(result.id).toBeDefined();
      expect(result.name).toBe(createEventDto.name);
      expect(mockEventsService.create).toHaveBeenCalledWith(createEventDto, '127.0.0.1');
    });
  });

  describe('findAll', () => {
    it('should return an array of events', async () => {
      const result = await controller.findAll();
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].id).toBeDefined();
      expect(mockEventsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single event', async () => {
      const result = await controller.findOne('1');
      expect(result.id).toBe(1);
      expect(mockEventsService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const updateEventDto: UpdateEventDto = {
        name: 'Updated Event'
      };

      const result = await controller.update('1', updateEventDto, '127.0.0.1');
      expect(result.name).toBe(updateEventDto.name);
      expect(mockEventsService.update).toHaveBeenCalledWith(1, updateEventDto, '127.0.0.1');
    });
  });

  describe('remove', () => {
    it('should remove an event', async () => {
      await controller.remove('1');
      expect(mockEventsService.remove).toHaveBeenCalledWith(1);
    });
  });
});