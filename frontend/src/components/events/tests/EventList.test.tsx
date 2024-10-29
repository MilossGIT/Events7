import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EventList from '../EventList';
import { EventService } from '../../../services/api';

jest.mock('../../../services/api', () => ({
  EventService: {
    getAllEvents: jest.fn(),
    deleteEvent: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('EventList', () => {
  const mockEvents = [
    {
      id: 1,
      name: 'Test Event 1',
      description: 'Description 1',
      type: 'app',
      priority: 1,
    },
    {
      id: 2,
      name: 'Test Event 2',
      description: 'Description 2',
      type: 'liveops',
      priority: 5,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (EventService.getAllEvents as jest.Mock).mockResolvedValue({ data: mockEvents });
  });

  const renderList = () => {
    render(
      <BrowserRouter>
        <EventList />
      </BrowserRouter>
    );
  };

  it('displays event list', async () => {
    renderList();

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
      expect(screen.getByText('Test Event 2')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
      expect(screen.getByText('app')).toBeInTheDocument();
      expect(screen.getByText('liveops')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('navigates to create event', () => {
    renderList();

    fireEvent.click(screen.getByText(/create new event/i));
    expect(mockNavigate).toHaveBeenCalledWith('/events/create');
  });

  it('handles delete event', async () => {
    (EventService.deleteEvent as jest.Mock).mockResolvedValueOnce({});
    renderList();

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('row');

    const firstRow = rows[1];

    const buttons = within(firstRow).getAllByRole('button');

    fireEvent.click(buttons[1]);

    await waitFor(() => {
      expect(EventService.deleteEvent).toHaveBeenCalledWith(mockEvents[0].id);
      expect(EventService.getAllEvents).toHaveBeenCalledTimes(2);
    });
  });

  it('handles edit event', async () => {
    renderList();

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('row');

    const firstRow = rows[1];

    const buttons = within(firstRow).getAllByRole('button');

    fireEvent.click(buttons[0]);

    expect(mockNavigate).toHaveBeenCalledWith(`/events/edit/${mockEvents[0].id}`);
  });

  it('displays error when loading fails', async () => {
    (EventService.getAllEvents as jest.Mock).mockRejectedValueOnce(new Error());
    renderList();

    await waitFor(() => {
      expect(screen.getByText('Failed to load events')).toBeInTheDocument();
    });
  });

  it('displays error when deletion fails', async () => {
    (EventService.deleteEvent as jest.Mock).mockRejectedValueOnce(new Error());
    renderList();

    await waitFor(() => {
      expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('row');

    const firstRow = rows[1];

    const buttons = within(firstRow).getAllByRole('button');

    fireEvent.click(buttons[1]);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete event')).toBeInTheDocument();
    });
  });

  it('renders all table headers', () => {
    renderList();

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders correct number of events with action buttons', async () => {
    renderList();

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      expect(rows.length - 1).toBe(mockEvents.length);

      for (let i = 1; i < rows.length; i++) {
        const buttons = within(rows[i]).getAllByRole('button');
        expect(buttons).toHaveLength(2);
      }
    });
  });
});