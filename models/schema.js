const mongoose = require("mongoose");
// MongoDB connection
require("dotenv").config();
let userModel;
let caseModel;

mongoose
  .connect(process.env.dbURL)
  .then(() => {
    console.log("DB is connected Successfuly");
    //User Schema
    const UsersDB = mongoose.connection.useDb("Users");

    const userSchema = new mongoose.Schema({
      username: String,
      email: String,
      password: String,
      confirmPassword: String,
      nationalID: Number,
      lawyerID: Number,
      personalPhoto: String,
      idPhoto: String,
    });

    userModel = UsersDB.model("register", userSchema);

    //Case Filling
    const casefileDB = mongoose.connection.useDb("Case_filling");
    const caseSchema = new mongoose.Schema({
      court_name: String,
      case_ID: String,
      case_Type: String,
      concerned_Authority: String,
      documents: String,
      plaintiff_Name: String,
      national_ID: Number,
      Email: String,
      date: {
        type: Date,
        default: Date.now,
      },
      Incident_Location: String,
      case_description: String,
      Status: {
        type: String,
        // enum: ["Pending", "In Progress", "Completed"],
        default: "Pending",
      },
    });
    caseModel = casefileDB.model("case_infos", caseSchema);
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = {
  getUserModel: () => userModel,
  getCaseModel: () => caseModel,
};
