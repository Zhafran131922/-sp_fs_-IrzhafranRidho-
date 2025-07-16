// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/users");
const projectRoutes = require("./routes/project");
const notificationRoutes = require("./routes/notifications");
const acceptedRoutes = require("./routes/accepted");

app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/accepted", acceptedRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
