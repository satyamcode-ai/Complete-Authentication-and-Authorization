import userModel from "../model/userModel.js";

export const getUserData= async (req, res) => {
    try {
        const userId = req.userId; ;
        const user = await userModel.findById(userId)

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, userData:{
            name: user.name,isAccountVerified: user.isAccountVerified
        } });
    } catch (error) {
        console.error("Get user data error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}