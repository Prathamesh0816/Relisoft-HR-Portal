import Job from '../models/Job.js';
import Applicant from '../models/Applicant.js';

export const getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, department } = req.query;
    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;

    const jobs = await Job.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Job.countDocuments(query);

    res.status(200).json({
      success: true,
      data: jobs,
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

export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const applicants = await Applicant.find({ job: job._id }).populate('candidate', 'name email');

    res.status(200).json({ success: true, data: { ...job.toObject(), applicants } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createJob = async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const closeJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.create({
      ...req.body,
      job: req.params.jobId,
    });

    res.status(201).json({ success: true, data: applicant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplicantStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!applicant) {
      return res.status(404).json({ success: false, message: 'Applicant not found' });
    }

    res.status(200).json({ success: true, data: applicant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const scheduleInterview = async (req, res) => {
  try {
    const { date, time, interviewer, mode, notes } = req.body;

    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      {
        interviewDate: date,
        interviewTime: time,
        interviewer,
        interviewMode: mode,
        interviewNotes: notes,
        status: 'interview-scheduled',
      },
      { new: true }
    );

    if (!applicant) {
      return res.status(404).json({ success: false, message: 'Applicant not found' });
    }

    res.status(200).json({ success: true, data: applicant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const openJobs = await Job.countDocuments({ status: 'open' });
    const totalApplicants = await Applicant.countDocuments();
    const hired = await Applicant.countDocuments({ status: 'hired' });
    const inProcess = await Applicant.countDocuments({
      status: { $in: ['reviewed', 'interview-scheduled', 'interviewed'] },
    });

    res.status(200).json({
      success: true,
      data: {
        openJobs,
        totalApplicants,
        hired,
        inProcess,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
