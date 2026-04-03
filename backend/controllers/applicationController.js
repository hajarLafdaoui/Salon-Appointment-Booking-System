const Application = require('../models/Application');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/sendEmail');

// @desc    Submit a new staff application
// @route   POST /api/applications
// @access  Public
const submitApplication = async (req, res) => {
    try {
        const { name, email, phone, specialty, experienceYears, bio, portfolioLink } = req.body;

        // Check if user already submitted a pending application
        const existingApp = await Application.findOne({ email, status: 'pending' });
        if (existingApp) {
            return res.status(400).json({ message: 'You already have a pending application. Please wait for our review.' });
        }

        // Create the application
        const application = await Application.create({
            name, email, phone, specialty, experienceYears, bio, portfolioLink
        });

        // Notify Admins
        await Notification.create({
            recipientRole: 'admin',
            type: 'system',
            message: `New staff application from ${name}`,
        });

        res.status(201).json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private/Admin
const getApplications = async (req, res) => {
    try {
        const applications = await Application.find().sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve or Reject an application
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        if (application.status !== 'pending') {
            return res.status(400).json({ message: 'Application has already been processed' });
        }

        application.status = status;
        await application.save();

        if (status === 'approved') {
            // Check if user already exists
            let user = await User.findOne({ email: application.email });
            
            // If no user exists, create one with role 'staff'
            if (!user) {
                user = await User.create({
                    name: application.name,
                    email: application.email,
                    phone: application.phone,
                    password: 'StaffPassword123!', // Ensure default passwords or flow
                    role: 'staff'
                });
            } else {
                // Elevate role to staff if needed
                user.role = 'staff';
                await user.save();
            }

            // Create Staff record
            const staffExists = await Staff.findOne({ user: user._id });
            if (!staffExists) {
                await Staff.create({
                    user: user._id,
                    specialty: application.specialty,
                    experienceYears: application.experienceYears,
                    bio: application.bio,
                    isActive: true
                });
            }

            // Optional email mapping -> notify applicant
            sendEmail({
                to: application.email,
                subject: 'Application Approved! Welcome to the Team',
                text: `Congratulations ${application.name}! Your application has been approved. Your internal login email is ${application.email} and temporary password is StaffPassword123! Please change it immediately.`
            }).catch(e => console.error("Email send fail: ", e));
            
        } else if (status === 'rejected') {
            sendEmail({
                to: application.email,
                subject: 'Application Status Update',
                text: `Hi ${application.name}, thank you for your interest. Unfortunately, your application was not accepted at this time.`
            }).catch(e => console.error("Email send fail: ", e));
        }

        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitApplication,
    getApplications,
    updateApplicationStatus
};
