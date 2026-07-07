import mongoose from 'mongoose';

const resilienceKnowledgeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    knowledgeArea: {
      type: String,
      required: true,
    },
    documentationLevel: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Low',
    },
    proficiency: {
      type: String,
      enum: ['Expert', 'Intermediate', 'Beginner'],
      default: 'Intermediate',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('ResilienceKnowledge', resilienceKnowledgeSchema);
