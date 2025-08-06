const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const admin = require("./firebase"); // Firebase Admin

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Generate a random password
function generateRandomPassword(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#&!";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Setup Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
});
// console.log('Email:', process.env.SENDER_EMAIL);
// console.log('Password:', process.env.SENDER_PASSWORD ? 'Loaded' : 'Missing');


// API: Forgot Password
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Step 1: Get user from Firebase by email
    const userRecord = await admin.auth().getUserByEmail(email);

    // Step 2: Generate and update new password
    const newPassword = generateRandomPassword();

    await admin.auth().updateUser(userRecord.uid, {
      password: newPassword,
    });

    // Step 3: Send email with new password
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Your New Password - Guardian Angel",
      text: `Hello ${userRecord.displayName || "User"},\n\nYour new temporary password is: ${newPassword}\n\nPlease log in and change your password immediately.\n\nStay safe,\nGuardian Angel Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "New password sent to your email." });
  } catch (err) {
    console.error("Error:", err.message);
    if (err.code === "auth/user-not-found") {
      return res.status(404).json({ message: "Email not found in Firebase." });
    }
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
