const Service = require('../models/Service');

const sampleServices = [
    // Hair Services
    {
        name: 'Haircut',
        description: 'Professional haircut and styling tailored to your look.',
        category: 'Hair',
        duration: 30,
        price: 25,
        image: 'https://via.placeholder.com/300x200?text=Haircut'
    },
    {
        name: 'Hair Styling',
        description: 'Expert styling for any occasion.',
        category: 'Hair',
        duration: 45,
        price: 35,
        image: 'https://via.placeholder.com/300x200?text=Hair+Styling'
    },
    {
        name: 'Hair Coloring',
        description: 'Professional hair coloring with premium products.',
        category: 'Hair',
        duration: 90,
        price: 60,
        image: 'https://via.placeholder.com/300x200?text=Hair+Coloring'
    },
    {
        name: 'Blow Dry',
        description: 'Smooth and shiny blow dry styling.',
        category: 'Hair',
        duration: 30,
        price: 20,
        image: 'https://via.placeholder.com/300x200?text=Blow+Dry'
    },

    // Skincare Services
    {
        name: 'Classic Facial',
        description: 'Deep cleansing facial treatment for all skin types.',
        category: 'Skincare',
        duration: 60,
        price: 50,
        image: 'https://via.placeholder.com/300x200?text=Classic+Facial'
    },
    {
        name: 'Deep Cleansing Facial',
        description: 'Intensive facial treatment to remove impurities.',
        category: 'Skincare',
        duration: 75,
        price: 65,
        image: 'https://via.placeholder.com/300x200?text=Deep+Facial'
    },
    {
        name: 'Anti-Aging Treatment',
        description: 'Advanced treatment to reduce fine lines and wrinkles.',
        category: 'Skincare',
        duration: 60,
        price: 75,
        image: 'https://via.placeholder.com/300x200?text=Anti-Aging'
    },

    // Nails Services
    {
        name: 'Manicure',
        description: 'Classic manicure with premium nail polish.',
        category: 'Nails',
        duration: 30,
        price: 20,
        image: 'https://via.placeholder.com/300x200?text=Manicure'
    },
    {
        name: 'Pedicure',
        description: 'Relaxing pedicure with foot massage.',
        category: 'Nails',
        duration: 45,
        price: 30,
        image: 'https://via.placeholder.com/300x200?text=Pedicure'
    },
    {
        name: 'Gel Nails',
        description: 'Long-lasting gel nail application.',
        category: 'Nails',
        duration: 45,
        price: 40,
        image: 'https://via.placeholder.com/300x200?text=Gel+Nails'
    },

    // Makeup Services
    {
        name: 'Natural Makeup',
        description: 'Subtle and natural makeup application.',
        category: 'Makeup',
        duration: 30,
        price: 35,
        image: 'https://via.placeholder.com/300x200?text=Natural+Makeup'
    },
    {
        name: 'Evening Makeup',
        description: 'Glamorous makeup for evening events.',
        category: 'Makeup',
        duration: 45,
        price: 50,
        image: 'https://via.placeholder.com/300x200?text=Evening+Makeup'
    },
    {
        name: 'Bridal Makeup',
        description: 'Perfect makeup for your special day.',
        category: 'Makeup',
        duration: 60,
        price: 75,
        image: 'https://via.placeholder.com/300x200?text=Bridal+Makeup'
    },

    // Brows & Lashes Services
    {
        name: 'Eyebrow Shaping',
        description: 'Professional eyebrow shaping and tinting.',
        category: 'Brows & Lashes',
        duration: 20,
        price: 15,
        image: 'https://via.placeholder.com/300x200?text=Eyebrow+Shaping'
    },
    {
        name: 'Eyelash Extensions',
        description: 'Elegant eyelash extensions for fuller lashes.',
        category: 'Brows & Lashes',
        duration: 90,
        price: 80,
        image: 'https://via.placeholder.com/300x200?text=Lash+Extensions'
    },

    // Spa & Massage Services
    {
        name: 'Swedish Massage',
        description: 'Relaxing full-body Swedish massage.',
        category: 'Spa & Massage',
        duration: 60,
        price: 60,
        image: 'https://via.placeholder.com/300x200?text=Swedish+Massage'
    },
    {
        name: 'Deep Tissue Massage',
        description: 'Therapeutic deep tissue massage for muscle relief.',
        category: 'Spa & Massage',
        duration: 60,
        price: 70,
        image: 'https://via.placeholder.com/300x200?text=Deep+Tissue'
    },
    {
        name: 'Spa Package',
        description: 'Complete spa experience with massage and facial.',
        category: 'Spa & Massage',
        duration: 120,
        price: 120,
        image: 'https://via.placeholder.com/300x200?text=Spa+Package'
    }
];

const seedServices = async () => {
    try {
        // Clear existing services
        await Service.deleteMany({});

        // Insert sample services
        const createdServices = await Service.insertMany(sampleServices);
        console.log(`${createdServices.length} services seeded successfully`);
        return createdServices;
    } catch (error) {
        console.error('Error seeding services:', error);
        throw error;
    }
};

module.exports = seedServices;
