const { requireAuth, getAuth, clerkClient } = require('@clerk/express');
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

    // Fetch user from Clerk API to ensure we have access to publicMetadata and imageUrl
    let clerkUser;
    try {
      clerkUser = await clerkClient.users.getUser(clerkId);
    } catch (apiErr) {
      console.error('Failed to fetch user from Clerk API:', apiErr);
      return res.status(500).json({ error: 'Failed to synchronize user profile from Clerk' });
    }

    // Default to 'user' role. Only explicitly set roles in Clerk metadata override this.
    const roleFromClerk = clerkUser.publicMetadata?.role || 'user';
    const clerkImageUrl = clerkUser.imageUrl || null;

    // Find user in MongoDB or create them Just-In-Time
    let user = await User.findOne({ clerkId });
    if (!user) {
      user = await User.create({
        clerkId,
        name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : 'Clerk User',
        email: clerkUser.emailAddresses?.[0]?.emailAddress || clerkId + '@temp.clerk',
        role: roleFromClerk,
        avatarUrl: clerkImageUrl, // Set default avatar from Clerk's imageUrl
      });
    } else {
      // Always sync the role from Clerk's publicMetadata
      user.role = roleFromClerk;
      // If user hasn't set a custom avatar yet (or it's null), sync from Clerk
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
