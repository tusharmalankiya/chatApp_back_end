const express = require("express");
// const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");

//imports of files
//-------------------------------------------------------

//for environment variables-------------
require("dotenv").config();

app = express();

console.log("app");
//***************************middlewares******************* */

//CORS middleware
app.use(
  cors({
    origin: `http://${process.env.LOCAL_IP}:3000`,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// express middleware handling the body parsing
app.use(express.json());

app.use("/assets", express.static("public"));
app.use(cookieParser());

//module.exports is used to export as a single entire object. it is like its a default value when imported in another file
module.exports = app;

//routes
require("./routes");
//******************************* */

// create static assets from react code for production only
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

// database connection
require("./database");
