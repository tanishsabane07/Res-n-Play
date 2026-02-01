import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import HomePage from "./pages/HomePage.jsx"
import LoginPage from "./pages/Login.jsx"
import PlayerDashboard from './pages/PlayerDashboard.jsx'
import OwnerDashboard from './pages/OwnerDashboard.jsx'
import AddCourt from './pages/AddCourt.jsx'
import MyCourts from './pages/MyCourts.jsx'
import FindCourts from './pages/FindCourts.jsx'
import BookCourt from './pages/BookCourt.jsx'
import ManageTimeSlots from './pages/ManageTimeSlots.jsx'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Dashboard Route Component (redirects based on user role)
const DashboardRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return user?.role === 'owner' ? <Navigate to="/owner" /> : <Navigate to="/player" />;
};

function App() {
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/player" element={
            <ProtectedRoute>
              <PlayerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/player/find-courts" element={
            <ProtectedRoute>
              <FindCourts />
            </ProtectedRoute>
          } />
          <Route path="/player/book-court/:courtId" element={
            <ProtectedRoute>
              <BookCourt />
            </ProtectedRoute>
          } />
          <Route path="/owner" element={
            <ProtectedRoute>
              <OwnerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/owner/add-court" element={
            <ProtectedRoute>
              <AddCourt />
            </ProtectedRoute>
          } />
          <Route path="/owner/courts" element={
            <ProtectedRoute>
              <MyCourts />
            </ProtectedRoute>
          } />
          <Route path="/owner/courts/:courtId/time-slots" element={
            <ProtectedRoute>
              <ManageTimeSlots />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
