import multer from 'multer';
import RiskData from '../models/riskData.model.js';
import pdfParse from 'pdf-parse';
import axios from "axios";

const storage = multer.memoryStorage();  // Use memory storage for PDF file
const upload = multer({ storage: storage }).single('file');

// Helper Function: Extract Text from PDF
async function extractTextFromPDF(fileBuffer) {
    try {
        const parsedPDF = await pdfParse(fileBuffer); // Use buffer directly
        return parsedPDF.text;  // Extract text from PDF
    } catch (error) {
        throw new Error("Error parsing PDF");
    }
}

// Function to extract features from OCR text
function extractFeaturesFromText(ocrText) {
    const regex = /Pregnancies:\s*(\d+)\s*Glucose:\s*(\d+)\s*BloodPressure:\s*(\d+)\s*SkinThickness:\s*(\d+)\s*Insulin:\s*(\d+)\s*BMI:\s*([\d.]+)\s*DiabetesPedigreeFunction:\s*([\d.]+)\s*Age:\s*(\d+)/i;
    const match = ocrText.match(regex);

    if (match) {
        return [
            parseInt(match[1]), // Pregnancies
            parseInt(match[2]), // Glucose
            parseInt(match[3]), // BloodPressure
            parseInt(match[4]), // SkinThickness
            parseInt(match[5]), // Insulin
            parseFloat(match[6]), // BMI
            parseFloat(match[7]), // DiabetesPedigreeFunction
            parseInt(match[8]), // Age
        ];
    }

    return null; // Return null if extraction fails
}

//1. Upload Risk Data

export const uploadRiskData = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).json({ error: "File upload failed" });

        try {
            const userId = req.user._id;
            const fileBuffer = req.file.buffer;
            const ocrRawText = await extractTextFromPDF(fileBuffer);

            // Extract features from OCR text
            const features = extractFeaturesFromText(ocrRawText);
            if (!features) {
                return res.status(400).json({ error: "Unable to extract required data from the file" });
            }

            // Send API call to diabetes prediction service
            const predictionResponse = await axios.post(
                "https://diabetes-prediction-y9ho.onrender.com/predict",
                { features }
            );

            const diabetesRisk = predictionResponse.data.prediction;

            // Save the PDF file, extracted data, and prediction to DB
            const riskData = new RiskData({
                userId,
                fileName: req.file.originalname,
                file: fileBuffer,
                ocrRawText,
                extractedData: {
                    Pregnancies: features[0],
                    Glucose: features[1],
                    BloodPressure: features[2],
                    SkinThickness: features[3],
                    Insulin: features[4],
                    BMI: features[5],
                    DiabetesPedigreeFunction: features[6],
                    Age: features[7],
                },
                diabetesRisk, // Store prediction result
            });

            await riskData.save();

            res.status(201).json({
                message: "File uploaded, text extracted, and prediction made successfully",
                riskData,
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
};

// 2. Get User History
export const getUserHistory = async (req, res) => {
    try {
        const userId = req.user._id; // User ID from JWT
        const userHistory = await RiskData.find({ userId }).sort({ createdAt: -1 });

        if (!userHistory) {
            return res.status(404).json({ error: "No history found" });
        }

        res.status(200).json({
            message: "User history retrieved successfully",
            userHistory
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Get All Risk Data for Admin
export const getAllRiskData = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
        if (!isAdmin) return res.status(403).json({ error: 'Access denied' });

        const allRiskData = await RiskData.find()
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 });

        res.status(200).json(allRiskData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Update Risk Status (Admin Only)
export const updateRiskStatus = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';
        if (!isAdmin) return res.status(403).json({ error: 'Access denied' });

        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        // Validate status
        const validStatuses = ['Pending', 'Cleared', 'Referred'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updatedRiskData = await RiskData.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedRiskData) return res.status(404).json({ error: 'Record not found' });

        res.status(200).json(updatedRiskData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getRiskDataFile = async (req, res) => {
    try {
        const { riskDataId } = req.params;

        const riskData = await RiskData.findById(riskDataId);
        if (!riskData) {
            console.log("Risk data not found for ID:", riskDataId);
            return res.status(404).json({ error: 'Risk data not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${riskData.fileName}"`);
        res.send(riskData.file); // Send the PDF as binary data
    } catch (err) {
        console.error("Error fetching PDF:", err);
        res.status(500).json({ error: 'Error fetching PDF' });
    }
};
