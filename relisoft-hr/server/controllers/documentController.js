import Document from '../models/Document.js';

export const getDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const documents = await Document.find(query)
      .populate('createdBy', 'name')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await Document.countDocuments(query);

    res.status(200).json({
      success: true,
      data: documents,
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

export const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('signatures.user', 'name email');

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDocument = async (req, res) => {
  try {
    const document = await Document.create({
      ...req.body,
      createdBy: req.user.id,
      version: 1,
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    document.version += 1;
    document.content = req.body.content || document.content;
    document.title = req.body.title || document.title;
    document.updatedAt = Date.now();
    await document.save();

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addSignature = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const alreadySigned = document.signatures.find(
      (s) => s.user.toString() === req.user.id
    );

    if (alreadySigned) {
      return res.status(400).json({ success: false, message: 'Already signed' });
    }

    document.signatures.push({
      user: req.user.id,
      signedAt: Date.now(),
      signature: req.body.signature,
    });

    await document.save();

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const archiveDocument = async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.status(200).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const { employeeId, documentType, title, fileUrl, expiryDate, tags } = req.body;
    if (!employeeId || !title || !fileUrl) {
      return res.status(400).json({ success: false, message: 'employeeId, title, and fileUrl are required' });
    }
    const document = await Document.create({
      title,
      type: documentType || 'other',
      employee: employeeId,
      fileUrl,
      expiryDate: expiryDate || null,
      tags: tags || [],
      createdBy: req.user.id,
      status: 'final',
      version: 1,
    });
    res.status(201).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const documents = await Document.find({ employee: employeeId })
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpiringDocuments = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));
    const documents = await Document.find({
      expiryDate: { $lte: futureDate, $gte: new Date() },
      status: { $ne: 'archived' },
    }).populate('createdBy', 'name');
    res.status(200).json({ success: true, count: documents.length, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateFromTemplate = async (req, res) => {
  try {
    const { templateId, variables } = req.body;

    const template = await Document.findById(templateId);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    let content = template.content;
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    const document = await Document.create({
      title: template.title,
      content,
      category: template.category,
      createdBy: req.user.id,
      version: 1,
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
