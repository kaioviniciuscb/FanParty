const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const userRoutes = require("./backend/routes/userRoutes"); // ✅ Apenas uma vez

const app = express();
dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve the pages
app.use(express.static(path.join(__dirname, "frontend", "views")));

app.get("/", (req, res)  => {
    res.sendFile(path.join(__dirname, "frontend", "views", "login.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "views", "register.html"));
});

// API's routes
app.use("/api/users", userRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});