import express from "express";
import {
    uploadRiskData,
    getUserHistory,
    getAllRiskData,
    updateRiskStatus,
    getRiskDataFile,
} from "../controllers/riskData.controller.js";
import { protectRoute, authorizeUser, authorizeAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Routes
router.post('/upload', protectRoute, authorizeUser, uploadRiskData);
router.get('/history', protectRoute, authorizeUser, getUserHistory);
router.get('/all', protectRoute, authorizeAdmin, getAllRiskData);
router.patch('/status/:id', protectRoute, authorizeAdmin, updateRiskStatus);
router.get('/download/:riskDataId', protectRoute, getRiskDataFile);

export default router;
