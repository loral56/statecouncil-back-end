const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user.route");
const path = require("path");
const port = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", userRoutes);

app.listen(port, () => {
  console.log("server is working");
});
