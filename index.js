const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5000;
const User = require("./model/userdata");
const dns = require("dns");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const SECRET_KEY = "the_secret_key_1234";

// DNS fix
dns.setServers(['8.8.8.8','8.8.4.4']);

// Middleware
app.use(express.json());
app.use(cors());   // ✅ FIXED

// Database connection
mongoose.connect("mongodb+srv://ajayrajputwuy_db_user:12345ajay@cluster0.5ghry7t.mongodb.net/fullName?retryWrites=true&w=majority")
.then(() => {
    console.log("✅ Database connected");
})
.catch((err) => {
    console.log("❌ Database error:", err.message);
});


// ================= CREATE USER =================
app.post("/make", async (req, res) => {
    try {
        const { name, phone, email, company } = req.body;

        if (!name || !phone || !email || !company) {
            return res.status(400).json({
                message: "Please enter all fields",
            });
        }

        const exist = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (exist) {
            return res.status(409).json({
                message: "User already exists",
                data: exist,
            });
        }

        const token = jwt.sign(
            { name, phone, email, company },
            SECRET_KEY,
        );

        const newUser = new User({
            name,
            phone,
            email,
            company,
            token
        });

        await newUser.save();

        return res.status(201).json({
            message: "User created successfully",
            data: newUser,   // ✅ FIXED (was wrong before)
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});


// ================= UPDATE USER =================
app.put("/upgrade", async (req, res) => {
    try {
        const { name, ...update } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Name is required",
            });
        }

        const updatedUser = await User.findOneAndUpdate(
            { name },
            update,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "User updated successfully",
            data: updatedUser,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});


// ================= DELETE USER =================
app.delete("/remove", async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Name is required",
            });
        }

        const deletedUser = await User.findOneAndDelete({ name });

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "User deleted successfully",
            data: deletedUser,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
});


// ================= TEST ROUTE =================
app.get("/read", (req, res) => {
    res.json({
        message: "✅ Server is live and working"
    });
});


// ================= SERVER =================
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});