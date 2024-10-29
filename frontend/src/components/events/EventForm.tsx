import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Paper,
  Alert,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import { EventType } from '../../types/event';
import { EventService } from '../../services/api';

const EVENT_TYPES = [
  EventType.CROSSPROMO,
  EventType.LIVEOPS,
  EventType.APP,
  EventType.ADS
] as const;

interface FormData {
  name: string;
  description: string;
  type: EventType;
  priority: number;
}

const EventForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: EventType.APP,
    priority: 0,
  });

  useEffect(() => {
    const loadEvent = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await EventService.getEvent(Number(id));
          const event = response.data;
          setFormData({
            name: event.name,
            description: event.description,
            type: event.type,
            priority: event.priority,
          });
        } catch (err) {
          setError('Failed to load event');
          navigate('/events');
        } finally {
          setLoading(false);
        }
      }
    };

    loadEvent();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (id) {
        await EventService.updateEvent(Number(id), formData);
      } else {
        await EventService.createEvent(formData);
      }
      navigate('/events');
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You are not authorized to create ads type events from your location');
      } else {
        setError('Failed to save event');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (event: SelectChangeEvent<EventType>) => {
    setFormData({
      ...formData,
      type: event.target.value as EventType
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper>
      <Box p={3} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" mb={3}>
          {id ? 'Edit Event' : 'Create New Event'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box display="grid" gap={3}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />

          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            multiline
            rows={4}
            disabled={loading}
          />

          <FormControl required>
            <InputLabel>Type</InputLabel>
            <Select<EventType>
              value={formData.type}
              onChange={handleTypeChange}
              label="Type"
              disabled={loading}
            >
              {EVENT_TYPES.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Priority"
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({
              ...formData,
              priority: Math.max(0, Math.min(10, parseInt(e.target.value) || 0))
            })}
            inputProps={{ min: 0, max: 10 }}
            required
            disabled={loading}
          />

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              type="button"
              onClick={() => navigate('/events')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {id ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default EventForm;