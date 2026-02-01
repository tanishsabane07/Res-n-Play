import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  ArrowLeft,
  Check,
  AlertCircle,
  Camera
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { courtService } from '../services/courtService'
import { bookingService } from '../services/bookingService'
import { timeslotService } from '../services/timeslotService'
import { useAuth } from '../context/AuthContext'

export default function BookCourt() {
  const { courtId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [court, setCourt] = useState(null)
  const [timeSlots, setTimeSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Booking form data
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get('date') || new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState('')

  // Fetch court details
  useEffect(() => {
    const fetchCourt = async () => {
      try {
        setLoading(true)
        setError('')
        
        const result = await courtService.getCourtById(courtId)
        
        if (result.success) {
          setCourt(result.data.court)
        } else {
          setError(result.error || 'Failed to load court details')
        }
        
      } catch (error) {
        console.error('Error fetching court:', error)
        setError('Failed to load court details')
      } finally {
        setLoading(false)
      }
    }

    if (courtId) {
      fetchCourt()
    }
  }, [courtId])

  // Fetch available time slots when court or date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!court || !selectedDate) return
      
      try {
        setSlotsLoading(true)
        setSelectedSlot(null)
        
        const result = await timeslotService.getAvailableSlots(courtId, selectedDate)
        
        if (result.success) {
          setTimeSlots(result.data.timeSlots || [])
        } else {
          setTimeSlots([])
          console.error('Failed to fetch time slots:', result.error)
        }
        
      } catch (error) {
        console.error('Error fetching time slots:', error)
        setTimeSlots([])
      } finally {
        setSlotsLoading(false)
      }
    }

    fetchTimeSlots()
  }, [court, courtId, selectedDate])

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value)
  }

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot)
  }

  const calculateTotalAmount = () => {
    if (!selectedSlot) return 0
    return selectedSlot.price || 0
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    
    if (!selectedSlot || !selectedDate) {
      setBookingError('Please select a time slot')
      return
    }
    
    try {
      setBookingLoading(true)
      setBookingError('')
      
      const bookingPayload = {
        notes: notes || ''
      }
      
      const result = await bookingService.createSlotBooking(selectedSlot._id, bookingPayload)
      
      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/player')
        }, 2000)
      } else {
        setBookingError(result.error || 'Failed to create booking')
      }
      
    } catch (error) {
      console.error('Error creating booking:', error)
      setBookingError('Failed to create booking')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading court details...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Court</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/player/find-courts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Find Courts
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-4">
              Your court has been successfully booked. You will be redirected to your dashboard.
            </p>
            <div className="space-x-3">
              <Button onClick={() => navigate('/player')}>
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/player/find-courts')}>
                Book Another Court
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/player/find-courts')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Find Courts</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Court Details */}
          <div>
            <Card className="overflow-hidden">
              {/* Court Image */}
              <div className="relative h-64 bg-gray-200">
                {court.images && court.images.length > 0 ? (
                  <img
                    src={court.images[0]}
                    alt={court.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <Camera className="h-16 w-16 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Court Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{court.name}</h1>
                    <Badge variant="outline" className="capitalize">
                      {court.sportType || 'Multi-sport'}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{court.pricePerHour}/hour
                  </div>
                </div>

                {/* Location */}
                {court.location && (
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <div>
                      <p>{court.location.address}</p>
                      {court.location.city && <p className="text-sm">{court.location.city}</p>}
                    </div>
                  </div>
                )}

                {/* Operating Hours */}
                <div className="flex items-center text-gray-600 mb-4">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>
                    {court.operatingHours?.start || '06:00'} - {court.operatingHours?.end || '22:00'}
                  </span>
                </div>

                {/* Description */}
                {court.description && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600 text-sm">{court.description}</p>
                  </div>
                )}

                {/* Amenities */}
                {court.amenities && court.amenities.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {court.amenities.map(amenity => (
                        <Badge key={amenity} variant="secondary" className="capitalize">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Booking Form */}
          <div>
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Book This Court</h2>
              
              <form onSubmit={handleBooking} className="space-y-6">
                {/* Date Selection */}
                <div>
                  <Label htmlFor="date">Play Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                {/* Available Time Slots */}
                <div>
                  <Label>Available Time Slots *</Label>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-8 border rounded-lg">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-600">Loading slots...</span>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="text-center py-8 border rounded-lg">
                      <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">No available slots for this date</p>
                      <p className="text-xs text-gray-500 mt-1">Try selecting a different date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot._id}
                          type="button"
                          onClick={() => handleSlotSelect(slot)}
                          className={`p-3 border rounded-lg text-sm transition-colors ${
                            selectedSlot?._id === slot._id
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ₹{slot.price}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="Any special requirements or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Total Amount */}
                {selectedSlot && calculateTotalAmount() > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Total Amount:</span>
                      <span className="text-xl font-bold text-green-600">
                        ₹{calculateTotalAmount().toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedSlot.startTime} - {selectedSlot.endTime} on {new Date(selectedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {bookingError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-red-700">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">{bookingError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={bookingLoading || !court.isActive || !selectedSlot}
                >
                  {bookingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      {!selectedSlot ? 'Select a Time Slot' : court.isActive ? 'Book Now' : 'Court Unavailable'}
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}