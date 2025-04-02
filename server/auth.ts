import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as UserType } from "@shared/schema";

declare global {
  namespace Express {
    // Define the Express User interface with explicit properties instead of extending
    interface User {
      id: number;
      username: string;
      password: string;
      email: string;
      fullName: string;
      bio: string | null;
      profileImage: string | null;
      occupation: string | null;
      preferences: unknown;
      isBusinessAccount: boolean | null;
      createdAt: Date | null;
      isDeleted: boolean | null;
      deleteRequestedAt: Date | null;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || "default_secret_key_change_in_production";
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      // Check if the input is an email (contains @)
      const isEmail = username.includes('@');
      
      // Try to get user either by username or email
      const user = isEmail 
        ? await storage.getUserByEmail(username)
        : await storage.getUserByUsername(username);
      
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    const { username, password, fullName, email } = req.body;
    
    if (!username || !password || !fullName || !email) {
      return res.status(400).send("Missing required fields");
    }
    
    const existingUsername = await storage.getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).send("Username already exists");
    }
    
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).send("Email already exists");
    }

    try {
      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
        fullName,
        email,
        isBusinessAccount: req.body.isBusinessAccount || false,
        bio: req.body.bio || "",
        profileImage: req.body.profileImage || "",
      });

      req.login(user, (err) => {
        if (err) return next(err);
        
        // Create a safe user object without sensitive data
        const userWithoutPassword = { ...user } as any;
        delete userWithoutPassword.password;
        
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    if (req.user) {
      // Create a safe user object without sensitive data
      const userWithoutPassword = { ...req.user } as any;
      delete userWithoutPassword.password;
      
      res.status(200).json(userWithoutPassword);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user) {
      // Create a safe user object without sensitive data
      const userWithoutPassword = { ...req.user } as any;
      delete userWithoutPassword.password;
      
      res.json(userWithoutPassword);
    } else {
      res.sendStatus(401);
    }
  });
}
