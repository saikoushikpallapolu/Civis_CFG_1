import mongoose, { Schema } from "mongoose";

const sentimentSchema = new Schema(
    {
        positive: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        neutral: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        negative: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    { _id: false }
);

const segmentBreakdownSchema = new Schema(
    {
        questionId: {
            type: String,
            required: [true, "questionId is required"],
        },
        option: {
            type: String,
            required: [true, "option is required"],
        },
        sentiment: {
            type: sentimentSchema,
            default: () => ({ positive: 0, neutral: 0, negative: 0 }),
        },
        themes: {
            type: [String],
            default: [],
        },
        summary: {
            type: String,
            default: "",
        },
        sampleQuotes: {
            type: [String],
            default: [],
        },
    },
    { _id: false }
);

const analysisSchema = new Schema(
    {
        consultationId: {
            type: Schema.Types.ObjectId,
            ref: "Consultation",
            required: [true, "consultationId is required"],
            unique: true,
            index: true,
        },
        generatedAt: {
            type: Date,
            default: Date.now,
        },
        responseCountAtGeneration: {
            type: Number,
            default: 0,
            min: 0,
        },
        overallSentiment: {
            type: sentimentSchema,
            default: () => ({ positive: 0, neutral: 0, negative: 0 }),
        },
        topThemes: {
            type: [String],
            default: [],
        },
        themeAnalysis: {
            type: [
                {
                    theme: { type: String, required: true },
                    sentiment: { type: String, enum: ["positive", "neutral", "negative", "mixed"], default: "neutral" },
                    prevalence: { type: Number, min: 0, max: 100, default: 0 },
                    description: { type: String, default: "" },
                },
            ],
            default: [],
        },
        executiveSummary: {
            type: String,
            default: "",
        },
        actionableInsights: {
            type: [
                {
                    recommendation: { type: String, required: true },
                    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
                    area: { type: String, default: "" },
                },
            ],
            default: [],
        },
        segmentBreakdown: {
            type: [segmentBreakdownSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

export const Analysis = mongoose.model("Analysis", analysisSchema);
export default Analysis;
