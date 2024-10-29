import axios from 'axios';
import { Event } from '../types/event';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const EventService = {
  getAllEvents: () => api.get<Event[]>('/events'),
  getEvent: (id: number) => api.get<Event>(`/events/${id}`),
  createEvent: (event: Omit<Event, 'id'>) => api.post<Event>('/events', event),
  updateEvent: (id: number, event: Partial<Event>) => api.patch<Event>(`/events/${id}`, event),
  deleteEvent: (id: number) => api.delete(`/events/${id}`),
};