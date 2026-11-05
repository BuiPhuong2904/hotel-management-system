const { setupDatabase } = require('./scripts/setupDb');
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
// const roomRoutes = require('./routes/roomRoutes');
// app.use('/api/v1/rooms', roomRoutes);

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