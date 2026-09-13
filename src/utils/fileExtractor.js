import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import { ApiError } from "./ApiError.js";

/**
 * Extract text from an uploaded file (PDF or TXT) or from req.body text.
 * Cleans up temporary disk files after extraction.
 * @param {Object} file - Multer file object (optional)
 * @param {string} rawText - Direct text input from request body (optional)
 * @returns {Promise<string>} Extracted plain text
 */
export async function extractPolicyText(file, rawText) {
    if (rawText && rawText.trim().length > 0) {
        return rawText.trim();
    }

    if (!file) {
        throw new ApiError(
            400,
            "Please upload a policy document (.pdf, .txt) or provide 'policyText' in the request body"
        );
    }

    const filePath = file.path;

    try {
        const fileBuffer = fs.readFileSync(filePath);

        if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
            let extracted = "";
            if (pdf.PDFParse) {
                const uint8 = new Uint8Array(fileBuffer);
                const parser = new pdf.PDFParse({ data: uint8 });
                const pdfData = await parser.getText();
                extracted = (pdfData.text || "").trim();
            } else if (typeof pdf === "function") {
                const pdfData = await pdf(fileBuffer);
                extracted = (pdfData.text || "").trim();
            } else {
                throw new ApiError(500, "PDF parsing module is not configured properly");
            }

            if (!extracted || extracted.length === 0) {
                throw new ApiError(400, "The uploaded PDF appears to be empty or contains scanned images without selectable text");
            }
            return extracted;
        } else if (file.mimetype.startsWith("text/") || file.originalname.toLowerCase().endsWith(".txt")) {
            return fileBuffer.toString("utf-8").trim();
        } else {
            throw new ApiError(400, "Unsupported file format. Please upload a .pdf or .txt file");
        }
    } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(500, `Failed to extract text from document: ${err.message}`);
    } finally {
        // Always clean up temp file
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (cleanupErr) {
            console.error("Failed to delete temp file:", cleanupErr);
        }
    }
}
