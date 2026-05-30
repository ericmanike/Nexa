import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemLog extends Document {
    level: 'info' | 'warn' | 'error' | 'debug';
    category: 'order' | 'payment' | 'auth' | 'wallet' | 'agent' | 'webhook' | 'system' | 'store';
    message: string;
    meta?: Record<string, any>;
    user?: mongoose.Types.ObjectId;
    ip?: string;
    createdAt: Date;
}

const SystemLogSchema = new Schema<ISystemLog>(
    {
        level: {
            type: String,
            enum: ['info', 'warn', 'error', 'debug'],
            default: 'info',
            index: true,
        },
        category: {
            type: String,
            enum: ['order', 'payment', 'auth', 'wallet', 'agent', 'webhook', 'system', 'store'],
            required: true,
            index: true,
        },
        message: { type: String, required: true },
        meta: { type: Schema.Types.Mixed },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        ip: { type: String },
    },
    { timestamps: true }
);

// Auto-expire logs after 90 days
SystemLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const SystemLog: Model<ISystemLog> =
    mongoose.models.SystemLog || mongoose.model<ISystemLog>('SystemLog', SystemLogSchema);

export default SystemLog;
