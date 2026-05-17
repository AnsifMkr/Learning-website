const { requireAuth, getAuth } = require('@clerk/express');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header present:', !!authHeader, 'Value starts with Bearer:', authHeader?.startsWith('Bearer '));
    const { userId: clerkId, sessionClaims } = getAuth(req);
    console.log('Auth check:', { clerkId, hasSessionClaims: !!sessionClaims });

    if (!clerkId) {
      console.log('No clerkId found, auth failed');
      return res.status(401).json({ error: 'Unauthorized: No Clerk ID found' });
    }

    // Clerk stores the role in public_metadata on the JWT session claims.
    // The exact path depends on the Clerk JWT template configuration:
    //   - Default sessions: sessionClaims.public_metadata.role
    //   - Custom JWT template: may differ
    // We try multiple known paths to be resilient.
    console.log('Full sessionClaims:', JSON.stringify(sessionClaims));
    const roleFromClerk =
      sessionClaims?.public_metadata?.role ||
      sessionClaims?.metadata?.public?.role ||
      sessionClaims?.role ||
      'user';
    const clerkImageUrl = sessionClaims?.image_url || null;

    console.log('Role from Clerk session claims:', roleFromClerk);

    // Find user in MongoDB or create them Just-In-Time
    let user = await User.findOne({ clerkId });
    if (!user) {
      user = await User.create({
        clerkId,
        name: sessionClaims?.name || sessionClaims?.first_name || 'Clerk User',
        email: sessionClaims?.primary_email_address || sessionClaims?.email || clerkId + '@temp.clerk',
        role: roleFromClerk,
        avatarUrl: clerkImageUrl,
      });
    } else {
      // Always sync role from Clerk's public_metadata so dashboard changes take effect immediately
      user.role = roleFromClerk;
      // Only sync avatar from Clerk if the user hasn't set a custom one yet
      if (!user.avatarUrl && clerkImageUrl) {
        user.avatarUrl = clerkImageUrl;
      }
      await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Invalid Clerk token' });
  }
};
