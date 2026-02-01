import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Calendar, Clock, MapPin, Star, AlertCircle, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { bookingService } from '../services/bookingService'
import { courtService } from '../services/courtService'

export default function PlayerDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch user's bookings and courts data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')
        
        // Fetch user bookings and all courts in parallel
        const [bookingsResult, courtsResult] = await Promise.all([
          bookingService.getUserBookings(),
          courtService.getAllCourts()
        ])
        
        if (bookingsResult.success) {
          setBookings(bookingsResult.data.bookings || [])
        }
        
        if (courtsResult.success) {
          setCourts(courtsResult.data.courts || [])
        }
        
        if (!bookingsResult.success || !courtsResult.success) {
          setError('Failed to load some data')
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate statistics from real data
  const totalBookings = bookings.length
  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.playDate) >= new Date() && booking.status !== 'cancelled'
  )
  const completedBookings = bookings.filter(booking => booking.status === 'completed')
  const totalHours = completedBookings.reduce((sum, booking) => {
    const start = new Date(`2000-01-01T${booking.startTime}:00`)
    const end = new Date(`2000-01-01T${booking.endTime}:00`)
    return sum + (end - start) / (1000 * 60 * 60) // Convert milliseconds to hours
  }, 0)

  return (
    <DashboardLayout>
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0] || 'Player'}! 
            </h1>
            <p className="mt-2 text-gray-600">
              Ready to book your next game? Let's find you a perfect court.
            </p>
          </div>
          <Button asChild className="flex items-center space-x-2">
            <Link to="/player/find-courts">
              <Search className="h-4 w-4" />
              <span>Find Courts</span>
            </Link>
          </Button>
        </div>

        {/* Quick Stats */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="ml-4">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalBookings}</p>
                  <p className="text-xs text-gray-500">{completedBookings.length} completed</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hours Played</p>
                  <p className="text-2xl font-semibold text-gray-900">{Math.round(totalHours)}</p>
                  <p className="text-xs text-gray-500">Total game time</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Courts</p>
                  <p className="text-2xl font-semibold text-gray-900">{courts.length}</p>
                  <p className="text-xs text-gray-500">Courts to explore</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-semibold text-gray-900">{upcomingBookings.length}</p>
                  <p className="text-xs text-gray-500">Future bookings</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Button className="h-20 flex flex-col justify-center">
                <Calendar className="h-6 w-6 mb-2" />
                <span>Book a Court</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col justify-center">
                <MapPin className="h-6 w-6 mb-2" />
                <span>Find Courts</span>
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Bookings</h2>
            <div className="space-y-3">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No upcoming bookings</p>
                  <p className="text-xs text-gray-500 mt-1">Book a court to get started!</p>
                </div>
              ) : (
                upcomingBookings.slice(0, 3).map((booking) => (
                  <div key={booking._id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {booking.court?.name || 'Court'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.playDate).toLocaleDateString()} • {booking.startTime} - {booking.endTime}
                        </p>
                        <p className="text-xs text-gray-400">
                          Status: <span className={`capitalize ${
                            booking.status === 'confirmed' ? 'text-green-600' : 
                            booking.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                          }`}>{booking.status}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">₹{booking.totalAmount}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {upcomingBookings.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm">
                    View All Bookings
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}