import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        passwordHash: {
            type: String,
            required: [true, "Password hash is required"],
        },
        role: {
            type: String,
            enum: ["citizen", "admin"],
            default: "citizen",
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.methods.isPasswordCorrect = async function (password) {
    if (!this.passwordHash) return false;
    return await bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
            name: this.name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
        }
    );
};

export const User = mongoose.model("User", userSchema);
export default User;
