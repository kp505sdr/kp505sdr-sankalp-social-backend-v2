



const passport = require('passport');
const User = require('../models/userModel');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
       //  --------------------volinteer id------------------------------
  const userlength = await User.countDocuments(); // Get the current user count
  const genratedvolunteerId = 202500 + userlength; // Generate volunteer ID

  
  // Check if the generated volunteer ID already exists
  const existingUser = await User.findOne({ volunteerId: genratedvolunteerId });
  
  if (existingUser) {
    
      const newUserLength = userlength + 1; // Increment user length for new ID
      genratedvolunteerId = 202500 + newUserLength; // Create a new volunteer ID
  }
  // --------------------------------------------------------
      try {
        // Check if user exists
        let user = await User.findOne({ email: profile.emails[0].value });
      
        if (!user) {
          // Create new user
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            picture: profile.photos[0].value,
            volunteerId:genratedvolunteerId
            
            
          });
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id); // store user id in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
