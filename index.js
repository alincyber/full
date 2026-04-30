const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5000;
const User = require("./model/userdata");
const dns = require("dns");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const SECRET_KEY = "the_secret_key_1234";
const dotenv = require("dotenv");
dotenv.config();

/* =========================
   DNS
========================= */
dns.setServers(["8.8.8.8", "8.8.4.4"]);

/* =========================
   CREATE uploads FOLDER
========================= */
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/uploads", express.static("uploads"));

/* =========================
   DATABASE
========================= */
mongoose
  .connect(
    "mongodb+srv://ajayrajputwuy_db_user:12345ajay@cluster0.5ghry7t.mongodb.net/fullName?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("the database was work");
  })
  .catch(() => {
    console.log("the database was not responding");
  });

/* =========================
   MULTER STORAGE
========================= */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

/* =========================
   FILE FILTER
========================= */
const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp"
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

/* =========================
   MULTER CONFIG
========================= */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

/* =========================
   CREATE USER + IMAGE
   KEY NAME = image
========================= */
app.post("/make", upload.single("image"), async (req, res) => {
  try {
    const { name, phone, email, company } = req.body;

    const token = jwt.sign(
      { name, email },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    const newUser = new User({
      name,
      phone,
      email,
      company,
      token,
      image: req.file ? req.file.filename : null
    });

    await newUser.save();

    return res.status(201).json({
      message: "new user created",
      token: token,
      data: newUser,
      imageUrl: req.file
        ? `http://localhost:${PORT}/uploads/${req.file.filename}`
        : null
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
});

/* =========================
   UPDATE USER + IMAGE
========================= */
app.put("/upgrade", upload.single("image"), async (req, res) => {
  try {
    const { name, ...update } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "name is required"
      });
    }

    if (req.file) {
      update.image = req.file.filename;
    }

    const updateuser = await User.findOneAndUpdate(
      { name: name },
      update,
      { new: true }
    );

    if (!updateuser) {
      return res.status(404).json({
        message: "user not found"
      });
    }

    return res.status(200).json({
      message: "user updated successfully",
      data: updateuser
    });

  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message
    });
  }
});

/* =========================
   DELETE USER
========================= */
app.delete("/remove", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "name is required"
      });
    }

    const deletuser = await User.findOneAndDelete({ name });

    if (!deletuser) {
      return res.status(404).json({
        message: "user not found"
      });
    }

    return res.status(200).json({
      message: "user deleted successfully",
      data: deletuser
    });

  } catch (error) {
    return res.status(500).json({
      message: "server internal error",
      error: error.message
    });
  }
});

/* =========================
   READ ROUTE
========================= */
app.get("/read", (req, res) => {
  res.json({
    message: "server live ho chuka hai"
  });
});

/* =========================
   NODEMAILER + OTP SYSTEM
========================= */
console.log("EMAIL =", process.env.EMAIL);
console.log("PASS =", process.env.PASS ? "Loaded" : "Missing");

const otpStore = {};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  }
});

transporter.verify((error) => {
  if (error) {
    console.log("Mail Error:", error.message);
  } else {
    console.log("Mail Server Ready");
  }
});

app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email required"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width,initial-scale=1.0">
        <title>OTP Mail</title>
        </head>
        <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f1f5f9;padding:30px 10px;">
        <tr>
        <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,0.08);">
        <tr>
        <td align="center" style="padding:30px;background:linear-gradient(135deg,#16a34a,#22c55e);color:#ffffff;">
        <div style="font-size:42px;line-height:42px;">🔐</div>
        <h1 style="margin:15px 0 5px;font-size:28px;font-weight:bold;">OTP Verification</h1>
        <p style="margin:0;font-size:14px;opacity:0.95;">Secure Login Access</p>
        </td>
        </tr>
        <tr>
        <td style="padding:35px 25px;text-align:center;">
        <h2 style="margin:0 0 12px;color:#111827;font-size:24px;">Hello 👋</h2>
        <p style="margin:0 0 22px;color:#475569;font-size:16px;line-height:1.7;">Use the verification code below to continue securely.</p>
        <div style="display:inline-block;padding:18px 28px;background:#f0fdf4;border:2px dashed #22c55e;border-radius:14px;font-size:34px;font-weight:bold;letter-spacing:8px;color:#15803d;margin-bottom:18px;">
        ${otp}
        </div>
        <p style="margin:10px 0 0;color:#eab308;font-size:15px;font-weight:bold;">⏰ Valid for 5 Minutes</p>
        <div style="margin-top:28px;">
        <a href="#" style="display:inline-block;padding:14px 28px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:10px;font-size:16px;font-weight:bold;">Verify Now</a>
        </div>
        <p style="margin:28px 0 0;color:#64748b;font-size:13px;line-height:1.6;">Never share this OTP with anyone.<br>If you did not request this code, ignore this email.</p>
        </td>
        </tr>
        <tr>
        <td align="center" style="padding:18px;background:#f8fafc;color:#94a3b8;font-size:13px;">
        © 2026 Ajay Security System
        </td>
        </tr>
        </table>
        </td>
        </tr>
        </table>
        </body>
        </html>
      `
    });

    return res.status(200).json({
      message: "OTP sent successfully",
      otp: otp
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "Email and OTP required"
    });
  }

  const userOTP = otpStore[email];

  if (!userOTP) {
    return res.status(400).json({
      message: "No OTP found"
    });
  }

  if (Date.now() > userOTP.expires) {
    delete otpStore[email];
    return res.status(410).json({
      message: "OTP expired. Please request a new one"
    });
  }

  if (userOTP.otp === otp) {
    delete otpStore[email];
    return res.status(200).json({
      message: "OTP Verified Successfully"
    });
  }

  return res.status(400).json({
    message: "Invalid OTP"
  });
});

/* =========================
   ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: err.message
    });
  }

  return res.status(500).json({
    message: err.message || "Server Error"
  });
});

/* =========================
   SERVER
========================= */
app.listen(PORT, () => {
  console.log(`the server is running on http://localhost:${PORT}`);
});