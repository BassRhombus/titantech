const express = require('express');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const app = express();
const PORT = 3003;

// Discord OAuth2 credentials - replace with your own
const DISCORD_CLIENT_ID = '1346303613819027496';
const DISCORD_CLIENT_SECRET = 'ilNi2fsknANLfjLf-bMdW9qoTJEMIvXk';
const CALLBACK_URL = 'http://localhost:3003/auth/discord/callback';

// List of Discord user IDs with admin privileges
const ADMIN_USER_IDS = [
  '350689943326031872', // Replace with your Discord user ID
  // You can add more admin IDs here
];

// Configure session middleware
app.use(session({
  secret: 'titantech_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 604800000 // 7 days
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Discord Strategy
passport.use(new DiscordStrategy({
  clientID: DISCORD_CLIENT_ID,
  clientSecret: DISCORD_CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
  scope: ['identify', 'email', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
  // Check if user ID is in the admin list
  profile.admin = ADMIN_USER_IDS.includes(profile.id);
  console.log(`User ${profile.username} logged in. Admin: ${profile.admin}`);
  return done(null, profile);
}));

// Serialize/deserialize user
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login.html');
}

// Middleware to check if user is admin
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.admin) {
    return next();
  }
  res.status(403).send('Access denied');
}

// Auth routes
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', 
  passport.authenticate('discord', { 
    failureRedirect: '/login.html' 
  }), 
  (req, res) => {
    console.log('User ID:', req.user.id);
    res.redirect('/dashboard.html');
  }
);

app.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// API routes
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      loggedIn: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        discriminator: req.user.discriminator,
        avatar: req.user.avatar,
        email: req.user.email,
        admin: req.user.admin || false
      }
    });
  } else {
    res.json({
      loggedIn: false
    });
  }
});

// Community server submission (placeholder)
app.post('/api/submit-server', express.json(), isAuthenticated, (req, res) => {
  // In a real app, store this in a database
  console.log('Server submission received:', req.body);
  res.json({ success: true, message: 'Server submitted for approval' });
});

// Admin endpoint to get pending submissions
app.get('/api/admin/pending-servers', isAuthenticated, isAdmin, (req, res) => {
  // In a real app, fetch these from database
  const mockPendingServers = [];
  res.json(mockPendingServers);
});

// Serve static files
app.use(express.static(__dirname));

// Special route for mod-manager.html
app.get('/mod-manager.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'ModINI/public/index.html'));
});

app.use('/mod-manager', express.static(path.join(__dirname, 'ModINI/public')));

// Protected routes
app.get('/dashboard.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/admin.html', isAuthenticated, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all for other HTML pages
app.get('/:page.html', (req, res) => {
  // Skip mod-manager.html as it's handled above
  if (req.params.page !== 'mod-manager') {
    res.sendFile(path.join(__dirname, req.params.page + '.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});