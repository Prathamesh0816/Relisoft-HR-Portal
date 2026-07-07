import mongoose from 'mongoose';

const voteSubSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'CouncilMember' },
  vote: { type: String, enum: ['for', 'against', 'abstain'] },
  comment: { type: String },
  votedAt: { type: Date, default: Date.now },
}, { _id: false });

const councilMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  type: { type: String, enum: ['internal', 'external'], required: true },
  externalOrg: { type: String },
  role: {
    type: String,
    enum: ['chairperson', 'viceChair', 'secretary', 'member', 'observer'],
    default: 'member',
  },
  tenureStart: { type: Date, required: true },
  tenureEnd: { type: Date },
  isActive: { type: Boolean, default: true },
  expertise: [{ type: String }],
  bio: { type: String },
  profileImage: { type: String },
}, { timestamps: true });

const councilMeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  agenda: [{ type: String }],
  meetingDate: { type: Date, required: true },
  meetingLink: { type: String },
  venue: { type: String },
  minutes: { type: String },
  recordings: [{ type: String }],
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CouncilMember' }],
  decisions: [{ type: String }],
}, { timestamps: true });

const aiProposalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'CouncilMember', required: true },
  category: {
    type: String,
    enum: ['ethics', 'tool', 'policy', 'infrastructure', 'research'],
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'under-discussion', 'voting', 'approved', 'rejected', 'deferred'],
    default: 'draft',
  },
  votes: [voteSubSchema],
  voteDeadline: { type: Date },
  implementationStatus: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'on-hold'],
  },
  decisionRationale: { type: String },
}, { timestamps: true });

export const CouncilMember = mongoose.model('CouncilMember', councilMemberSchema);
export const CouncilMeeting = mongoose.model('CouncilMeeting', councilMeetingSchema);
export const AIProposal = mongoose.model('AIProposal', aiProposalSchema);
