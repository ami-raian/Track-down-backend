const User = require('../models/user.model');
const env = require('../config/env');

/**
 * Ensure the super-admin account exists on startup. The admin's credentials
 * come from .env (ADMIN_EMAIL / ADMIN_PASSWORD) and are the source of truth —
 * the account is always (re)enforced to role 'admin', active, and matching the
 * configured password.
 */
async function seedAdmin() {
  const { email, password, name } = env.admin;
  if (!email || !password) {
    console.warn('⚠️  ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin seed');
    return;
  }

  const admin = await User.findOne({ email }).select('+password');

  if (!admin) {
    await User.create({ name, email, password, role: 'admin' });
    console.log(`✅ Super admin created: ${email}`);
    return;
  }

  let changed = false;
  if (admin.role !== 'admin') {
    admin.role = 'admin';
    changed = true;
  }
  if (admin.isDeleted) {
    admin.isDeleted = false;
    admin.deletedAt = null;
    changed = true;
  }
  const passwordMatches = await admin.comparePassword(password);
  if (!passwordMatches) {
    admin.password = password; // re-enforce the configured admin password
    changed = true;
  }
  if (changed) {
    await admin.save();
    console.log(`✅ Super admin ensured: ${email}`);
  }
}

module.exports = seedAdmin;
