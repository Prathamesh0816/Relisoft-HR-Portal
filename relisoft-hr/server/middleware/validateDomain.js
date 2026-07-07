const ALLOWED_DOMAIN = 'relisofttechnologies.com';

export function validateEmailDomain(email) {
  if (!email) return { valid: false, message: 'Email is required' };
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return { valid: false, message: 'Invalid email format' };
  if (domain !== ALLOWED_DOMAIN) {
    return { valid: false, message: `Only @${ALLOWED_DOMAIN} email addresses are allowed. Got @${domain}` };
  }
  return { valid: true };
}

export function requireReliSoftDomain(req, res, next) {
  if (req.user?.email) {
    const result = validateEmailDomain(req.user.email);
    if (!result.valid) {
      return res.status(403).json({ success: false, message: result.message });
    }
  }
  next();
}
