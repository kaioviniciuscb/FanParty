const jwt = require("jsonwebtoken");

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.Status(403).json({ message: "Forbidden: Invalid Token" });

            req.userId = decoded.userId; // adds user data to the request
            next();
        });
    } else {
        res.Status(401).json({ message: "Unauthorized: Token required" });
    }
}

module.exports = authenticateJWT;