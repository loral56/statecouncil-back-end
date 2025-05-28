const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { decrypt } = require("../utils/encrypt.util");
const { getUserModel, getCaseModel } = require("../models/schema");

// for login
const login = async (req, res) => {
  const { email, password } = req.body;
  const userModel = getUserModel();
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      res.json({ success: true, message: "Login successful", user });
    } else {
      res.json({ success: false, message: "Incorrect password" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Internal error" });
  }
};
// for register
const register = async (req, res) => {
  const userModel = getUserModel();
  try {
    const {
      password,
      confirmPassword,
      email,
      nationalID,
      lawyerID,
      username,
      ...rest
    } = req.body;
    // Check if password and confirm password matchx
    const userEmail = await userModel.findOne({ email });
    const userNaID = await userModel.findOne({ nationalID });
    const userLawID = await userModel.findOne({ lawyerID });
    const userName = await userModel.findOne({ username });
    if (userName) {
      return res.status(400).json({
        success: false,
        message: "Username already exist",
      });
    }

    if (userNaID) {
      return res.status(400).json({
        success: false,
        message: "National ID already exist You can't use it Twice!",
      });
    }
    if (userLawID) {
      return res.status(400).json({
        success: false,
        message: "Lawyer ID already exist YOU CAN'T USE IT TWICE!",
      });
    }
    if (userEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exist" });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Password should match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds
    const user = await userModel.create({
      ...rest,
      email,
      nationalID,
      lawyerID,
      username,
      password: hashedPassword,
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// for case filling
const case_filling = async (req, res) => {
  const caseModel = getCaseModel();
  try {
    // Get the file path from multer
    const file = req.file;

    const caseData = {
      ...req.body,
      documents: file ? file.path : null, // store just the file path
    };

    const newCase = await caseModel.create(caseData);
    const newCaseObject = newCase.toObject();
    const hashedCase = crypto
      .createHash("sha256")
      .update(JSON.stringify(newCaseObject))
      .digest("hex");

    res.status(200).json({ success: true, case: newCase });
  } catch (err) {
    console.error("Case filling error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
const decryptCase = async (req, res) => {
  const caseModel = getCaseModel();
  try {
    const { caseId } = req.params.case_ID;
    const caseFound = await caseModel.findById({case_ID: caseId});
    if (caseFound.plaintiff_Name) {
      const decryptedName = decrypt(caseFound.plaintiff_Name);
      caseFound.plaintiff_Name = decryptedName;
    }
    res.status(200).json({
      plaintiff_Name: caseFound.plaintiff_Name,
    });
  } catch (err) {
    console.error("Decryption error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// for getting all cases
module.exports = {
  register,
  login,
  case_filling,
  decryptCase,
};
