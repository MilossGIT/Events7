import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { EventType } from '../src/events/dto/create-event.dto';

describe('Events (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const validEvent = {
    name: 'Test Event',
    description: 'Test Description',
    type: EventType.APP,
    priority: 5,
  };

  describe('Create Event', () => {
    it('should create a valid event', () => {
      return request(app.getHttpServer())
        .post('/events')
        .send(validEvent)
        .expect(201)
        .expect(res => {
          expect(res.body.id).toBeDefined();
          expect(res.body.name).toBe(validEvent.name);
        });
    });

    it('should validate mandatory fields', () => {
      return request(app.getHttpServer())
        .post('/events')
        .send({})
        .expect(400);
    });

    it('should validate priority range', () => {
      return request(app.getHttpServer())
        .post('/events')
        .send({ ...validEvent, priority: 11 })
        .expect(400);
    });

    it('should validate event type', () => {
      return request(app.getHttpServer())
        .post('/events')
        .send({ ...validEvent, type: 'invalid' })
        .expect(400);
    });
  });

  describe('Read Events', () => {
    it('should get all events', () => {
      return request(app.getHttpServer())
        .get('/events')
        .expect(200)
        .expect(res => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should get one event', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/events')
        .send(validEvent);

      return request(app.getHttpServer())
        .get(`/events/${createResponse.body.id}`)
        .expect(200)
        .expect(res => {
          expect(res.body.name).toBe(validEvent.name);
        });
    });
  });

  describe('Update Event', () => {
    it('should update an event', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/events')
        .send(validEvent);

      const updateData = { priority: 8 };

      return request(app.getHttpServer())
        .patch(`/events/${createResponse.body.id}`)
        .send(updateData)
        .expect(200)
        .expect(res => {
          expect(res.body.priority).toBe(updateData.priority);
        });
    });
  });

  describe('Delete Event', () => {
    it('should delete an event', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/events')
        .send(validEvent);

      await request(app.getHttpServer())
        .delete(`/events/${createResponse.body.id}`)
        .expect(200);

      return request(app.getHttpServer())
        .get(`/events/${createResponse.body.id}`)
        .expect(404);
    });
  });
});