require("dotenv").config();

module.exports = {
    PORT : process.env.PORT || 5000,
    ALLOWLIST:[
        "http://localhost:5000",
        "http://localhost:3000",
        "http://localhost:4000",
    ],
};