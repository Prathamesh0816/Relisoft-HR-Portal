import SocialPost from '../models/SocialPost.js';
import Employee from '../models/Employee.js';

export const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, employee, status = 'active' } = req.query;
    const query = { status };
    if (type) query.type = type;
    if (employee) query.employee = employee;

    const posts = await SocialPost.find(query)
      .populate('employee', 'firstName lastName employeeId avatar')
      .populate('comments.employee', 'firstName lastName avatar')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-pinned -createdAt');

    const total = await SocialPost.countDocuments(query);

    res.status(200).json({
      success: true,
      data: posts,
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

export const createPost = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const post = await SocialPost.create({
      ...req.body,
      employee: employee._id,
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const post = await SocialPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const idx = post.likes.indexOf(employee._id);
    if (idx > -1) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(employee._id);
    }
    await post.save();

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const post = await SocialPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({
      employee: employee._id,
      content: req.body.content,
      createdAt: Date.now(),
    });
    await post.save();

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await SocialPost.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const pinPost = async (req, res) => {
  try {
    const post = await SocialPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.pinned = !post.pinned;
    await post.save();

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const query = {
      status: 'active',
      $or: [
        { visibility: 'all' },
        { visibility: 'department', employee: { $in: await Employee.find({ department: employee.department }).distinct('_id') } },
      ],
    };

    const posts = await SocialPost.find(query)
      .populate('employee', 'firstName lastName employeeId avatar')
      .populate('comments.employee', 'firstName lastName avatar')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-pinned -createdAt');

    const total = await SocialPost.countDocuments(query);

    res.status(200).json({
      success: true,
      data: posts,
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
