import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoreBundle extends Document {
    bundle: mongoose.Types.ObjectId;
    agent: mongoose.Types.ObjectId;
    basePrice: number;
    customPrice: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const StoreBundleSchema = new Schema<IStoreBundle>(
    {
        bundle: { type: Schema.Types.ObjectId, ref: 'Bundle', required: true },
        agent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        basePrice: { type: Number, required: true },
        customPrice: { type: Number, required: true },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

// Compound index to ensure one custom price per bundle per agent
StoreBundleSchema.index({ bundle: 1, agent: 1 }, { unique: true });

const StoreBundle: Model<IStoreBundle> = mongoose.models.StoreBundle || mongoose.model<IStoreBundle>('StoreBundle', StoreBundleSchema);

export default StoreBundle;
