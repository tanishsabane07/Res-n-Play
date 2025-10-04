# Res-n-Play - Badminton Court Booking System

A MERN stack application for booking badminton courts where court owners can manage their facilities and players can book available time slots.

## Features

### For Players
- User registration and authentication
- Browse available courts
- View weekly schedules
- Book time slots
- View booking history

### For Court Owners
- Manage court listings
- Set operating hours and pricing
- View bookings and revenue
- Update court information

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## Project Structure

```
Res-n-Play/
├── server/                 # Backend API
│   ├── models/            # Database schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication & validation
│   └── config/            # Database configuration
└── client/                # Frontend React app (coming soon)
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/Res-n-Play.git
cd Res-n-Play/server
```

2. Install dependencies
```bash
npm install
```

3. Create environment variables
```bash
cp .env.example .env
```

4. Update .env file with your values:
```
MONGODB_URI=mongodb://localhost:27017/res-n-play
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

5. Start the server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

## Database Schema

### User Model
- Basic user information
- Role-based access (player/owner)
- Email verification status

### Court Model
- Court details and amenities
- Location and pricing
- Operating hours
- Owner relationship

## Current Status

✅ Backend setup complete  
✅ User authentication system  
✅ Database models defined  
🔄 Court management API (in progress)  
⏳ Frontend React app (upcoming)  
⏳ Booking system (upcoming)  

## Contributing

This is a personal learning project. Feel free to fork and experiment!

## License

MIT License