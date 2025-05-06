const jwt = require("jsonwebtoken");

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: "Forbidden: Invalid Token" });

            if (decoded.userType === "common") { // token for common users
                req.commonUserId = decoded.commonUserId;
            } else if (decoded.userType === "company") { // token for companies
                req.companyId = decoded.companyId;
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
