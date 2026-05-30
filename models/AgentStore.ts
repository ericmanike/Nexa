import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAgentStore extends Document {
    user: mongoose.Types.ObjectId;
    storeName: string;
    slug: string;
    description: string;
    isActive: boolean;
    totalSalesCount: number;
    totalProfit: number;
    createdAt: Date;
    updatedAt: Date;
}

const AgentStoreSchema = new Schema<IAgentStore>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        storeName: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        description: { type: String, default: '' },
        isActive: { type: Boolean, default: true },
        totalSalesCount: { type: Number, default: 0 },
        totalProfit: { type: Number, default: 0 }
    },
    { timestamps: true }
);

const AgentStore: Model<IAgentStore> = mongoose.models.AgentStore || mongoose.model<IAgentStore>('AgentStore', AgentStoreSchema);

export default AgentStore;
