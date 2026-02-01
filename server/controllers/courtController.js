const Court = require('../models/courts');
const User = require('../models/users');

// Create a new court (Owner only)
const createCourt = async (req, res) => {
  try {
    const {
      name,
      location,
      description,
      amenities,
      pricePerHour,
      images,
      operatingHours
    } = req.body;

    // Validation
    if (!name || !pricePerHour) {
      return res.status(400).json({
        message: 'Court name and price per hour are required'
      });
    }

    // Create new court
    const newCourt = new Court({
      name,
      owner: req.user._id, // From auth middleware
      location,
      description,
      amenities: amenities || [],
      pricePerHour,
      images: images || [],
      operatingHours: operatingHours || {
        monday: { start: "09:00", end: "21:00" },
        tuesday: { start: "09:00", end: "21:00" },
        wednesday: { start: "09:00", end: "21:00" },
        thursday: { start: "09:00", end: "21:00" },
        friday: { start: "09:00", end: "21:00" },
        saturday: { start: "08:00", end: "22:00" },
        sunday: { start: "08:00", end: "22:00" }
      }
    });

    await newCourt.save();

    res.status(201).json({
      message: 'Court created successfully',
      court: newCourt
    });

  } catch (error) {
    console.error('Create court error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all courts (with filters)
const getAllCourts = async (req, res) => {
  try {
    // const {
    //   city,
    //   minPrice,
    //   maxPrice,
    //   amenities,
    //   page = 1,
    //   limit = 10
    // } = req.query;

    // // Build filter object
    // const filter = { isActive: true };

    // if (city) {
    //   filter['location.city'] = new RegExp(city, 'i'); // Case insensitive
    // }

    // if (minPrice || maxPrice) {
    //   filter.pricePerHour = {};
    //   if (minPrice) filter.pricePerHour.$gte = Number(minPrice);
    //   if (maxPrice) filter.pricePerHour.$lte = Number(maxPrice);
    // }

    // if (amenities) {
    //   const amenitiesArray = amenities.split(',');
    //   filter.amenities = { $in: amenitiesArray };
    // }

    // // Calculate pagination
    // const skip = (page - 1) * limit;

    // Find courts with pagination
    const courts = await Court.find()
      .populate('name', 'images[0] pricePerHour location.city')
      .sort({ createdAt: -1 })
      // .skip(skip)
      // .limit(Number(limit));

    //const totalCourts = await Court.countDocuments(filter);

    res.json({
      courts
      // pagination: {
      //   currentPage: Number(page),
      //   totalPages: Math.ceil(totalCourts / limit),
      //   totalCourts,
      //   hasNext: page * limit < totalCourts,
      //   hasPrev: page > 1
      // }
    });

  } catch (error) {
    console.error('Get courts error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get single court by ID
const getCourtById = async (req, res) => {
  try {
    const court = await Court.findById(req.params.id)
      .populate('name', 'owner email phone location description amenities pricePerHour images operatingHours');

    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    res.json({ court });

  } catch (error) {
    console.error('Get court error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get courts owned by current user
const getOwnerCourts = async (req, res) => {
  try {
    const courts = await Court.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ courts });

  } catch (error) {
    console.error('Get owner courts error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update court (Owner only)
const updateCourt = async (req, res) => {
  try {
    const courtId = req.params.id;
    const updates = req.body;

    // Find court and check ownership
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    if (court.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this court' });
    }

    // Update court
    const updatedCourt = await Court.findByIdAndUpdate(
      courtId,
      updates,
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone');

    res.json({
      message: 'Court updated successfully',
      court: updatedCourt
    });

  } catch (error) {
    console.error('Update court error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete court (Owner only)
const deleteCourt = async (req, res) => {
  try {
    const courtId = req.params.id;

    // Find court and check ownership
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    if (court.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this court' });
    }

    // Soft delete - set isActive to false
    await Court.findByIdAndUpdate(courtId, { isActive: false });

    res.json({ message: 'Court deleted successfully' });

  } catch (error) {
    console.error('Delete court error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Toggle court status (activate/deactivate)
const toggleCourtStatus = async (req, res) => {
  try {
    const courtId = req.params.id;

    // Find court and check ownership
    const court = await Court.findById(courtId);
    if (!court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    if (court.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this court' });
    }

    // Toggle status
    court.isActive = !court.isActive;
    await court.save();

    res.json({
      message: `Court ${court.isActive ? 'activated' : 'deactivated'} successfully`,
      court
    });

  } catch (error) {
    console.error('Toggle court status error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createCourt,
  getAllCourts,
  getCourtById,
  getOwnerCourts,
  updateCourt,
  deleteCourt,
  toggleCourtStatus
};
