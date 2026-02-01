import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Star, 
  Users, 
  Wifi, 
  Car, 
  Shield, 
  Camera,
  Lightbulb,
  Home,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { courtService } from '../services/courtService'
import { useAuth } from '../context/AuthContext'

const amenityIcons = {
  parking: Car,
  lighting: Lightbulb,
  restroom: Home,
  wifi: Wifi,
  security: Shield,
  cctv: Camera,
}

export default function FindCourts() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courts, setCourts] = useState([])
  const [filteredCourts, setFilteredCourts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSport, setSelectedSport] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [selectedAmenities, setSelectedAmenities] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showFilters, setShowFilters] = useState(false)

  // Fetch all active courts
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setLoading(true)
        setError('')
        
        const result = await courtService.getAllCourts()
        
        if (result.success) {
          const activeCourts = result.data.courts.filter(court => court.isActive)
          setCourts(activeCourts)
          setFilteredCourts(activeCourts)
        } else {
          setError(result.error || 'Failed to load courts')
        }
        
      } catch (error) {
        console.error('Error fetching courts:', error)
        setError('Failed to load courts')
      } finally {
        setLoading(false)
      }
    }

    fetchCourts()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...courts]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(court => 
        court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        court.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        court.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sport type filter
    if (selectedSport !== 'all') {
      filtered = filtered.filter(court => court.sportType === selectedSport)
    }

    // Price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number)
      filtered = filtered.filter(court => {
        const price = court.pricePerHour
        if (max) {
          return price >= min && price <= max
        } else {
          return price >= min
        }
      })
    }

    // Amenities filter
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(court => 
        selectedAmenities.every(amenity => court.amenities?.includes(amenity))
      )
    }

    setFilteredCourts(filtered)
  }, [courts, searchQuery, selectedSport, priceRange, selectedAmenities])

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSport('all')
    setPriceRange('all')
    setSelectedAmenities([])
  }

  const handleBookCourt = (courtId) => {
    navigate(`/player/book-court/${courtId}?date=${selectedDate}`)
  }

  const getSportTypes = () => {
    const types = [...new Set(courts.map(court => court.sportType))]
    return types.filter(Boolean)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">Finding courts for you...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Courts</h1>
          <p className="mt-2 text-gray-600">
            Discover and book the perfect court for your game
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by court name, location, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-40"
              />
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Sport Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
                  <Select value={selectedSport} onValueChange={setSelectedSport}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Sports" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sports</SelectItem>
                      {getSportTypes().map(sport => (
                        <SelectItem key={sport} value={sport} className="capitalize">
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="0-500">₹0 - ₹500</SelectItem>
                      <SelectItem value="501-1000">₹501 - ₹1000</SelectItem>
                      <SelectItem value="1001-2000">₹1001 - ₹2000</SelectItem>
                      <SelectItem value="2001">₹2001+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amenities */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(amenityIcons).map(amenity => {
                      const Icon = amenityIcons[amenity]
                      const isSelected = selectedAmenities.includes(amenity)
                      return (
                        <button
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm border transition-colors ${
                            isSelected
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="h-3 w-3" />
                          <span className="capitalize">{amenity}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {filteredCourts.length} court{filteredCourts.length !== 1 ? 's' : ''} found
            {selectedDate && (
              <span className="ml-2 text-sm">
                for {new Date(selectedDate).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-6 mb-6">
            <div className="text-center text-red-600">
              <p>{error}</p>
            </div>
          </Card>
        )}

        {/* No Results */}
        {!loading && filteredCourts.length === 0 && !error && (
          <Card className="p-12">
            <div className="text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courts found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          </Card>
        )}

        {/* Courts Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourts.map((court) => (
            <Card key={court._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Court Image */}
              <div className="relative h-48 bg-gray-200">
                {court.images && court.images.length > 0 ? (
                  <img
                    src={court.images[0]}
                    alt={court.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <Camera className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge 
                    variant={court.isActive ? "default" : "secondary"}
                    className={court.isActive ? "bg-green-500" : "bg-gray-500"}
                  >
                    {court.isActive ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>

              <div className="p-6">
                {/* Court Header */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{court.name}</h3>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {court.sportType || 'Multi-sport'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      ₹{court.pricePerHour}
                    </p>
                    <p className="text-xs text-gray-500">per hour</p>
                  </div>
                </div>

                {/* Location */}
                {court.location && (
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="truncate">
                      {court.location.address}
                      {court.location.city && `, ${court.location.city}`}
                    </span>
                  </div>
                )}

                {/* Operating Hours */}
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {court.operatingHours?.start || '06:00'} - {court.operatingHours?.end || '22:00'}
                  </span>
                </div>

                {/* Amenities */}
                {court.amenities && court.amenities.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {court.amenities.slice(0, 4).map(amenity => {
                        const Icon = amenityIcons[amenity]
                        return Icon ? (
                          <div
                            key={amenity}
                            className="flex items-center bg-gray-100 rounded px-2 py-1"
                            title={amenity}
                          >
                            <Icon className="h-3 w-3 text-gray-600" />
                          </div>
                        ) : null
                      })}
                      {court.amenities.length > 4 && (
                        <div className="flex items-center bg-gray-100 rounded px-2 py-1 text-xs text-gray-600">
                          +{court.amenities.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <Button 
                  onClick={() => handleBookCourt(court._id)}
                  className="w-full"
                  disabled={!court.isActive}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {court.isActive ? 'Book Now' : 'Unavailable'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}