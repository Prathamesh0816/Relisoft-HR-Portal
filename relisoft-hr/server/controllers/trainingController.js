import Training from '../models/Training.js';
import Employee from '../models/Employee.js';

export const getTrainings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, department } = req.query;
    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;

    const trainings = await Training.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Training.countDocuments(query);

    res.status(200).json({
      success: true,
      data: trainings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTraining = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id)
      .populate('participants.employee', 'firstName lastName employeeId');
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }
    res.status(200).json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTraining = async (req, res) => {
  try {
    const training = await Training.create(req.body);
    res.status(201).json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTraining = async (req, res) => {
  try {
    const training = await Training.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }
    res.status(200).json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerParticipant = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    const alreadyRegistered = training.participants.find(
      (p) => p.employee.toString() === req.body.employeeId
    );
    if (alreadyRegistered) {
      return res.status(400).json({ success: false, message: 'Already registered' });
    }

    training.participants.push({
      employee: req.body.employeeId,
      status: 'registered',
      registeredAt: Date.now(),
    });
    await training.save();

    res.status(200).json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateParticipantStatus = async (req, res) => {
  try {
    const { participantId, status } = req.body;

    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    const participant = training.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    participant.status = status;
    await training.save();

    res.status(200).json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addFeedback = async (req, res) => {
  try {
    const { participantId, rating, comments } = req.body;

    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    const participant = training.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    participant.feedback = { rating, comments, submittedAt: Date.now() };
    await training.save();

    res.status(200).json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTrainingCalendar = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.endDate.$lte = new Date(endDate);
    }

    const trainings = await Training.find(query).sort('startDate');

    res.status(200).json({ success: true, data: trainings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
