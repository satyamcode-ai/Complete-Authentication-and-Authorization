import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../model/userModel.js';
import transporter from '../config/nodeMailer.js';
import { WELCOME_TEMPLATE, EMAIL_VERIFY_TEMPLATE,PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    
    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Sending welcome email can be added here

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Our Service',
            // text: `Hello ${name},\n\nThank you for registering at our service!\n\nBest regards,\nTeam`
            html: WELCOME_TEMPLATE.replace("{{name}}",`Hi ${name},`)
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({ success: true, message: "Registration successful" });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({success:false, message: error.message });
    }
    }

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({success:false, message: "Email and password are required" });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });



        res.status(200).json({ success: true, message: "Login successful" });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}  

export const logout = (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });

        res.status(200).json({ success: true, message: "Logout successful" });
    } 
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ success: false, message: error.message });
    } 
}

// /Send verification otp to the user's email

export const sendVerifyOtp = async (req, res) => {
  try {
    // ✅ get userId from middleware, not req.body
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Account is already verified" });
    }

    // generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hrs
    await user.save();

    // TODO: send OTP via nodemailer here
    const mailOptions = {
  from: process.env.SENDER_EMAIL,
  to: user.email,   // ✅ use user.email
  subject: 'OTP for verifying your Account',
//   text: `Hello ${user.name},\n\nHere is your OTP: ${otp}\n\nBest regards,\nTeam`,
  html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
};
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.error("sendVerifyOtp error:", error.message);
    res.status(500).json({ success: false, message: "Server error, please try again later" });
  }
};

export const verifyEmail = async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ success: false, message: "OTP is required" });
  }

  try {
    const user = await userModel.findById(req.userId);  // ✅ from JWT
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp !== otp || user.verifyOtp === "") {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiry = 0;
    await user.save();

    return res.status(200).json({ success: true, message: "Account verified successfully" });

  } catch (error) {
    console.error("verifyEmail error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const isAuthenticated = async (req, res) => {
    try {
        if (!req.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const sendResetOtp = async (req,res) => {
    const {email} = req.body
    if(!email){
        return res.json({success:false,message:"Email is required"})
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"User not found"})
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpiredAt = Date.now() + 15 * 60 * 1000; // 24 hours from now
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            // text: `Your OTP for resetting your password is ${otp}\nUse this OTP to proceed with resetting your password.\n\nBest regards,\nTeam`
            html:PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)

        };
        await transporter.sendMail(mailOptions); 
        
        return res.status(200).json({success:true,message:"OTP sent to your email"})

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Reset user password using OTP

export const resetPassword = async (req,res) => {
    const {email,otp,newPassword} = req.body
    if(!email || !otp || !newPassword){
        return res.json({success:false,message:"All fields are required"})
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"User not found"})
        }
        if(user.resetOtp !== otp || user.resetOtp === ""){
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }
        if (user.resetOtpExpiredAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpiredAt = 0;
        await user.save();

        return res.status(200).json({success:true,message:"Password reset successful"})

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}