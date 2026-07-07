import jwt from 'jsonwebtoken';

export class ApprovalTokenService {
  generateToken(leaveApplicationId, approverId) {
    return jwt.sign(
      { leaveAppId: leaveApplicationId, approverId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  decodeToken(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { leaveAppId: decoded.leaveAppId, approverId: decoded.approverId };
  }
}

export default new ApprovalTokenService();
