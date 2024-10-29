import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { Event } from '../../types/event';
import { EventService } from '../../services/api';

const EventList: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await EventService.getAllEvents();
      setEvents(response.data);
    } catch (err) {
      setError('Failed to load events');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await EventService.deleteEvent(id);
      loadEvents();
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Events Dashboard</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/events/create')}
        >
          Create New Event
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.name}</TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell>{event.type}</TableCell>
                <TableCell>{event.priority}</TableCell>
                <TableCell>
                  <IconButton onClick={() => event.id && navigate(`/events/edit/${event.id}`)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => event.id && handleDelete(event.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EventList;