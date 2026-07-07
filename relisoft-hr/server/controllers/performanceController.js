import Performance from '../models/Performance.js';
import Employee from '../models/Employee.js';

export const getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, department, year } = req.query;
    const query = {};
    if (status) query.status = status;
    if (year) query.year = parseInt(year);
    if (department) {
      const employees = await Employee.find({ department }).select('_id');
      query.employee = { $in: employees.map((e) => e._id) };
    }

    const reviews = await Performance.find(query)
      .populate('employee', 'firstName lastName employeeId')
      .populate('reviewer', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Performance.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reviews,
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

export const getReview = async (req, res) => {
  try {
    const review = await Performance.findById(req.params.id)
      .populate('employee')
      .populate('reviewer');

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const review = await Performance.create(req.body);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const review = await Performance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addSelfRating = async (req, res) => {
  try {
    const review = await Performance.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.selfComment = req.body.comments;
    if (req.body.ratings) {
      review.kras.forEach((kra, i) => {
        if (req.body.ratings[i] !== undefined) kra.selfRating = req.body.ratings[i];
      });
    }
    await review.save();

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addManagerRating = async (req, res) => {
  try {
    const review = await Performance.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.managerComment = req.body.comments;
    if (req.body.ratings) {
      review.kras.forEach((kra, i) => {
        if (req.body.ratings[i] !== undefined) kra.managerRating = req.body.ratings[i];
      });
    }
    review.reviewer = req.body.reviewer || review.reviewer;
    await review.save();

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeReview = async (req, res) => {
  try {
    const review = await Performance.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', reviewedAt: Date.now() },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const reviews = await Performance.find({ employee: employee._id })
      .populate('reviewer', 'firstName lastName')
      .sort('-year -createdAt');

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
