import mongoose from "mongoose";

const RiskDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // References the User model
        required: true,
    },
    fileName: {
        type: String,
        required: true, // Name of the uploaded file
    },
    file: {
        type: Buffer, // Store the PDF as binary data
        required: true,
    },
    extractedData: {
        type: Object, // Parsed data from OCR
        default: {},
    },
    diabetesRisk: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Cleared', 'Referred'], // Admin-managed statuses
        default: 'Pending',
    },
    ocrRawText: {
        type: String, // Full raw text extracted from OCR 
        default: "",
    },
},
    { timestamps: true }
);

const RiskData = mongoose.model("RiskData", RiskDataSchema);

export default RiskData;
