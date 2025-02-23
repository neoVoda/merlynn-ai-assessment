import mongoose from 'mongoose';

const DecisionSchema = new mongoose.Schema({
  modelId: { type: String, required: true },
  inputData: { type: mongoose.Schema.Types.Mixed, required: true },
  decisionResult: { type: mongoose.Schema.Types.Mixed, required: true }
}, {
  timestamps: true
});

export default mongoose.models.Decision || mongoose.model('Decision', DecisionSchema);
