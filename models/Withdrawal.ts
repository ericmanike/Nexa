import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWithdrawal extends Document {
    agent: mongoose.Types.ObjectId;
    amount: number;
    phoneNumber: string;
    momoName: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const WithdrawalSchema = new Schema<IWithdrawal>(
    {
        agent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        phoneNumber: { type: String, required: true },
        momoName: { type: String, required: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    },
    { timestamps: true }
);

const Withdrawal: Model<IWithdrawal> = mongoose.models.Withdrawal || mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);

export default Withdrawal;
