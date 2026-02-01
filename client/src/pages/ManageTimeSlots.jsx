import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  ArrowLeft,
  AlertCircle,
  Check,
  X,
  Settings
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { courtService } from '../services/courtService'
import { timeslotService } from '../services/timeslotService'
import { useAuth } from '../context/AuthContext'

export default function ManageTimeSlots() {
  const { courtId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [court, setCourt] = useState(null)
  const [timeSlots, setTimeSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [generatingSlots, setGeneratingSlots] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form data for generating slots
  const [generateForm, setGenerateForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    slotDuration: 60 // minutes
  })
  
  // Date range for viewing slots
  const [viewRange, setViewRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })

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

  // Fetch time slots
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!court) return
      
      try {
        setSlotsLoading(true)
        
        console.log('Fetching timeslots for court:', courtId);
        console.log('Date range:', viewRange.startDate, 'to', viewRange.endDate);
        
        const result = await timeslotService.getCourtSlots(
          courtId, 
          viewRange.startDate, 
          viewRange.endDate
        )
        
        console.log('Fetch timeslots result:', result);
        
        if (result.success) {
          const slots = result.data.timeSlots || result.data.slots || [];
          console.log('Extracted slots:', slots.length, 'slots');
          setTimeSlots(slots)
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
  }, [court, courtId, viewRange])

  const handleGenerateFormChange = (e) => {
    const { name, value } = e.target
    setGenerateForm(prev => ({
      ...prev,
      [name]: name === 'slotDuration' ? parseInt(value) : value
    }))
  }

  const handleViewRangeChange = (e) => {
    const { name, value } = e.target
    setViewRange(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleGenerateSlots = async (e) => {
    e.preventDefault()
    
    try {
      setGeneratingSlots(true)
      setError('')
      setSuccess('')
      
      console.log('Generating slots with data:', {
        courtId,
        courtName: court?.name,
        courtOperatingHours: court?.operatingHours,
        courtOperatingHoursStart: court?.operatingHours?.start,
        courtOperatingHoursEnd: court?.operatingHours?.end,
        startDate: generateForm.startDate,
        endDate: generateForm.endDate,
        slotDuration: generateForm.slotDuration
      });
      
      // Basic validation
      if (!courtId) {
        setError('Court ID is missing');
        return;
      }
      
      if (new Date(generateForm.startDate) > new Date(generateForm.endDate)) {
        setError('Start date cannot be after end date');
        return;
      }
      
      const result = await timeslotService.generateSlots(
        courtId,
        generateForm.startDate,
        generateForm.endDate,
        generateForm.slotDuration
      )
      
      console.log('Generate slots result:', result);
      
      if (result.success) {
        const generatedCount = result.data?.generatedSlots || result.data?.slots?.length || 0;
        console.log('Extracted generated count:', generatedCount);
        console.log('Full result data:', JSON.stringify(result.data, null, 2));
        
        setSuccess(`Generated ${generatedCount} time slots successfully!`)
        // Refresh the time slots view
        setViewRange({
          startDate: generateForm.startDate,
          endDate: generateForm.endDate
        })
      } else {
        setError(result.error || 'Failed to generate time slots')
        console.error('Generate slots error:', result.error);
      }
      
    } catch (error) {
      console.error('Error generating time slots:', error)
      setError('Failed to generate time slots')
    } finally {
      setGeneratingSlots(false)
    }
  }

  const handleDeleteSlots = async (startDate, endDate) => {
    if (!confirm('Are you sure you want to delete all available time slots for this date range?')) {
      return
    }
    
    try {
      setError('')
      setSuccess('')
      
      const result = await timeslotService.deleteSlots(courtId, startDate, endDate)
      
      if (result.success) {
        setSuccess(`Deleted ${result.data.deletedSlots || 0} time slots successfully!`)
        // Refresh the time slots view
        setViewRange({ ...viewRange })
      } else {
        setError(result.error || 'Failed to delete time slots')
      }
      
    } catch (error) {
      console.error('Error deleting time slots:', error)
      setError('Failed to delete time slots')
    }
  }

  const toggleSlotAvailability = async (slotId, currentAvailability) => {
    try {
      const result = await timeslotService.updateSlotAvailability(slotId, !currentAvailability)
      
      if (result.success) {
        // Update local state
        setTimeSlots(prev => prev.map(slot => 
          slot._id === slotId 
            ? { ...slot, isAvailable: !currentAvailability }
            : slot
        ))
      } else {
        setError(result.error || 'Failed to update slot availability')
      }
    } catch (error) {
      console.error('Error updating slot availability:', error)
      setError('Failed to update slot availability')
    }
  }

  // Group slots by date
  const groupedSlots = timeSlots.reduce((groups, slot) => {
    // Handle both Date objects and ISO strings
    const date = slot.date instanceof Date 
      ? slot.date.toISOString().split('T')[0]
      : (typeof slot.date === 'string' ? slot.date.split('T')[0] : slot.date);
    
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(slot)
    return groups
  }, {})

  console.log('Grouped slots:', groupedSlots);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="px-4 py-8 mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading court details...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error && !court) {
    return (
      <DashboardLayout>
        <div className="px-4 py-8 mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Court</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/owner/courts')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Courts
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-8 mx-auto max-w-6xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/owner/courts')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to My Courts</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Time Slots</h1>
              <p className="text-gray-600">{court?.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Court Price</p>
            <p className="text-lg font-semibold text-green-600">₹{court?.pricePerHour}/hour</p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700 mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center text-green-700 mb-6">
            <Check className="h-4 w-4 mr-2" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generate Slots Form */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Generate Time Slots
            </h2>
            
            <form onSubmit={handleGenerateSlots} className="space-y-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={generateForm.startDate}
                  onChange={handleGenerateFormChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={generateForm.endDate}
                  onChange={handleGenerateFormChange}
                  min={generateForm.startDate}
                  required
                />
              </div>

              <div>
                <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
                <Select 
                  value={generateForm.slotDuration.toString()} 
                  onValueChange={(value) => setGenerateForm(prev => ({ ...prev, slotDuration: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={generatingSlots}
              >
                {generatingSlots ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Slots
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Operating Hours</h3>
              <p className="text-sm text-blue-700">
                {court?.operatingHours?.start || '06:00'} - {court?.operatingHours?.end || '22:00'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Slots will be generated within these hours only
              </p>
            </div>
          </Card>

          {/* View Time Slots */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Time Slots
                </h2>
                <div className="flex items-center space-x-2">
                  <Input
                    type="date"
                    value={viewRange.startDate}
                    onChange={handleViewRangeChange}
                    name="startDate"
                    className="w-36"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="date"
                    value={viewRange.endDate}
                    onChange={handleViewRangeChange}
                    name="endDate"
                    className="w-36"
                  />
                </div>
              </div>

              {slotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading time slots...</span>
                </div>
              ) : Object.keys(groupedSlots).length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No time slots found for this date range</p>
                  <p className="text-sm text-gray-500">Generate some slots to get started!</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {Object.entries(groupedSlots).map(([date, slots]) => (
                    <div key={date} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          {new Date(date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSlots(date, date)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete All
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {slots.map((slot) => (
                          <div
                            key={slot._id}
                            className={`p-2 border rounded text-sm ${
                              slot.isBooked
                                ? 'bg-red-50 border-red-200 text-red-700'
                                : slot.isAvailable
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-gray-50 border-gray-200 text-gray-500'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">
                                  {slot.startTime} - {slot.endTime}
                                </div>
                                <div className="text-xs">₹{slot.price}</div>
                              </div>
                              {!slot.isBooked && (
                                <button
                                  onClick={() => toggleSlotAvailability(slot._id, slot.isAvailable)}
                                  className="ml-1"
                                  title={slot.isAvailable ? 'Disable slot' : 'Enable slot'}
                                >
                                  {slot.isAvailable ? (
                                    <X className="h-3 w-3 text-red-500" />
                                  ) : (
                                    <Check className="h-3 w-3 text-green-500" />
                                  )}
                                </button>
                              )}
                            </div>
                            <div className="mt-1">
                              <Badge 
                                variant={slot.isBooked ? "destructive" : slot.isAvailable ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {slot.isBooked ? 'Booked' : slot.isAvailable ? 'Available' : 'Disabled'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}