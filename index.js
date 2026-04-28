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

const SECRET_KEY = "the_secret_key_1234";

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