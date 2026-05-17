const { getAuth } = require('@clerk/express');
const { createClerkClient } = require('@clerk/backend');
const User = require('../models/User');

// Initialize the Clerk Backend client once so we can call the Clerk API directly.
// This lets us fetch public_metadata.role reliably without needing it baked into
// the JWT session token (which requires a custom Clerk Dashboard configuration).
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header present:', !!authHeader);

    const { userId: clerkId, sessionClaims } = getAuth(req);
    console.log('Auth check — clerkId:', clerkId);

    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized: No Clerk ID found' });
    }

    // ── Resolve the role ────────────────────────────────────────────────────
    // Strategy 1: Try the JWT sessionClaims first (fast, no extra API call).
    //   Works only if the Clerk Dashboard → Sessions → Customize session token
    //   has been set to include {{ user.public_metadata.role }} as a claim.
    // Strategy 2: Fall back to the Clerk Backend API (always accurate, costs
    //   one extra HTTP call per request but never wrong).
    let roleFromClerk =
      sessionClaims?.public_metadata?.role ||   // custom JWT claim (preferred)
      sessionClaims?.metadata?.public?.role ||   // alternative JWT template shape
      sessionClaims?.role ||                     // flat custom claim
      null;

    if (!roleFromClerk) {
      // JWT claims didn't include the role — fetch directly from Clerk API
      try {
        const clerkUser = await clerk.users.getUser(clerkId);
        roleFromClerk = clerkUser?.publicMetadata?.role || 'user';
        console.log('Role fetched from Clerk API:', roleFromClerk);
      } catch (clerkErr) {
        console.error('Failed to fetch Clerk user for role:', clerkErr.message);
        roleFromClerk = 'user'; // safe fallback
      }
    } else {
      console.log('Role resolved from JWT claims:', roleFromClerk);
    }

    const clerkImageUrl = sessionClaims?.image_url || null;

    // ── Sync user to MongoDB ────────────────────────────────────────────────
    let user = await User.findOne({ clerkId });
    if (!user) {
      user = await User.create({
        clerkId,
        name: sessionClaims?.name || sessionClaims?.first_name || 'Clerk User',
        email: sessionClaims?.primary_email_address || sessionClaims?.email || clerkId + '@temp.clerk',
        role: roleFromClerk,
        avatarUrl: clerkImageUrl,
      });
      console.log('JIT user created with role:', roleFromClerk);
    } else {
      // Always sync role from Clerk so Clerk Dashboard changes propagate immediately
      user.role = roleFromClerk;
      // Only sync avatar from Clerk if the user hasn't set a custom one
      if (!user.avatarUrl && clerkImageUrl) {
        user.avatarUrl = clerkImageUrl;
      }
      await user.save();
      console.log('User synced — role set to:', user.role);
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(401).json({ error: 'Invalid Clerk token' });
  }
};
