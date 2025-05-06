const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const routes = require("./backend/routes");
const cors = require('cors');

const app = express();
dotenv.config();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "frontend")));

// HTML pages
app.get("/", (req, res)  => {
    res.sendFile(path.join(__dirname, "frontend", "views", "login.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "views", "register.html"));
});

// API routes
app.use("/api", routes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
