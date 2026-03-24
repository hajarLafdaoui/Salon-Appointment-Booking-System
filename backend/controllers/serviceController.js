const Service = require('../models/Service');

// @desc    Create service (admin only)
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res) => {
  try {
    const { name, description, category, duration, price, isPopular } = req.body;
    
    // Handle local image upload
    let image = '';
    if (req.file) {
      image = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const service = await Service.create({
      name,
      description,
      category,
      duration: Number(duration), // Use explicit cast since FormData sends strings
      price: Number(price),
      image,
      isPopular: isPopular === 'true' // Handle boolean from FormData
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getAllServices = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {}; // Show all for now
    if (category && category !== 'All') {
      filter.category = category;
    }
    const services = await Service.find(filter).populate('staff', 'specialty user').populate({
      path: 'staff',
      populate: { path: 'user', select: 'name' },
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('staff');
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update service (admin only)
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    service.name = req.body.name || service.name;
    service.description = req.body.description || service.description;
    service.category = req.body.category || service.category;
    service.duration = req.body.duration !== undefined ? Number(req.body.duration) : service.duration;
    service.price = req.body.price !== undefined ? Number(req.body.price) : service.price;
    service.isActive = req.body.isActive !== undefined ? req.body.isActive === 'true' : service.isActive;
    service.isPopular = req.body.isPopular !== undefined ? req.body.isPopular === 'true' : service.isPopular;

    if (req.file) {
      service.image = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const updated = await service.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete service (admin only)
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (service) {
      res.json({ message: 'Service removed' });
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};