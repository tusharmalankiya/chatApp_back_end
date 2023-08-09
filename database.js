const mongoose = require("mongoose");
require("dotenv").config();

const server = require("./server").httpServer;

console.log("database");

//database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then((result) => {
    server.listen(process.env.PORT, "0.0.0.0", () => {
      console.log(
        `connected to database and listening on port ${process.env.PORT}`
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
