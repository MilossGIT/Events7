import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route, MemoryRouter } from 'react-router-dom';
import EventForm from '../EventForm';
import { EventService } from '../../../services/api';
import { EventType } from '../../../types/event';

jest.mock('../../../services/api', () => ({
  EventService: {
    createEvent: jest.fn(),
    getEvent: jest.fn(),
    updateEvent: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('EventForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderForm = (id?: string) => {
    const initialPath = id ? `/edit/${id}` : '/';
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/" element={<EventForm />} />
          <Route path="/edit/:id" element={<EventForm />} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('Form Fields', () => {
    it('should render form with defaults', async () => {
      renderForm();

      expect(screen.getByRole('heading')).toHaveTextContent(/create new event/i);
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveTextContent(EventType.APP);
      expect(screen.getByRole('spinbutton')).toHaveValue(0);
    });

    it('should load and display existing event data', async () => {
      const mockEvent = {
        id: 1,
        name: 'Existing Event',
        description: 'Test Description',
        type: EventType.LIVEOPS,
        priority: 5,
      };

      (EventService.getEvent as jest.Mock).mockResolvedValueOnce({
        data: mockEvent,
      });

      renderForm('1');

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      expect(screen.getByRole('heading')).toHaveTextContent(/edit event/i);
      expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue(mockEvent.name);
      expect(screen.getByRole('textbox', { name: /description/i })).toHaveValue(mockEvent.description);
      expect(screen.getByRole('combobox')).toHaveTextContent(mockEvent.type);
      expect(screen.getByRole('spinbutton')).toHaveValue(mockEvent.priority);
    });

    it('should handle event loading errors', async () => {
      (EventService.getEvent as jest.Mock).mockRejectedValueOnce(new Error('Failed to load'));

      renderForm('1');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/events');
      });
    });
  });

  describe('Event Type Selection', () => {
    it('should allow selecting different event types', async () => {
      renderForm();

      const combobox = screen.getByRole('combobox');
      fireEvent.mouseDown(combobox);

      const option = screen.getByRole('option', { name: EventType.LIVEOPS });
      fireEvent.click(option);

      expect(combobox).toHaveTextContent(EventType.LIVEOPS);
    });
  });

  describe('Form Submission', () => {
    const validEvent = {
      name: 'Test Event',
      description: 'Test Description',
      type: EventType.APP,
      priority: 5,
    };

    it('should submit valid form data', async () => {
      (EventService.createEvent as jest.Mock).mockResolvedValueOnce({
        data: { id: 1, ...validEvent },
      });

      renderForm();

      await userEvent.type(screen.getByRole('textbox', { name: /name/i }), validEvent.name);
      await userEvent.type(screen.getByRole('textbox', { name: /description/i }), validEvent.description);
      await userEvent.clear(screen.getByRole('spinbutton'));
      await userEvent.type(screen.getByRole('spinbutton'), validEvent.priority.toString());

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(EventService.createEvent).toHaveBeenCalledWith(expect.objectContaining(validEvent));
        expect(mockNavigate).toHaveBeenCalledWith('/events');
      });
    });

    it('should submit updates for existing event', async () => {
      const existingEvent = {
        id: 1,
        ...validEvent,
      };

      (EventService.getEvent as jest.Mock).mockResolvedValueOnce({
        data: existingEvent,
      });

      (EventService.updateEvent as jest.Mock).mockResolvedValueOnce({
        data: { ...existingEvent, priority: 8 },
      });

      renderForm('1');

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });

      await userEvent.clear(screen.getByRole('spinbutton'));
      await userEvent.type(screen.getByRole('spinbutton'), '8');

      fireEvent.click(screen.getByRole('button', { name: /update/i }));

      await waitFor(() => {
        expect(EventService.updateEvent).toHaveBeenCalledWith(1, expect.objectContaining({ priority: 8 }));
        expect(mockNavigate).toHaveBeenCalledWith('/events');
      });
    });

    it('should navigate back on cancel', async () => {
      renderForm();

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/events');
    });
  });

  describe('Loading States', () => {
    it('should show loading state during form submission', async () => {
      (EventService.createEvent as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderForm();

      await userEvent.type(screen.getByRole('textbox', { name: /name/i }), 'Test');
      await userEvent.type(screen.getByRole('textbox', { name: /description/i }), 'Test');

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      expect(await screen.findByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
    });
  });

  describe('API Error Handling', () => {
    it('should handle server validation errors', async () => {
      (EventService.createEvent as jest.Mock).mockRejectedValueOnce({
        response: { status: 400, data: { message: 'Validation failed' } }
      });

      renderForm();

      await userEvent.type(screen.getByRole('textbox', { name: /name/i }), 'Test');
      await userEvent.type(screen.getByRole('textbox', { name: /description/i }), 'Test');

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to save event/i)).toBeInTheDocument();
      });
    });

    it('should handle unauthorized ads type', async () => {
      (EventService.createEvent as jest.Mock).mockRejectedValueOnce({
        response: { status: 403 }
      });

      renderForm();

      await userEvent.type(screen.getByRole('textbox', { name: /name/i }), 'Test');
      await userEvent.type(screen.getByRole('textbox', { name: /description/i }), 'Test');

      const combobox = screen.getByRole('combobox');
      fireEvent.mouseDown(combobox);
      const adsOption = screen.getByRole('option', { name: EventType.ADS });
      fireEvent.click(adsOption);

      fireEvent.click(screen.getByRole('button', { name: /create/i }));

      await waitFor(() => {
        expect(screen.getByText(/not authorized/i)).toBeInTheDocument();
      });
    });
  });
});