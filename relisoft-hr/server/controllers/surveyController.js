import Survey from '../models/Survey.js';
import Employee from '../models/Employee.js';

export const getSurveys = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, department } = req.query;
    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;

    const surveys = await Survey.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Survey.countDocuments(query);

    res.status(200).json({
      success: true,
      data: surveys,
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

export const getSurvey = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id).populate('questions');
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    res.status(200).json({ success: true, data: survey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSurvey = async (req, res) => {
  try {
    const survey = await Survey.create({
      ...req.body,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, data: survey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSurvey = async (req, res) => {
  try {
    const survey = await Survey.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    res.status(200).json({ success: true, data: survey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitResponse = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const survey = await Survey.findById(req.params.id);
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const alreadyResponded = survey.responses.find(
      (r) => r.employee.toString() === employee._id.toString()
    );
    if (alreadyResponded) {
      return res.status(400).json({ success: false, message: 'Already responded' });
    }

    survey.responses.push({
      employee: employee._id,
      answers: req.body.answers,
      submittedAt: Date.now(),
    });
    await survey.save();

    res.status(200).json({ success: true, data: survey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSurveyResults = async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id)
      .populate('responses.employee', 'firstName lastName department');

    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }

    const totalResponses = survey.responses.length;
    const questionResults = survey.questions.map((q, qIdx) => {
      const answers = survey.responses
        .map((r) => r.answers[qIdx])
        .filter((a) => a !== undefined);

      const counts = {};
      for (const ans of answers) {
        counts[ans] = (counts[ans] || 0) + 1;
      }

      return {
        question: q.text,
        totalAnswers: answers.length,
        distribution: counts,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        surveyTitle: survey.title,
        totalResponses,
        questionResults,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const closeSurvey = async (req, res) => {
  try {
    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    );
    if (!survey) {
      return res.status(404).json({ success: false, message: 'Survey not found' });
    }
    res.status(200).json({ success: true, data: survey });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
