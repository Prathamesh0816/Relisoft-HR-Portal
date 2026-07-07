import PurchaseOrder from '../models/PurchaseOrder.js';
import Employee from '../models/Employee.js';

export const getPurchaseOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, vendor } = req.query;
    const query = {};
    if (status) query.status = status;
    if (vendor) query.vendor = vendor;

    const orders = await PurchaseOrder.find(query)
      .populate('vendor', 'name')
      .populate('requisition', 'prNumber')
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await PurchaseOrder.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
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

export const getPurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate('vendor')
      .populate('requisition')
      .populate('createdBy')
      .populate('approvedBy');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendToVendor = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    order.status = 'sent';
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const receiveItems = async (req, res) => {
  try {
    const { receivedItems } = req.body;

    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    const allFullyReceived = order.items.every((item) => {
      const received = receivedItems.find(
        (r) => r.description === item.description
      );
      return received && received.quantityReceived >= item.quantity;
    });

    order.status = allFullyReceived ? 'fully_received' : 'partially_received';
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancel = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
