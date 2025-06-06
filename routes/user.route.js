const express = require("express");
const routes = express.Router(); 
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage: storage });
const {
  register,
  login,
  case_filling,
  decryptCase,
} = require("../controllers/user.controller");

routes.post("/Login", login);

routes.post(
  "/Signup",
  upload.fields([{ name: "personalPhoto" }, { name: "idPhoto" }]),
  register
);

routes.post("/NewCaseForm", upload.single("documents"), case_filling);
routes.get("/NewCaseForm/:id", decryptCase);

module.exports = routes;
