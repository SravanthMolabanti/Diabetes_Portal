import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import riskDataRoutes from "./routes/riskData.route.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import cors from "cors";
import bcrypt from "bcryptjs";
import User from "./models/user.model.js";

import path from "path";

dotenv.config()
const app = express();

const PORT = process.env.PORT;
const __dirname=path.resolve();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use("/api/auth", authRoutes);
app.use("/api/riskData", riskDataRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
  }
  
app.listen(PORT, () => {
    console.log("server is running on PORT:" + PORT);
    connectDB()
});

const seedAdmin = async () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminFullName = process.env.ADMIN_NAME;
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const admin = new User({
            fullName: adminFullName,
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
        });
        await admin.save();
        console.log('Admin user seeded successfully!');
    } else {
        console.log('Admin user already exists!');
    }
};

seedAdmin();