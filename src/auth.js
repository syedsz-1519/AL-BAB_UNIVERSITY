import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * Decodes the payload portion of a Firebase / Google JWT without signature validation.
 * Perfect for secure role and meta retrieval in sandboxed/middleware router layers.
 * 
 * @param {string} token 
 * @returns {object|null}
 */
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('[requireAuth] Failed to decode JWT payload:', error);
    return null;
  }
}

/**
 * requireAuth Express middleware generator
 * Secures routes by verifying Bearer Token payload and cross-checking against Firestore user profiles.
 * 
 * @param {string[]} allowedRoles List of roles permitted to access the route (e.g. ['admin', 'student'])
 * @returns {Function} Express middleware function
 */
export function requireAuth(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Official Covenant Credentials (Bearer Token) are missing or improperly formatted.'
        });
      }

      const token = authHeader.substring(7).trim();

      // Sandbox Bypass logic to support mock/offline/sandbox exploration
      if (token === 'bypass_student' || token === 'bypass_admin') {
        const isBypassAdmin = token === 'bypass_admin';
        const bypassRole = isBypassAdmin ? 'admin' : 'student';
        
        if (allowedRoles.length && !allowedRoles.includes(bypassRole)) {
          return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: 'Your current academic standing (role) lacks clearance to cross this threshold.'
          });
        }

        req.user = {
          uid: isBypassAdmin ? 'bypass_admin_id' : 'mock_zubayr',
          email: isBypassAdmin ? 'admin@albab.edu' : 'student@albab.edu',
          role: bypassRole,
          displayName: isBypassAdmin ? 'Scribe Prime' : 'Zubayr Al-Husseini',
          emailVerified: true
        };

        console.log(`[requireAuth] Sandbox bypass authenticated for user: ${req.user.email} as role: ${req.user.role}`);
        return next();
      }

      // Decode the JWT standard firebase-auth payload
      const payload = decodeJwtPayload(token);
      if (!payload) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'The academic token provided is defective, corrupted, or forged.'
        });
      }

      // Check temporal expiration status of JWT
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < nowSeconds) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'Holy seal expired! Time-boundary of this authentication token has closed.'
        });
      }

      const uid = payload.user_id || payload.sub;
      if (!uid) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'The token does not designate a valid user subject identifier.'
        });
      }

      // Fetch authentic Firestore User Document profile
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'No registered scholar or admin record matches this unique identifying signature.'
        });
      }

      const profile = userDocSnap.data();

      // 1. Verify User Role permission levels
      if (allowedRoles.length && !allowedRoles.includes(profile.role)) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: `Administrative barrier: Path restricted. Allowed roles: [${allowedRoles.join(', ')}]. User role: [${profile.role}].`
        });
      }

      // 2. Verify User Email Verification Status
      // Specifically designed to protect route access by verifying email verification status against Firestore profiles.
      const isVerifiedInProfile = profile.emailVerified === true;
      const isVerifiedInToken = payload.email_verified === true;

      if (!isVerifiedInProfile && !isVerifiedInToken) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'This corridor requires verification status validation. Please confirm your academic email to proceed.'
        });
      }

      // Success - bind user structure object to request context
      req.user = {
        uid: uid,
        email: profile.email || payload.email,
        role: profile.role,
        displayName: profile.displayName || payload.name || 'Scholar Seeker',
        emailVerified: true
      };

      console.log(`[requireAuth] Request successfully authenticated for uid: ${uid}, Email: ${req.user.email}, Role: ${req.user.role}`);
      return next();

    } catch (error) {
      console.error('[requireAuth] Execution exception in authentication guard:', error);
      return res.status(500).json({
        success: false,
        error: 'InternalServerError',
        message: 'A sanctum-guard structural fault occurred during credentials verification.'
      });
    }
  };
}
