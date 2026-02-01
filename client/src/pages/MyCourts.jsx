import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  Star,
  Calendar,
  AlertCircle
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { useAuth } from '../context/AuthContext'
import { courtService } from '../services/courtService'

export default function MyCourts() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courts, setCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true)
        setError('')
        const result = await courtService.getOwnerCourts()
        
        if (result.success) {
          setCourts(result.data.courts || [])
        } else {
          setError(result.error)
        }
      } catch (error) {
        console.error('Error fetching courts:', error)
        setError('Failed to load courts. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchCourts()
  }, [])

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
    )
  }

  const getTypeIcon = (type) => {
    // Return appropriate icon based on court type
    return <Users className="h-4 w-4" />
  }

  const filteredCourts = courts.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (court.location?.address || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && court.isActive) ||
                         (filterStatus === 'inactive' && !court.isActive)
    return matchesSearch && matchesStatus
  })

  const totalRevenue = 0 // This would come from backend analytics
  const totalBookings = 0 // This would come from backend analytics
  const activeCourts = courts.filter(court => court.isActive).length

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your courts...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-3" />
            <div>
              <p className="font-medium">Error loading courts</p>
              <p className="text-sm mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Courts</h1>
            <p className="mt-2 text-gray-600">
              Manage your court listings and track performance
            </p>
          </div>
          <Button asChild className="flex items-center space-x-2">
            <Link to="/owner/add-court">
              <Plus className="h-4 w-4" />
              <span>Add New Court</span>
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Courts</p>
                <p className="text-2xl font-semibold text-gray-900">{activeCourts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">{totalBookings}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search courts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Courts Grid */}
        {filteredCourts.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courts found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first court.'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button asChild>
                <Link to="/owner/add-court">Add Your First Court</Link>
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourts.map((court) => (
              <Card key={court.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Court Image */}
                <div className="aspect-video bg-gray-200 relative">
                  {court.images && court.images.length > 0 ? (
                    <img
                      src={court.images[0]}
                      alt={court.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Users className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(court.isActive)}
                  </div>
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Court
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          View Bookings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Court
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Court Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {court.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{court.location?.address || 'No address provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm mb-4">
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>₹{court.pricePerHour}/hour</span>
                    </div>
                    {court.description && (
                      <div className="text-gray-600 text-xs line-clamp-2">
                        {court.description}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Created: {new Date(court.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/owner/courts/${court._id}/time-slots`)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Time Slots
                    </Button>
                    <Button variant="outline" size="sm" className="col-span-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Bookings
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}