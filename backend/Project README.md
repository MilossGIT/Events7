# Events7 Technical Assessment Solution

## What I've Built

I've developed a dashboard application that helps analytics teams track various events in their applications. For example, when someone clicks a button in a mobile app, the analytics team can track this through our dashboard.

The system handles different types of events (crosspromo, liveops, app, and ads), with special attention to ads events that require location-based permissions.

## Technical Foundation

I built this solution using:

- React with TypeScript for the frontend (clean UI with Material-UI components)
- NestJS for the backend (handles all our business logic)
- PostgreSQL for data storage (using TypeORM for database management)

## Getting Started

### What You'll Need First

- Node.js installed
- PostgreSQL database system
- npm package manager

### Setting Up the Database

First, you need to set up PostgreSQL:

# Connect to PostgreSQL

psql -U postgres

# Create our database

CREATE DATABASE events7;

The application will handle table creation automatically through TypeORM.

### Starting the Backend

# Navigate to backend folder

cd backend

# Install dependencies

npm install

# Create a .env file with:

PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=events7
NODE_ENV=development

# Start the server

npm run start:dev

### Setting Up the Frontend

# Navigate to frontend folder

cd frontend

# Install dependencies

npm install

# Start the application

npm start

Note: When prompted that port 3000 is in use, press 'y' to use a different port (typically 3001).

## Testing the Implementation

### Backend Testing

cd backend
npm run test # Runs unit tests
npm run test:e2e # Runs end-to-end tests
npm run test:cov # Generates coverage report

I've implemented comprehensive tests covering:

- Event creation, reading, updating, and deletion
- Field validation
- Authorization for ads events
- Error handling scenarios
- External API integration

### Frontend Testing

cd frontend
npm test
npm test -- --coverage # For coverage report

The frontend tests ensure:

- Forms work correctly
- Events display properly
- Error messages show up when needed
- Loading states display appropriately
- Users can't submit invalid data

## Using the Application

### Main Features

Users can:

- View all events in a clean, organized table
- Create new events with all required information
- Edit existing events when needed
- Remove events that are no longer needed

### Creating a New Event

When creating an event, you'll need to provide:

- Name (what the event is called)
- Description (what it's tracking)
- Type (crosspromo, liveops, app, or ads)
- Priority (from 0 to 10)

For ads-type events, the system automatically checks if the user's location has permission to create them.

### Error Handling

I've implemented comprehensive error handling for:

- Database connection issues
- Invalid form submissions
- Unauthorized ads access attempts
- Network problems
- Server errors

Each error shows a user-friendly message explaining what went wrong.

## Additional Technical Details

### API Integration

For ads permissions, I've integrated with the specified external API:

Base URL: https://us-central1-o7tools.cloudfunctions.net/fun7-ad-partner
Auth: Basic (fun7user/fun7pass)

### Database Structure

Events are stored with:

- Unique ID (automatically generated)
- Name and description (required text fields)
- Type (enum of allowed types)
- Priority (number between 0-10)
- Creation and update timestamps

### Local Development Considerations

- The application includes special handling for localhost testing
- When running locally, the system automatically:
  - Detects localhost IPs (::1, 127.0.0.1)
  - Uses 'US' as the default country code
  - Allows testing of ads-type events locally

### Why This Approach?

Without this handling, testing ads-type events locally would fail because:

- Localhost IPs cannot be geolocated
- The external authorization API requires valid country codes
- This would make local development and testing difficult

### Production Environment

- In production, the application uses real geolocation
- IP detection and country validation work as specified
- External API authorization remains fully functional
