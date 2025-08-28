import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.id) {
            // ✅ safer: attach to req, not req.body
            req.userId = decoded.id;
        } else {
            return res.status(401).json({ success: false, message: "Token is not valid, Login Again" });
        }

        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ success: false, message: "Token is not valid" });
    }
};

export default userAuth;
