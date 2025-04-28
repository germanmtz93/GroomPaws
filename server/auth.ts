import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, loginSchema, insertUserSchema } from "@shared/schema";
import { v4 as uuidv4 } from "uuid";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || uuidv4(),
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  };
  
  // Guest user credentials
  const GUEST_USERNAME = "guest";
  const GUEST_PASSWORD = "guest123";

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const isPasswordValid = await comparePasswords(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid username or password" });
        }

        // Update last login time
        await storage.updateUserLastLogin(user.id);
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Auth Routes
  app.post("/api/register", async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(data.password);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Auto login after registration
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      // Validate login data
      loginSchema.parse(req.body);
      
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info?.message || "Invalid credentials" });
        }
        
        req.login(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }
          
          // Remove password from response
          const { password, ...userWithoutPassword } = user;
          return res.json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Guest login endpoint
  app.post("/api/guest-login", async (req, res) => {
    try {
      // Check if guest user exists
      let guestUser = await storage.getUserByUsername(GUEST_USERNAME);
      
      // Create guest user if it doesn't exist
      if (!guestUser) {
        const hashedPassword = await hashPassword(GUEST_PASSWORD);
        guestUser = await storage.createUser({
          username: GUEST_USERNAME,
          password: hashedPassword,
          email: "guest@example.com",
          fullName: "Guest User",
          salonName: "Demo Grooming Salon",
        });
      }
      
      // Log in as guest
      req.login(guestUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in as guest" });
        }
        
        // Remove password from response
        const { password, ...userWithoutPassword } = guestUser;
        return res.json(userWithoutPassword);
      });
    } catch (error) {
      res.status(500).json({ message: "Error logging in as guest" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user as User;
    res.json(userWithoutPassword);
  });

  // User profile update
  app.patch("/api/user/profile", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = (req.user as User).id;
      const userData = req.body;
      
      // Prevent password update through this endpoint
      if (userData.password) {
        delete userData.password;
      }
      
      storage.updateUserProfile(userId, userData)
        .then(user => {
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
          
          // Remove password from response
          const { password, ...userWithoutPassword } = user;
          res.json(userWithoutPassword);
        })
        .catch(error => {
          res.status(500).json({ message: "Error updating profile" });
        });
    } catch (error) {
      res.status(500).json({ message: "Error updating profile" });
    }
  });
}