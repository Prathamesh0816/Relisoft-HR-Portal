import { CouncilMember, CouncilMeeting, AIProposal } from '../models/AICouncil.js';

export const getMembers = async (req, res) => {
  try {
    const members = await CouncilMember.find({ isActive: true }).sort('-createdAt');
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMember = async (req, res) => {
  try {
    const member = await CouncilMember.create(req.body);
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const member = await CouncilMember.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member = await CouncilMember.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.status(200).json({ success: true, message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMeetings = async (req, res) => {
  try {
    const meetings = await CouncilMeeting.find().populate('attendees', 'name role').sort('-meetingDate');
    res.status(200).json({ success: true, data: meetings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMeeting = async (req, res) => {
  try {
    const meeting = await CouncilMeeting.create(req.body);
    res.status(201).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMeeting = async (req, res) => {
  try {
    const meeting = await CouncilMeeting.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });
    res.status(200).json({ success: true, data: meeting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProposals = async (req, res) => {
  try {
    const proposals = await AIProposal.find().populate('proposedBy', 'name role').sort('-createdAt');
    res.status(200).json({ success: true, data: proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProposal = async (req, res) => {
  try {
    const proposal = await AIProposal.create(req.body);
    res.status(201).json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const castVote = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId, vote, comment } = req.body;

    const proposal = await AIProposal.findById(id);
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });

    const existingVote = proposal.votes.find(v => v.member.toString() === memberId);
    if (existingVote) {
      return res.status(400).json({ success: false, message: 'Member has already voted' });
    }

    proposal.votes.push({ member: memberId, vote, comment, votedAt: Date.now() });
    await proposal.save();

    res.status(200).json({ success: true, data: proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
