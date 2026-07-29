import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
    user: mongoose.Types.ObjectId;
    transactionType: 'debit' | 'credit';
    type: 'purchase' | 'topup' | 'deduction';
    amount: number;
    reference: string;
    description: string;
    status: 'success' | 'failed' | 'pending';
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        transactionType: { type: String, enum: ['debit', 'credit'], required: true },
        type: { type: String, enum: ['purchase', 'topup', 'deduction'], required: true },
        amount: { type: Number, required: true },
        reference: { type: String, required: true, unique: true },
        description: { type: String, required: true },
        status: {
            type: String,
            enum: ['success', 'failed', 'pending'],
            default: 'success'
        },
    },
    { timestamps: true }
);

const Transaction: Model<ITransaction> =
    mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
