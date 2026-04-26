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

    // Default to 'user' role. Only explicitly set roles in Clerk metadata override this.
    const roleFromClerk = sessionClaims?.public_metadata?.role || 'user';
    const clerkImageUrl = sessionClaims?.image_url || null;

    // Find user in MongoDB or create them Just-In-Time
      let user = await User.findOne({ clerkId });
      if (!user) {
        user = await User.create({
          clerkId,
          name: sessionClaims?.name || sessionClaims?.first_name || 'Clerk User',
          email: sessionClaims?.primary_email_address || sessionClaims?.email || clerkId + '@temp.clerk',
          role: roleFromClerk,
          avatarUrl: clerkImageUrl, // Set default avatar from Clerk's image_url
        });
      } else {
        // Always sync the role from Clerk's public_metadata
        user.role = roleFromClerk;
        // If user hasn't set a custom avatar yet, sync from Clerk
        if (!user.avatarUrl && clerkImageUrl) {
          user.avatarUrl = clerkImageUrl;
        }
        await user.save();
      }
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
