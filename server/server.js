const express = require('express');
const connectDB = require('./config/db');
const { loginRouter } = require("./routes/exportRoutes");

const app = express();

app.use(express.json());

connectDB();

app.use("/api/auth", loginRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server is running on http://localhost:${PORT}');
}); 