# Dashboard Testing Guide

## 🎉 Dashboard Implementation Complete!

Your Res-n-Play application now has fully functional dashboards for both players and court owners.

## How to Test the Dashboards

### 1. Start the Application

**Frontend:**
```bash
cd client
npm run dev
# Runs on http://localhost:5174
```

**Backend (in separate terminal):**
```bash
cd server
npm start
# Runs on http://localhost:3000
```

### 2. Testing Player Dashboard

1. Visit http://localhost:5174
2. Click "Join as Player" 
3. Fill out the signup form with:
   - Name: Test Player
   - Email: player@test.com
   - Phone: +1234567890
   - Password: password123
4. Check your email for verification (if email is configured)
5. Click "Sign in" and login with your credentials
6. You'll be automatically redirected to `/dashboard` which shows the **Player Dashboard**

**Player Dashboard Features:**
- ✅ Welcome message with user's name
- ✅ Quick action cards (Browse Courts, Quick Book, Booking History, Profile)
- ✅ Recent bookings list with status indicators
- ✅ Popular courts sidebar
- ✅ Personal stats (Total Bookings, This Month, Total Spent)
- ✅ Professional header with logout

### 3. Testing Owner Dashboard

1. Visit http://localhost:5174
2. Click "Join as Owner"
3. Fill out the signup form with:
   - Name: Test Owner
   - Email: owner@test.com
   - Phone: +1234567891
   - Password: password123
4. Login with owner credentials
5. You'll be redirected to the **Owner Dashboard**

**Owner Dashboard Features:**
- ✅ Revenue analytics cards (Total Revenue, Bookings, Active Courts, Monthly Revenue)
- ✅ Courts management section with toggle active/inactive
- ✅ Recent bookings from all courts
- ✅ Quick action buttons (Add Court, Manage Time Slots, Analytics, Settings)
- ✅ Professional owner header with "Owner" badge

## API Integration Status

### ✅ Working Features
- **Authentication**: Login/Signup with role-based access
- **Auto-redirect**: Users go to appropriate dashboard after login
- **Dashboard Data**: Real-time data from backend APIs
- **Court Management**: Owners can toggle court status
- **Booking Display**: Shows user's bookings with status
- **Stats Calculation**: Real revenue and booking statistics

### 🔄 API Calls Made by Dashboards

**Player Dashboard:**
- `GET /api/bookings/my-bookings` - User's bookings
- `GET /api/courts` - Popular courts to display

**Owner Dashboard:**  
- `GET /api/courts/owner/my-courts` - Owner's courts
- `GET /api/bookings/court/{courtId}/bookings` - Bookings per court
- `PATCH /api/courts/{id}/toggle-status` - Toggle court status

## Navigation Flow

```
Home Page (/) 
    ↓ (if not authenticated)
Login/Signup Modal
    ↓ (after successful login)
Auto-redirect to /dashboard
    ↓ (based on user role)
Player Dashboard (/dashboard) OR Owner Dashboard (/dashboard)
```

## Protected Routes

- `/dashboard` - Auto-routes to player or owner dashboard based on role
- `/player-dashboard` - Directly access player dashboard (player only)  
- `/owner-dashboard` - Directly access owner dashboard (owner only)
- `/` - Landing page (redirects to dashboard if authenticated)

## Testing Different User Types

**To test both dashboards:**
1. Create a player account, login, see player dashboard
2. Logout using the header logout button  
3. Create an owner account, login, see owner dashboard
4. Both accounts will persist in localStorage

## Backend Requirements

Make sure your backend server is running with:
- Database connection working
- JWT authentication enabled
- All API routes responding
- CORS configured for frontend

## Error Handling

Dashboards include:
- ✅ Loading states while fetching data
- ✅ Error messages for API failures  
- ✅ Empty states when no data exists
- ✅ Graceful fallbacks for missing data

## Next Features to Implement

1. **Court Listing Page** - Browse all courts
2. **Booking Flow** - Complete booking with payment
3. **Court Details** - Individual court pages
4. **Time Slot Management** - Owner can manage availability
5. **Real-time Notifications** - Booking confirmations
6. **Analytics Charts** - Visual revenue/booking data

Your dashboards are now fully functional and connected to the backend! 🚀