import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, MapPin, Clock, DollarSign, Camera, AlertCircle } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { useAuth } from '../context/AuthContext'
import { courtService } from '../services/courtService'

export default function AddCourt() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: {
        latitude: null,
        longitude: null
      }
    },
    pricePerHour: '',
    amenities: [],
    operatingHours: {
      monday: { start: '09:00', end: '21:00' },
      tuesday: { start: '09:00', end: '21:00' },
      wednesday: { start: '09:00', end: '21:00' },
      thursday: { start: '09:00', end: '21:00' },
      friday: { start: '09:00', end: '21:00' },
      saturday: { start: '08:00', end: '22:00' },
      sunday: { start: '08:00', end: '22:00' }
    },
    images: []
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const amenityOptions = [
    'parking',
    'restrooms',
    'changing rooms',
    'equipment rental',
    'lighting',
    'air conditioning',
    'refreshments',
    'first aid',
    'security',
    'wifi'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Handle nested location fields
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear errors when user starts typing
    if (error) setError('')
  }

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
    
    // Clear errors when user makes changes
    if (error) setError('')
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    // In a real app, you'd upload these to a server
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files.map(file => URL.createObjectURL(file))]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError('Court name is required')
        setLoading(false)
        return
      }
      
      if (!formData.pricePerHour || formData.pricePerHour <= 0) {
        setError('Valid price per hour is required')
        setLoading(false)
        return
      }
      
      if (!formData.location.address.trim()) {
        setError('Address is required')
        setLoading(false)
        return
      }

      // Prepare data for backend
      const courtData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: {
          address: formData.location.address.trim(),
          city: formData.location.city.trim(),
          state: formData.location.state.trim(),
          zipCode: formData.location.zipCode.trim(),
          coordinates: formData.location.coordinates
        },
        pricePerHour: parseFloat(formData.pricePerHour),
        amenities: formData.amenities,
        operatingHours: formData.operatingHours,
        images: formData.images // In production, these would be uploaded first
      }

      const result = await courtService.createCourt(courtData)
      
      if (result.success) {
        setSuccess('Court created successfully!')
        // Redirect to courts page after a brief success message
        setTimeout(() => {
          navigate('/owner/courts')
        }, 1500)
      } else {
        setError(result.error)
      }
      
    } catch (error) {
      console.error('Error creating court:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="px-4 py-8 mx-auto max-w-4xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/owner')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Court</h1>
            <p className="mt-2 text-gray-600">
              Create a new court listing for players to book
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center text-green-700">
            <div className="h-4 w-4 mr-2 rounded-full bg-green-200 flex items-center justify-center">
              <div className="h-2 w-2 bg-green-600 rounded-full"></div>
            </div>
            <span className="text-sm">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="name">Court Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., Court A, Main Tennis Court"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your court, including any special features..."
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </Card>

          {/* Location & Address */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location Details
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="location.address">Street Address *</Label>
                <Input
                  id="location.address"
                  name="location.address"
                  type="text"
                  placeholder="123 Main Street"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <Label htmlFor="location.city">City *</Label>
                  <Input
                    id="location.city"
                    name="location.city"
                    type="text"
                    placeholder="City"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location.state">State *</Label>
                  <Input
                    id="location.state"
                    name="location.state"
                    type="text"
                    placeholder="State"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location.zipCode">Zip Code</Label>
                  <Input
                    id="location.zipCode"
                    name="location.zipCode"
                    type="text"
                    placeholder="12345"
                    value={formData.location.zipCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing & Capacity */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Pricing
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="pricePerHour">Price per Hour (₹) *</Label>
                <Input
                  id="pricePerHour"
                  name="pricePerHour"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter price in rupees"
                  value={formData.pricePerHour}
                  onChange={handleInputChange}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Set your hourly rate for this court
                </p>
              </div>
            </div>
          </Card>

          {/* Operating Hours */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Operating Hours
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">
                <strong>Default Hours:</strong> Monday-Friday: 9:00 AM - 9:00 PM, Saturday-Sunday: 8:00 AM - 10:00 PM
              </p>
              <p className="text-xs text-blue-600 mt-1">
                You can customize these hours after creating the court.
              </p>
            </div>
          </Card>

          {/* Amenities */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Amenities</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {amenityOptions.map(amenity => (
                <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{amenity.replace(/([a-z])([A-Z])/g, '$1 $2')}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Images */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Court Images
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="images">Upload Images</Label>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Upload up to 10 images. First image will be the cover photo.
                </p>
              </div>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Court image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }))
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/owner')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Court...' : 'Create Court'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}