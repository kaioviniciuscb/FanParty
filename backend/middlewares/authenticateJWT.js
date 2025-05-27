const jwt = require("jsonwebtoken");

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: "Forbidden: Invalid Token" });

            if (decoded.type === "common_user") { // token for common users
                req.user = {
                    id: decoded.id,
                    type: "common_user"
                };
            } else if (decoded.type === "company") { // token for companies
                req.user = {
                    id: decoded.id,
                    type: "company"
                };
            } else {
                return res.status(400).json({ message: "Unknown user type" });
            }            

            next();
        });
    } else {
        res.status(401).json({ message: "Unauthorized: Token required" });
    }
}

module.exports = authenticateJWT;
