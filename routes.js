
const app = require("./app");

//imports
const commonRoutes = require("./routes/commonRoutes");
// const authRoutes = require("./routes/authRoutes");
//routes
app.use("/api/v1", commonRoutes);
// app.use("/api/v1/auth", authRoutes);
