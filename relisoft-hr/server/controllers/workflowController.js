import Workflow from '../models/Workflow.js';

export const getWorkflows = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const workflows = await Workflow.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Workflow.countDocuments(query);

    res.status(200).json({
      success: true,
      data: workflows,
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

export const getWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.create(req.body);
    res.status(201).json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }
    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }

    workflow.isActive = !workflow.isActive;
    await workflow.save();

    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processStage = async (req, res) => {
  try {
    const { stageId, status, notes } = req.body;

    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }

    const stage = workflow.stages.id(stageId);
    if (!stage) {
      return res.status(404).json({ success: false, message: 'Stage not found' });
    }

    stage.status = status;
    stage.notes = notes;
    stage.processedAt = Date.now();
    stage.processedBy = req.user.id;

    if (status === 'completed') {
      const currentIndex = workflow.stages.indexOf(stage);
      if (currentIndex < workflow.stages.length - 1) {
        workflow.stages[currentIndex + 1].status = 'active';
      } else {
        workflow.status = 'completed';
      }
    }

    await workflow.save();

    res.status(200).json({ success: true, data: workflow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
