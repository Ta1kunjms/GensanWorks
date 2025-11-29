import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { storage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

// ============ JWT UTILITIES ============

export interface JWTPayload {
  id: string;
  email: string;
  role: "admin" | "employer" | "jobseeker" | "freelancer";
  name: string;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyRefreshToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// ============ PASSWORD UTILITIES ============

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============ VALIDATION UTILITIES ============

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  // Allow any symbol/punctuation as a special character, not limited set
  // Matches any non-alphanumeric ASCII punctuation character (excluding spaces)
  const hasSymbol = /[!"#$%&'()*+,\-./:;<=>?@\[\\\]^_`{|}~]/.test(password);
  if (!hasSymbol) {
    errors.push("Password must contain at least one symbol (e.g., !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============ ERROR RESPONSE UTILITY ============

export interface ApiErrorResponse {
  error: {
    code: string;
    field?: string;
    message: string;
    details?: any;
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  field?: string,
  details?: any
): ApiErrorResponse {
  return {
    error: {
      code,
      field,
      message,
      details,
    },
  };
}

// Error codes
export const ErrorCodes = {
  MISSING_FIELD: "MISSING_FIELD",
  INVALID_FORMAT: "INVALID_FORMAT",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  DUPLICATE_EMAIL: "DUPLICATE_EMAIL",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

// ============ PASSPORT: GOOGLE OAUTH ============

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback";

function isGoogleConfig(config: any): config is { clientId: string; clientSecret: string; callbackUrl?: string } {
  return (
    typeof config === "object" &&
    typeof config.clientId === "string" &&
    typeof config.clientSecret === "string"
  );
}

export async function initGoogleOAuth() {
  // Prefer env vars, fallback to dynamic settings if available
  let clientID = GOOGLE_CLIENT_ID;
  let clientSecret = GOOGLE_CLIENT_SECRET;
  let callbackURL = GOOGLE_CALLBACK_URL;

  // Always try to load from dynamic settings (async)
  try {
    if (storage.getAuthSettings) {
      const val = await storage.getAuthSettings();
      const google = val?.providers?.find((p: any) => p.id === "google");
      if (
        google?.enabled &&
        isGoogleConfig(google.config)
      ) {
        clientID = google.config.clientId;
        clientSecret = google.config.clientSecret;
        callbackURL = google.config.callbackUrl || GOOGLE_CALLBACK_URL;
        if (clientID && clientSecret) {
          console.log("[Auth] Registering Google OAuth strategy (async settings)...");
          setupStrategy(clientID, clientSecret, callbackURL);
          return;
        }
      }
      console.log("[Auth] Google provider not enabled or missing credentials (async settings). Strategy not registered.");
      return;
    }
  } catch (e) {
    console.error("[Auth] Error loading Google provider settings:", e);
  }

  // Fallback to env vars
  if (!clientID || !clientSecret) {
    console.log("[Auth] Google OAuth credentials not available. Strategy not registered.");
    return;
  }

  console.log("[Auth] Registering Google OAuth strategy (env vars)...");
  setupStrategy(clientID, clientSecret, callbackURL);
}

function setupStrategy(clientID: string, clientSecret: string, callbackURL: string) {
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        passReqToCallback: true,
      },
      async (_req: any, accessToken: string, _refreshToken: string, profile: GoogleProfile, done: (err: any, user?: any) => void) => {
        try {
          const email = profile.emails?.[0]?.value || "";
          const name = profile.displayName || profile.name?.givenName || "Google User";
          done(null, { email, name, provider: "google", profile });
        } catch (e) {
          done(e);
        }
      }
    )
  );
  console.log("[Auth] Google OAuth strategy registered with Passport.");
}

export { passport };
