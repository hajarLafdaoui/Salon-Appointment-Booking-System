const dotenv = require('dotenv');
const connectDB = require('./config/db');
const seedServices = require('./utils/seedServices');

dotenv.config();

const runSeed = async () => {
    try {
        await connectDB();
        console.log('Database connected');

        await seedServices();
        console.log('Seeding completed successfully');

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

runSeed();
