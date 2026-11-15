const { setupDatabase } = require('./scripts/setupDb');
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const roomRoutes = require('./routes/roomRoutes');
app.use('/api/v1/rooms', roomRoutes);

const roomTypeRoutes = require('./routes/roomTypeRoutes');
app.use('/api/v1/room-types', roomTypeRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/v1/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/v1/users', userRoutes);

const serviceRoutes = require('./routes/serviceRoutes');
app.use('/api/v1/services', serviceRoutes);

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/v1/bookings', bookingRoutes);

const serviceUsageRoutes = require('./routes/serviceUsageRoutes');
app.use('/api/v1/service-usages', serviceUsageRoutes);

const invoiceRoutes = require('./routes/invoiceRoutes');
app.use('/api/v1/invoices', invoiceRoutes);

app.use('/api/v1/reports', require('./routes/reportRoutes'));
app.use('/api/v1/dashboard', require('./routes/dashboardRoutes'));

app.use('/api/v1/settings', require('./routes/settingRoutes'));

app.use('/api/v1/chatbot', require('./routes/chatbotRoutes'));



setupDatabase()
    .then(() => {
        app.listen(port, () => {
            console.log(`Backend Server đang chạy tại http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('Không thể chuẩn bị database:', err.message);
        process.exit(1);
    });