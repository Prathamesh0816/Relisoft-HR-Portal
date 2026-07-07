import GoodsReceipt from '../models/GoodsReceipt.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Employee from '../models/Employee.js';

export const getGoodsReceipts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, purchaseOrder } = req.query;
    const query = {};
    if (status) query.status = status;
    if (purchaseOrder) query.purchaseOrder = purchaseOrder;

    const receipts = await GoodsReceipt.find(query)
      .populate('purchaseOrder', 'poNumber totalAmount')
      .populate('receivedBy', 'firstName lastName')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    const total = await GoodsReceipt.countDocuments(query);

    res.status(200).json({
      success: true,
      data: receipts,
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

export const getGoodsReceipt = async (req, res) => {
  try {
    const receipt = await GoodsReceipt.findById(req.params.id)
      .populate('purchaseOrder')
      .populate('receivedBy');
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Goods receipt not found' });
    }
    res.status(200).json({ success: true, data: receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGoodsReceipt = async (req, res) => {
  try {
    const receipt = await GoodsReceipt.create(req.body);
    res.status(201).json({ success: true, data: receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGoodsReceipt = async (req, res) => {
  try {
    const receipt = await GoodsReceipt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Goods receipt not found' });
    }
    res.status(200).json({ success: true, data: receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGoodsReceipt = async (req, res) => {
  try {
    const receipt = await GoodsReceipt.findByIdAndDelete(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Goods receipt not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const receiveItems = async (req, res) => {
  try {
    const { purchaseOrderId, items, notes } = req.body;

    const po = await PurchaseOrder.findById(purchaseOrderId);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase order not found' });
    }

    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const receiptItems = po.items.map((poItem) => {
      const received = items.find(
        (r) => r.description === poItem.description
      );

      const quantityReceived = received ? received.quantityReceived : 0;
      const quantityAccepted = received ? received.quantityAccepted || quantityReceived : 0;
      const quantityRejected = received ? received.quantityRejected || 0 : 0;

      return {
        description: poItem.description,
        quantityOrdered: poItem.quantity,
        quantityReceived,
        quantityAccepted,
        quantityRejected,
        rejectionReason: received ? received.rejectionReason : '',
      };
    });

    const allCompleted = receiptItems.every(
      (item) => item.quantityReceived >= item.quantityOrdered
    );
    const anyReceived = receiptItems.some((item) => item.quantityReceived > 0);

    const receipt = await GoodsReceipt.create({
      purchaseOrder: purchaseOrderId,
      receivedBy: employee._id,
      items: receiptItems,
      status: allCompleted ? 'completed' : anyReceived ? 'partially_completed' : 'pending',
      notes,
    });

    po.status = allCompleted ? 'fully_received' : 'partially_received';
    await po.save();

    res.status(201).json({ success: true, data: receipt });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
