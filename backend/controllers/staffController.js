const Staff = require('../models/Staff');


// CREATE STAFF (Admin only)
const createStaff = async (req, res) => {
  try {
    const staff = new Staff(req.body);

    const createdStaff = await staff.save();

    res.status(201).json(createdStaff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET ALL STAFF (Public for booking page)
const getAllStaff = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 8;
    const page = Number(req.query.page) || 1;

    const name = req.query.name || '';
    const specialty = req.query.specialty || '';

    const query = { isActive: true };

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (specialty) {
      query.specialty = specialty;
    }

    const count = await Staff.countDocuments(query);
    const staff = await Staff.find(query)
      .populate("services", "name price duration")
      .populate("user", "name email")
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ rating: -1, createdAt: -1 })
      .lean();

    res.json({
      staff,
      page,
      pages: Math.ceil(count / pageSize),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// GET STAFF BY ID
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate("services")
      .populate("user", "name email");

    if (staff) {
      res.json(staff);
    } else {
      res.status(404).json({ message: "Staff not found" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// UPDATE STAFF (Admin or that staff)
const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    staff.name = req.body.name || staff.name;
    staff.image = req.body.image || staff.image;
    staff.specialty = req.body.specialty || staff.specialty;
    staff.bio = req.body.bio || staff.bio;
    staff.experienceYears = req.body.experienceYears || staff.experienceYears;
    staff.rating = req.body.rating || staff.rating;
    staff.services = req.body.services || staff.services;
    staff.workingDays = req.body.workingDays || staff.workingDays;
    staff.workingHours = req.body.workingHours || staff.workingHours;
    staff.isActive = req.body.isActive ?? staff.isActive;

    const updatedStaff = await staff.save();

    res.json(updatedStaff);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// DELETE STAFF (Admin only)
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    await staff.deleteOne();

    res.json({ message: "Staff removed" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff
};