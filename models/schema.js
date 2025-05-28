const mongoose = require("mongoose");
const { encrypt } = require("../utils/encrypt.util");
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

    caseSchema.pre("save", async function (next) {
      const doc = this;
      if (doc.isNew) {
        const counter = await Counter.findByIdAndUpdate(
          { _id: "case_ID" },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        doc.case_ID = counter.seq.toString().padStart(6, "0");
      }
      if (this.isModified("plaintiff_Name") && this.plaintiff_Name) {
        const encrypted = await encrypt(String(this.plaintiff_Name));
        console.log("PLAIN VALUE:", this.plaintiff_Name);
        this.plaintiff_Name = JSON.stringify(encrypted); // Save as string
      }

      if (this.isModified("national_ID") && this.national_ID) {
        const encrypted = await encrypt(String(this.national_ID));
        this.national_ID = JSON.stringify(encrypted);
      }

      if (this.isModified("Email") && this.Email) {
        const encrypted = await encrypt(String(this.Email));
        this.Email = JSON.stringify(encrypted);
      }

      if (this.isModified("concerned_Authority") && this.concerned_Authority) {
        const encrypted = await encrypt(String(this.concerned_Authority));
        this.concerned_Authority = JSON.stringify(encrypted);
      }

      if (this.isModified("documents") && this.documents !== null) {
        const encrypted = await encrypt(String(this.documents));
        this.documents = JSON.stringify(encrypted);
      }

      if (this.isModified("court_name") && this.court_name) {
        const encrypted = await encrypt(String(this.court_name));
        this.court_name = JSON.stringify(encrypted);
      }

      if (this.isModified("Incident_Location") && this.Incident_Location) {
        const encrypted = await encrypt(String(this.Incident_Location));
        this.Incident_Location = JSON.stringify(encrypted);
      }

      if (this.isModified("case_description") && this.case_description) {
        const encrypted = await encrypt(String(this.case_description));
        this.case_description = JSON.stringify(encrypted);
      }

      next();
    });
    const counterSchema = new mongoose.Schema({
      _id: { type: String, required: true },
      seq: { type: Number, default: 0 },
    });
    const Counter = mongoose.model("Counter", counterSchema);

    caseModel = casefileDB.model("case_infos", caseSchema);
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = {
  getUserModel: () => userModel,
  getCaseModel: () => caseModel,
};
