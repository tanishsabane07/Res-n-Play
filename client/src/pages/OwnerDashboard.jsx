import { useState, useEffect } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { DollarSign, Users, Calendar, TrendingUp, Plus, MapPin, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { courtService } from '../services/courtService'
import { bookingService } from '../services/bookingService'

export default function OwnerDashboard() {
  const { user } = useAuth()
  const [courts, setCourts] = useState([])
  const [allBookings, setAllBookings] = useState([])
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch courts data and all bookings for revenue calculation
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')
        
        // First fetch courts
        const courtsResult = await courtService.getOwnerCourts()
        
        if (courtsResult.success) {
          const courtsData = courtsResult.data.courts || []
          setCourts(courtsData)
          
          // Fetch bookings for all courts to calculate revenue
          if (courtsData.length > 0) {
            const allBookingsData = []
            for (const court of courtsData) {
              const bookingsResult = await bookingService.getCourtBookings(court._id)
              if (bookingsResult.success) {
                const courtBookings = bookingsResult.data.bookings || []
                allBookingsData.push(...courtBookings.map(booking => ({ ...booking, courtName: court.name })))
              }
            }
            
            setAllBookings(allBookingsData)
            
            // Sort by booking date and get most recent for display
            const sortedBookings = allBookingsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            setRecentBookings(sortedBookings.slice(0, 5))
          }
        } else {
          setError(courtsResult.error)
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
  const totalCourts = courts.length
  const activeCourts = courts.filter(court => court.isActive).length
  const averagePrice = courts.length > 0 
    ? (courts.reduce((sum, court) => sum + court.pricePerHour, 0) / courts.length).toFixed(0)
    : 0

  // Calculate revenue and booking statistics
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  
  const todaysRevenue = allBookings
    .filter(booking => {
      const bookingDate = new Date(booking.playDate)
      return bookingDate >= todayStart && 
             bookingDate < todayEnd && 
             (booking.status === 'confirmed' || booking.status === 'completed') &&
             booking.paymentStatus === 'paid'
    })
    .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
  
  const activeBookings = allBookings.filter(booking => {
    const playDate = new Date(booking.playDate)
    return playDate >= new Date() && 
           booking.status === 'confirmed'
  }).length
  
  const monthlyRevenue = allBookings
    .filter(booking => {
      const bookingDate = new Date(booking.playDate)
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      return bookingDate.getMonth() === currentMonth &&
             bookingDate.getFullYear() === currentYear &&
             (booking.status === 'confirmed' || booking.status === 'completed') &&
             booking.paymentStatus === 'paid'
    })
    .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
    
  const lastMonthRevenue = allBookings
    .filter(booking => {
      const bookingDate = new Date(booking.playDate)
      const lastMonth = new Date().getMonth() - 1
      const year = lastMonth < 0 ? new Date().getFullYear() - 1 : new Date().getFullYear()
      const month = lastMonth < 0 ? 11 : lastMonth
      return bookingDate.getMonth() === month &&
             bookingDate.getFullYear() === year &&
             (booking.status === 'confirmed' || booking.status === 'completed') &&
             booking.paymentStatus === 'paid'
    })
    .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
  
  const monthlyGrowth = lastMonthRevenue > 0 
    ? (((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
    : monthlyRevenue > 0 ? '+100.0' : '0.0'

  return (
    <DashboardLayout>
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.name?.split(' ')[0] || 'Owner'}!
            </h1>
            <p className="mt-2 text-gray-600">
              Here's what's happening with your courts today.
            </p>
          </div>
          <Button asChild className="flex items-center space-x-2">
            <Link to="/owner/add-court">
              <Plus className="h-4 w-4" />
              <span>Add Court</span>
            </Link>
          </Button>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '...' : `₹${todaysRevenue.toLocaleString()}`}
                </p>
                <p className="text-xs text-gray-500">From confirmed bookings</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '...' : activeBookings}
                </p>
                <p className="text-xs text-gray-500">Upcoming confirmed</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courts</p>
                <p className="text-2xl font-semibold text-gray-900">{totalCourts}</p>
                <p className="text-xs text-gray-500">{activeCourts} active</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Growth</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loading ? '...' : `${monthlyGrowth >= 0 ? '+' : ''}${monthlyGrowth}%`}
                </p>
                <p className="text-xs text-gray-500">₹{monthlyRevenue.toLocaleString()} this month</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Court Management */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Court Management</h2>
              <Link to="/owner/courts">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading courts...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            ) : courts.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No courts created yet</p>
                <Button asChild>
                  <Link to="/owner/add-court">Add Your First Court</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {courts.slice(0, 3).map((court) => (
                  <div key={court._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{court.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${court.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                        <span>{court.isActive ? 'Active' : 'Inactive'}</span>
                        <span className="mx-2">•</span>
                        <span>₹{court.pricePerHour}/hour</span>
                      </div>
                      {court.location?.address && (
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{court.location.address}</span>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                ))}
                {courts.length > 3 && (
                  <div className="text-center pt-2">
                    <Link to="/owner/courts">
                      <Button variant="ghost" size="sm">
                        View {courts.length - 3} more courts
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bookings</h2>
            <div className="space-y-3">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No recent bookings</p>
                  <p className="text-xs text-gray-500 mt-1">Bookings will appear here once players start booking your courts</p>
                </div>
              ) : (
                recentBookings.map((booking) => (
                  <div key={booking._id} className="border-b last:border-b-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {booking.user?.name || 'Guest'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.courtName} • {new Date(booking.playDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {booking.startTime} - {booking.endTime} • 
                          <span className={`ml-1 capitalize ${
                            booking.status === 'confirmed' ? 'text-green-600' : 
                            booking.status === 'pending' ? 'text-yellow-600' : 
                            booking.status === 'completed' ? 'text-blue-600' : 'text-gray-600'
                          }`}>{booking.status}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">₹{booking.totalAmount}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}