const Service = require('../models/Service');

// @desc    Create service (admin only)
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res) => {
  try {
    const { name, description, duration, price, image, staff } = req.body;
    const service = await Service.create({
      name,
      description,
      duration,
      price,
      image,
      staff, // array of staff IDs
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
    const services = await Service.find({ isActive: true }).populate('staff', 'specialty user').populate({
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
    service.duration = req.body.duration || service.duration;
    service.price = req.body.price || service.price;
    service.image = req.body.image || service.image;
    service.isActive = req.body.isActive !== undefined ? req.body.isActive : service.isActive;
    service.staff = req.body.staff || service.staff;

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
    const service = await Service.findById(req.params.id);
    if (service) {
      await service.remove();
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