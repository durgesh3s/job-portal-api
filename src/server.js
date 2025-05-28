const app = require('./app');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

// Load environment
dotenv.config();

// Connect to DB
connectDB();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
});
