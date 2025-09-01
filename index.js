

// require('dotenv').config();
// const express = require('express');
// const connectDB = require('./config/db');
// const cors = require("cors");
// const session = require("express-session");
// const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const cookieParser = require("cookie-parser");
// require('./config/passport');
// const jwt = require("jsonwebtoken");

// const app = express();
// const PORT = process.env.PORT || 8080;

// // Connect DB
// connectDB();

// // CORS setup

// app.use(cors({
//   origin: process.env.CLIENT_URL || "http://localhost:3000",
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));

// app.use(express.json());
// app.use(cookieParser());

// // -------------------------------------google login---------------------------------------------------
// // Session middleware
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false
// }));

// // Passport initialization
// app.use(passport.initialize());
// app.use(passport.session());

// // Google auth route
// app.get('/auth/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// );



// app.get('/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: '/auth/failure' }),
//   (req, res) => {
//     // Generate JWT token
//     const token = jwt.sign(
//       { id: req.user._id, email: req.user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );
  
//     // Redirect with token & user info
//     res.redirect(
//       `${process.env.CLIENT_URL}/login-success?token=${token}&name=${encodeURIComponent(req.user.name)}&isAdmin=${encodeURIComponent(req.user.isAdmin)}&email=${encodeURIComponent(req.user.email)}&picture=${encodeURIComponent(req.user.picture)}`
//     );
//   }
// );


// // Failure route
// app.get('/auth/failure', (req, res) => {
//   res.send('Failed to authenticate with Google.');
// });



// // -------------------------------------------google end---------------------------------------------------






// // Your existing routes
// const userRoutes = require('./routes/userRoutes');
// const productRoutes = require('./routes/productRoutes');
// const paymentRoutes = require('./routes/paymentRoutes');
// app.use('/api/v1', userRoutes);
// app.use('/api/v1', productRoutes);
// app.use('/api/v1', paymentRoutes);

// // Start server
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

// Load Passport config
require("./config/passport");

const app = express();
const PORT = process.env.PORT || 8080;

// ---------------- DB Connection ----------------
connectDB();

// ---------------- CORS Setup ----------------
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());
app.use(cookieParser());

// ---------------- Session Middleware ----------------
// Make sure SESSION_SECRET is set in .env
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret", 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" }, // secure cookies only in prod
  })
);

// ---------------- Passport Init ----------------
app.use(passport.initialize());
app.use(passport.session());

// ---------------- Google OAuth Routes ----------------
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/auth/failure" }),
  (req, res) => {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL}/login-failure`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      process.env.JWT_SECRET || "jwt_secret",
      { expiresIn: "7d" }
    );

    // Redirect with token & user info
    res.redirect(
      `${process.env.CLIENT_URL}/login-success?token=${token}` +
      `&name=${encodeURIComponent(req.user.name || "")}` +
      `&isAdmin=${encodeURIComponent(req.user.isAdmin || false)}` +
      `&email=${encodeURIComponent(req.user.email || "")}` +
      `&picture=${encodeURIComponent(req.user.picture || "")}`
    );
  }
);

// Failure route
app.get("/auth/failure", (req, res) => {
  res.status(401).send("Failed to authenticate with Google.");
});

// ---------------- API Routes ----------------
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use("/api/v1", userRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", paymentRoutes);

// ---------------- Start Server ----------------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
