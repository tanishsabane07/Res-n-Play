const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { loginRouter } = require("./routes/exportRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use("/api/auth", loginRouter);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Res-n-Play API is running!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 