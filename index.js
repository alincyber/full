const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 5000;
const User = require("./model/userdata");
const dns = require("dns");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const SECRET_KEY = "the_secret_key_1234";

dns.setServers(['8.8.8.8','8.8.4.4']);

app.use(express.json());
app.use(cors());   // ✅ FIXED

mongoose.connect("mongodb+srv://ajayrajputwuy_db_user:12345ajay@cluster0.5ghry7t.mongodb.net/fullName?retryWrites=true&w=majority")
.then((result) => {
    console.log("the database waz work")
}).catch((err) => {
    console.log("the database was not responding")
});


app.post("/make", async (req, res) => {
    try {
        const { name, phone, email, company } = req.body;

        if (!name || !phone || !email || !company) {
            return res.status(400).json({
                message: "please enter all the feilds",
            });
        }

        const exist = await User.findOne({ name: name });
        if (exist) {
            return res.status(409).json({
                message: "the user is already exist in database",
                data: exist,
            });
        }

        const token = jwt.sign({
            name,
            phone,
            email,
            company
        }, SECRET_KEY);

        // ✅ FIXED (save full data)
        const newUser = new User({
            name,
            phone,
            email,
            company,
            token
        });

        await newUser.save();

        return res.status(201).json({
            message: "new user is created",
            data: newUser,   // ✅ FIXED
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
        });
    }
});


app.put("/upgrade", async (req, res) => {
  try {
    const { name, ...update } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "the name is require",
      });
    }

    const updateuser = await User.findOneAndUpdate(
      { name: name },
      update,
      { new: true }
    );

    if (!updateuser) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    return res.status(200).json({
      message: "user updated successfully",
      data: updateuser,
    });

  } catch (error) {
    return res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
});


app.delete("/remove", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "name is required",
      });
    }

    const deletuser = await User.findOneAndDelete({ name: name });

    if (!deletuser) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    return res.status(200).json({
      message: "user deleted successfully",
      data: deletuser,
    });

  } catch (error) {
    return res.status(500).json({
      message: "server internal error",
      error: error.message,
    });
  }
});


app.get("/read", (req, res) => {
    return res.json("mera server live ho chuka h or mene ye post-man pe kr liye h")
});


app.listen(PORT, () => {
    console.log(`the server is running on the http://localhost:${PORT}`)
});