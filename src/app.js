import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20"
import config from "./config/config.js"
import cors from "cors";
import session from "express-session";

const app = express();

app.use(cors({
  origin: config.FRONTEND_URL, // replace with frontend url
  credentials: true,
}));

// Set CSP headers
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    `
    default-src 'self';
    connect-src 'self' ${config.GOOGLE_URI} ${config.MUSIC_URL} ${config.AUTH_URL} ${config.FRONTEND_URL};
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    `.replace(/\s+/g, ' ')
  );
  next();
});

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Configure session middleware
app.use(session({
  secret: config.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'none'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Configure Passport to use Google OAuth 2.0 strategy
passport.use(new GoogleStrategy({
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
  callbackURL: `${config.AUTH_URL}/api/auth/google/callback`,
}, (accessToken, refreshToken, profile, done) => {
  // Here, you would typically find or create a user in your database
  // For this example, we'll just return the profile
  return done(null, profile);
}));

// Serialize user to session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get('/health', (req, res) => {
  return res.status(200).json({ service: "auth", status: "healthy" });
});

app.use("/api/auth", authRoutes);

export default app;