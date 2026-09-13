import mongoose, { Schema } from "mongoose";

const answerSchema = new Schema(
    {
        questionId: {
            type: String,
            required: [true, "questionId is required"],
        },
        value: {
            type: Schema.Types.Mixed,
            required: [true, "Answer value is required"],
        },
    },
    { _id: false }
);

const responseSchema = new Schema(
    {
        consultationId: {
            type: Schema.Types.ObjectId,
            ref: "Consultation",
            required: [true, "consultationId is required"],
            index: true,
        },
        citizenId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },
        answers: {
            type: [answerSchema],
            default: [],
        },
        submittedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

responseSchema.index({ consultationId: 1, submittedAt: -1 });

export const Response = mongoose.model("Response", responseSchema);
export default Response;
