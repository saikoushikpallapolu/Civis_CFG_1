import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema(
    {
        questionId: {
            type: String,
            required: [true, "questionId is required"],
            default: () => new mongoose.Types.ObjectId().toString(),
        },
        text: {
            type: String,
            required: [true, "Question text is required"],
            trim: true,
        },
        type: {
            type: String,
            required: [true, "Question type is required"],
            enum: ["text", "single_choice", "multi_choice"],
        },
        options: {
            type: [String],
            default: [],
        },
        required: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

const consultationSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["draft", "open", "closed"],
            default: "open",
            index: true,
        },
        questions: {
            type: [questionSchema],
            default: [],
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "createdBy is required"],
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

consultationSchema.index({ status: 1, createdAt: -1 });

export const Consultation = mongoose.model("Consultation", consultationSchema);
export default Consultation;
