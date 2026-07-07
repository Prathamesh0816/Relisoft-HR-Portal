import PurchaseRequisition from '../models/PurchaseRequisition.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Employee from '../models/Employee.js';

export const getPurchaseRequisitions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, department, urgency } = req.query;
    const query = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (urgency) query.urgency = urgency;

    const requisitions = await PurchaseRequisition.find(query)
      .populate('requestedBy', 'firstName lastName employeeId')
      .populate('approvedBy', 'firstName lastName')
      .populate('poReference', 'poNumber totalAmount')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await PurchaseRequisition.countDocuments(query);

    res.status(200).json({
      success: true,
      data: requisitions,
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

export const getPurchaseRequisition = async (req, res) => {
  try {
    const requisition = await PurchaseRequisition.findById(req.params.id)
      .populate('requestedBy')
      .populate('approvedBy')
      .populate('poReference');
    if (!requisition) {
      return res.status(404).json({ success: false, message: 'Purchase requisition not found' });
    }
    res.status(200).json({ success: true, data: requisition });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPurchaseRequisition = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const items = req.body.items.map((item) => ({
      ...item,
      totalEstimatedCost: item.quantity * item.estimatedCost,
    }));

    const totalEstimatedCost = items.reduce((sum, item) => sum + (item.totalEstimatedCost || 0), 0);

    const requisition = await PurchaseRequisition.create({
      ...req.body,
      items,
      totalEstimatedCost,
      requestedBy: employee._id,
    });
    res.status(201).json({ success: true, data: requisition });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePurchaseRequisition = async (req, res) => {
  try {
    const requisition = await PurchaseRequisition.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!requisition) {
      return res.status(404).json({ success: false, message: 'Purchase requisition not found' });
    }
    res.status(200).json({ success: true, data: requisition });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePurchaseRequisition = async (req, res) => {
  try {
    const requisition = await PurchaseRequisition.findByIdAndDelete(req.params.id);
    if (!requisition) {
      return res.status(404).json({ success: false, message: 'Purchase requisition not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submit = async (req, res) => {
  try {
    const requisition = await PurchaseRequisition.findById(req.params.id);
    if (!requisition) {
      return res.status(404).json({ success: false, message: 'Purchase requisition not found' });
    }
    requisition.status = 'pending';
    await requisition.save();
    res.status(200).json({ success: true, data: requisition });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approve = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const requisition = await PurchaseRequisition.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        approvedBy: employee._id,
        approvedAt: Date.now(),
      },
      { new: true }
    );

    if (!requisition) {
      return res.status(404).json({ success: false, message: 'Purchase requisition not found' });
    }

    res.status(200).json({ success: true, data: requisition });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reject = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const { rejectionReason } = req.body;

    const requisition = await PurchaseRequisition.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        approvedBy: employee._id,
        approvedAt: Date.now(),
        rejectionReason,
      },
      { new: true }
    );

    if (!requisition) {
      return res.status(404).json({ success: false, message: 'Purchase requisition not found' });
    }

    res.status(200).json({ success: true, data: requisition });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const convertToPO = async (req, res) => {
  try {
    const requisition = await PurchaseRequisition.findById(req.params.id);
    if (!requisition) {
      return res.status(404).json({ success: false, message: 'Purchase requisition not found' });
    }

    if (requisition.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Requisition must be approved before converting to PO' });
    }

    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const poItems = requisition.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.estimatedCost || 0,
      totalPrice: item.estimatedCost ? item.quantity * item.estimatedCost : 0,
    }));

    const totalAmount = poItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const purchaseOrder = await PurchaseOrder.create({
      requisition: requisition._id,
      items: poItems,
      totalAmount,
      createdBy: employee._id,
      status: 'draft',
    });

    requisition.status = 'ordered';
    requisition.poReference = purchaseOrder._id;
    await requisition.save();

    res.status(201).json({ success: true, data: { requisition, purchaseOrder } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
