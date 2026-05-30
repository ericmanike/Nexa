import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPasswordReset extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        token: { type: String, required: true, unique: true },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 3600000) // 1 hour from now
        },
        createdAt: { type: Date, default: Date.now }
    }
);

// Create TTL index on expiresAt field - MongoDB will automatically delete documents when expiresAt is reached
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Additional indexes for faster queries
PasswordResetSchema.index({ token: 1 });
PasswordResetSchema.index({ userId: 1 });

const PasswordReset: Model<IPasswordReset> =
    mongoose.models.PasswordReset || mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);

export default PasswordReset;
