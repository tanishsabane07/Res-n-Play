# Res-n-Play Frontend - API Integration

## Overview
The frontend is now fully integrated with the backend API endpoints. All API calls are handled through service modules located in `/src/services/`.

## API Services

### 1. Authentication Service (`authService.js`)
Handles user authentication and account management.

**Available Methods:**
- `signup(userData)` - Create a new user account
- `login(credentials)` - Sign in to an existing account
- `logout()` - Sign out and clear session
- `getCurrentUser()` - Get the currently logged-in user
- `isAuthenticated()` - Check if user is authenticated
- `verifyEmail(token)` - Verify email address
- `forgotPassword(email)` - Request password reset
- `resetPassword(token, newPassword)` - Reset password

**Example Usage:**
```javascript
import { authService } from '../services';

// Sign up
const result = await authService.signup({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  phone: '+1234567890',
  role: 'player' // or 'owner'
});

// Login
const data = await authService.login({
  email: 'john@example.com',
  password: 'password123'
});
```

### 2. Court Service (`courtService.js`)
Manages court listings and operations.

**Available Methods:**
- `getAllCourts(filters)` - Get all courts (public)
- `getCourtById(courtId)` - Get specific court details
- `getOwnerCourts()` - Get courts owned by current user (auth required)
- `createCourt(courtData)` - Create a new court (owner only)
- `updateCourt(courtId, courtData)` - Update court details (owner only)
- `deleteCourt(courtId)` - Delete a court (owner only)
- `toggleCourtStatus(courtId)` - Enable/disable court (owner only)

**Example Usage:**
```javascript
import { courtService } from '../services';

// Browse courts
const courts = await courtService.getAllCourts({
  location: 'New York',
  sportType: 'basketball'
});

// Create court (owner)
const newCourt = await courtService.createCourt({
  name: 'Downtown Basketball Court',
  location: 'New York, NY',
  sportType: 'basketball',
  pricePerHour: 50,
  // ... other fields
});
```

### 3. Booking Service (`bookingService.js`)
Handles booking creation and management.

**Available Methods:**
- `createBooking(bookingData)` - Create a new booking
- `confirmPayment(bookingId, paymentData)` - Confirm booking payment
- `getUserBookings()` - Get current user's bookings
- `getBookingById(bookingId)` - Get specific booking details
- `cancelBooking(bookingId)` - Cancel a booking
- `getCourtBookings(courtId)` - Get all bookings for a court (owner only)
- `completeBooking(bookingId)` - Mark booking as completed (owner only)

**Example Usage:**
```javascript
import { bookingService } from '../services';

// Create booking
const booking = await bookingService.createBooking({
  courtId: '123abc',
  timeslotId: '456def',
  date: '2026-01-30',
  // ... other fields
});

// View my bookings
const myBookings = await bookingService.getUserBookings();
```

### 4. Timeslot Service (`timeslotService.js`)
Manages court availability and time slots.

**Available Methods:**
- `getAvailableSlots(courtId, date)` - Get available slots for a court
- `generateTimeSlots(courtId, slotData)` - Generate time slots (owner only)
- `getCourtSlots(courtId, filters)` - Get court slots for management (owner only)
- `updateSlotAvailability(slotId, availabilityData)` - Update slot availability (owner only)
- `deleteTimeSlots(courtId, deleteData)` - Delete time slots (owner only)

**Example Usage:**
```javascript
import { timeslotService } from '../services';

// Get available slots
const slots = await timeslotService.getAvailableSlots(
  '123abc',
  '2026-01-30'
);

// Generate slots (owner)
await timeslotService.generateTimeSlots('123abc', {
  startDate: '2026-02-01',
  endDate: '2026-02-28',
  startTime: '09:00',
  endTime: '21:00',
  slotDuration: 60
});
```

## Authentication Flow

### Signup Flow
1. User clicks "Join as Player" or "Join as Owner"
2. `SignupModal` opens with the selected role
3. User fills in registration form
4. Frontend calls `authService.signup(userData)`
5. Backend sends verification email
6. Success message shown, redirected to login
7. User verifies email and can then login

### Login Flow
1. User clicks "Sign In" button
2. `LoginModal` opens
3. User enters credentials
4. Frontend calls `authService.login(credentials)`
5. Backend validates and returns JWT token
6. Token stored in localStorage
7. User state updated, redirect to dashboard

### Token Management
- JWT token automatically attached to all API requests via axios interceptor
- Token stored in localStorage for persistence
- Auto-logout on 401 (unauthorized) responses
- Token refreshes on app reload if valid

## Environment Configuration

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3000/api
```

For production, update to your production API URL.

## Error Handling

All services include error handling:

```javascript
try {
  const data = await courtService.getAllCourts();
  // Handle success
} catch (error) {
  console.error('Error:', error.response?.data?.message || error.message);
  // Handle error
}
```

## Components with API Integration

### Current Implementation
- ✅ `App.jsx` - Authentication state management with API
- ✅ `LoginModal` - Login form with API integration
- ✅ `SignupModal` - Registration form with API integration
- ✅ `Home.jsx` - Landing page with auth modals

### Next Steps
Create these components to complete the application:

1. **Court Listing Page** - Browse and search courts
2. **Court Details Page** - View court details and book slots
3. **Booking Page** - Complete booking with payment
4. **My Bookings Page** - View and manage user's bookings
5. **Owner Dashboard** - Manage courts, slots, and bookings
6. **User Profile Page** - Edit profile and settings

## Running the Application

### Backend
```bash
cd server
npm install
npm start
# Server runs on http://localhost:3000
```

### Frontend
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5174
```

## API Testing

The API services can be tested using the browser console:

```javascript
// Import services in your component
import { authService, courtService, bookingService, timeslotService } from '../services';

// Test login
const result = await authService.login({
  email: 'test@example.com',
  password: 'password123'
});

// Test getting courts
const courts = await courtService.getAllCourts();
console.log(courts);
```

## Security Features

- ✅ JWT token-based authentication
- ✅ Automatic token injection in requests
- ✅ Secure token storage
- ✅ Auto-logout on token expiration
- ✅ Protected routes with role-based access
- ✅ CORS enabled on backend

## Next Development Steps

1. Create court listing and search functionality
2. Implement booking flow with time slot selection
3. Add payment integration
4. Build owner dashboard with analytics
5. Add user profile management
6. Implement real-time notifications
7. Add email templates for notifications
8. Implement booking reminders
