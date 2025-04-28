const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = 3003;
const http = require('http');
const fs = require('fs');
const mongoose = require('mongoose');

// MongoDB connection string with authentication
// URL encode the username and password to handle special characters
const username = encodeURIComponent('user-admin');
const password = encodeURIComponent('hmr7knd0xhp0TKC_ugy');
const DB_URI = `mongodb://${username}:${password}@104.243.37.159:25060/titantech?authSource=admin`;

console.log('Attempting to connect to MongoDB...');

// Connect to MongoDB with more options
mongoose.connect(DB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30s for initial connection
  connectTimeoutMS: 30000, // Longer timeout for initial connection
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  retryWrites: true,
  heartbeatFrequencyMS: 10000, // Send ping every 10 seconds to check connection
})
.then(() => console.log('Connected to MongoDB successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  // Log more details if available
  if (err.code) {
    console.error('Error code:', err.code);
  }
  if (err.codeName) {
    console.error('Error codeName:', err.codeName);
  }
  console.error('Error reason:', err.reason ? JSON.stringify(err.reason) : 'Unknown');
  
  // Try alternative connection string format as a fallback
  console.log('Trying alternative MongoDB connection format...');
  mongoose.connect(`mongodb://user-admin:hmr7knd0xhp0TKC_ugy@104.243.37.159:25060/titantech?authSource=admin`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    retryWrites: true
  })
  .then(() => console.log('Connected to MongoDB successfully with alternative format'))
  .catch(altErr => {
    console.error('Alternative MongoDB connection also failed:', altErr);
    console.log('Will proceed without database connection - commission requests will be saved locally');
  });
});

// Create a function to handle mongoose reconnection
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected! Attempting to reconnect...');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB reconnected!');
  
  // When reconnected, check if there are offline commissions to sync
  syncOfflineCommissions().catch(err => {
    console.error('Error syncing offline commissions:', err);
  });
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Setup fallback for when database is not available
const offlineCommissions = [];
const offlineCommissionsFile = path.join(__dirname, 'commission_backup.json');

// Load any existing offline commissions from backup file on startup
try {
  if (fs.existsSync(offlineCommissionsFile)) {
    const savedCommissions = JSON.parse(fs.readFileSync(offlineCommissionsFile, 'utf8'));
    if (Array.isArray(savedCommissions)) {
      offlineCommissions.push(...savedCommissions);
      console.log(`Loaded ${savedCommissions.length} offline commissions from backup file`);
    }
  }
} catch (err) {
  console.error('Error loading offline commissions:', err);
}

const isDbConnected = () => mongoose.connection.readyState === 1;

// Generate a unique ID for offline commissions
function generateOfflineId() {
  return 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Function to sync offline commissions to MongoDB when connection is available
async function syncOfflineCommissions() {
  if (!isDbConnected() || offlineCommissions.length === 0) return;
  
  console.log(`Attempting to sync ${offlineCommissions.length} offline commissions to MongoDB...`);
  
  const syncedCommissions = [];
  
  for (const commission of offlineCommissions) {
    try {
      // Skip commissions that don't have required fields
      if (!commission.discordUsername || !commission.botType || !commission.botDescription) {
        console.warn('Skipping invalid commission:', commission);
        continue;
      }
      
      // Create a new commission document
      const newCommission = new CommissionRequest({
        discordUsername: commission.discordUsername,
        email: commission.email || '',
        botType: commission.botType,
        botDescription: commission.botDescription,
        budget: commission.budget,
        timeframe: commission.timeframe,
        submittedAt: commission.submittedAt || new Date(),
        status: commission.status || 'pending'
      });
      
      // Save to MongoDB
      await newCommission.save();
      syncedCommissions.push(commission);
      console.log(`Synced commission from ${commission.discordUsername} to MongoDB`);
    } catch (err) {
      console.error(`Failed to sync commission ${commission.id || 'unknown'}:`, err);
    }
  }
  
  // Remove synced commissions from offline storage
  if (syncedCommissions.length > 0) {
    for (const synced of syncedCommissions) {
      const index = offlineCommissions.findIndex(c => c.id === synced.id);
      if (index !== -1) {
        offlineCommissions.splice(index, 1);
      }
    }
    
    // Update the backup file
    try {
      fs.writeFileSync(
        offlineCommissionsFile,
        JSON.stringify(offlineCommissions, null, 2),
        'utf8'
      );
      console.log(`Updated offline commissions file after syncing ${syncedCommissions.length} commissions`);
    } catch (err) {
      console.error('Error updating offline commissions file:', err);
    }
  }
}

// Try to sync on startup after a delay to allow connection to establish
setTimeout(() => {
  syncOfflineCommissions().catch(err => {
    console.error('Error in initial sync of offline commissions:', err);
  });
}, 30000);

// Define Commission Request Schema
const commissionSchema = new mongoose.Schema({
  discordUsername: { type: String, required: true },
  email: String,
  botType: { type: String, required: true },
  botDescription: { type: String, required: true },
  budget: Number,
  timeframe: String,
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
});

// Create model
const CommissionRequest = mongoose.model('CommissionRequest', commissionSchema);

// Simple in-memory user store (replace with database in production)
const users = [
  { id: '1', username: 'admin', password: 'admin123', admin: true },
  { id: '2', username: 'user', password: 'user123', admin: false }
];

// Trust proxy for secure cookies in production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Configure session middleware
app.use(session({
  secret: 'titantech_secret_key',
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 604800000, // 7 days
    sameSite: 'lax'
  }
}));

// Add body parser middleware for form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Add API request logging middleware
app.use('/api/*', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body));
  }
  
  // Save original response methods
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Override send
  res.send = function(body) {
    console.log(`[${new Date().toISOString()}] Response to ${req.method} ${req.originalUrl}:`, 
      body.length > 500 ? body.substring(0, 500) + '...' : body);
    return originalSend.call(this, body);
  };
  
  // Override json
  res.json = function(body) {
    console.log(`[${new Date().toISOString()}] JSON response to ${req.method} ${req.originalUrl}:`, 
      JSON.stringify(body).length > 500 ? JSON.stringify(body).substring(0, 500) + '...' : JSON.stringify(body));
    return originalJson.call(this, body);
  };
  
  next();
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login.html');
}

// Middleware to check if user is admin
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.admin) {
    return next();
  }
  res.status(403).send('Access denied');
}

// Basic login route - handle both /login and login paths
app.post(['/login', 'login'], (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Store user in session (exclude password)
    req.session.user = {
      id: user.id,
      username: user.username,
      admin: user.admin
    };
    res.redirect('dashboard.html');
  } else {
    res.redirect('login.html?error=1');
  }
});

// Logout route - handle both /logout and logout paths
app.get(['/logout', 'logout'], (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// API routes
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json({
      loggedIn: true,
      user: req.session.user
    });
  } else {
    res.json({
      loggedIn: false
    });
  }
});

// Add a new endpoint to refresh mods data from API
app.get('/api/refresh-mods', async (req, res) => {
  try {
    const updateResult = await fetchModsFromAPI();
    res.json({ success: true, message: `Refreshed mods data. Found ${updateResult.count} mods.` });
  } catch (error) {
    console.error('Error refreshing mods data:', error);
    res.status(500).json({ success: false, message: 'Failed to refresh mods data', error: error.message });
  }
});

// Function to fetch mods from API and save them
async function fetchModsFromAPI() {
  return new Promise((resolve, reject) => {
    const API_HOSTNAME = '104.194.10.211';
    const API_PORT = 3000;
    const API_PATH = '/potnotifier/mods';
    const JSON_FILE_PATH = path.join(__dirname, 'ModINI', 'public', 'mods_details.json');
    
    console.log(`[${new Date().toISOString()}] Fetching mods data from API...`);
    
    const req = http.request({
      hostname: API_HOSTNAME,
      port: API_PORT,
      path: API_PATH,
      method: 'GET',
      timeout: 30000 // 30 seconds
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 && data.length > 0) {
          try {
            const modsData = JSON.parse(data);
            console.log(`Successfully fetched ${modsData.length} mods from API`);
            
            // Transform the data
            const transformedMods = modsData.map(mod => ({
              sku: mod.Mod_sku,
              name: mod.Mod_name,
              description: mod.Mod_description,
              icon: mod.Mod_image_link
            }));
            
            // Deduplicate by SKU
            const uniqueModsMap = new Map();
            transformedMods.forEach(mod => {
              if (!uniqueModsMap.has(mod.sku)) {
                uniqueModsMap.set(mod.sku, mod);
              }
            });
            
            // Sort alphabetically by name
            const sortedMods = Array.from(uniqueModsMap.values());
            sortedMods.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
            
            // Make sure directory exists
            const dirPath = path.dirname(JSON_FILE_PATH);
            if (!fs.existsSync(dirPath)) {
              fs.mkdirSync(dirPath, { recursive: true });
            }
            
            // Write the file
            fs.writeFile(JSON_FILE_PATH, JSON.stringify(sortedMods, null, 2), 'utf8', (err) => {
              if (err) {
                console.error(`Error writing mods data: ${err.message}`);
                reject(err);
                return;
              }
              
              console.log(`Updated mods data file with ${sortedMods.length} mods`);
              resolve({ count: sortedMods.length });
            });
            
          } catch (error) {
            console.error(`Error processing API response: ${error.message}`);
            reject(error);
          }
        } else {
          console.error(`API returned status code: ${res.statusCode}`);
          reject(new Error(`API request failed with status code: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`API request error: ${error.message}`);
      reject(error);
    });
    
    req.on('timeout', () => {
      console.error(`API request timed out`);
      req.destroy();
      reject(new Error('Request timed out'));
    });
    
    req.end();
  });
}

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

// Server management API endpoints
app.get('/api/admin/servers', isAuthenticated, isAdmin, (req, res) => {
  // In a real app, fetch from database
  const mockServers = [
    {
      id: 1,
      name: "Jurassic Journey",
      owner: "DinoMaster",
      ownerID: "1",
      submitted: "2023-05-15",
      status: "active"
    },
    {
      id: 2,
      name: "Dino Haven",
      owner: "RexLover",
      ownerID: "2",
      submitted: "2023-06-20",
      status: "pending"
    },
    {
      id: 3,
      name: "Prehistoric Paradise",
      owner: "DinoQueen",
      ownerID: "3",
      submitted: "2023-07-05",
      status: "reported"
    }
  ];
  
  res.json(mockServers);
});

// Commission form endpoint
app.post('/api/commission', async (req, res) => {
  try {
    // Log the commission request data
    console.log('New commission request received:');
    console.log(req.body);
    
    if (!isDbConnected()) {
      // Store in memory if database is not connected
      console.log('Database not connected. Storing commission in memory.');
      const timestamp = new Date();
      const newOfflineCommission = {
        id: generateOfflineId(),
        discordUsername: req.body.discordUsername,
        email: req.body.email || '',
        botType: req.body.botType,
        botDescription: req.body.botDescription,
        budget: req.body.budget ? Number(req.body.budget) : undefined,
        timeframe: req.body.timeframe,
        submittedAt: timestamp,
        status: 'pending'
      };
      
      offlineCommissions.push(newOfflineCommission);
      
      // Write to a local backup file as well
      fs.writeFileSync(
        offlineCommissionsFile, 
        JSON.stringify(offlineCommissions, null, 2), 
        'utf8'
      );
      
      res.json({
        success: true,
        message: 'Commission request received successfully (offline mode)'
      });
      return;
    }
    
    // Create a new commission request document
    const newCommission = new CommissionRequest({
      discordUsername: req.body.discordUsername,
      email: req.body.email || '',
      botType: req.body.botType,
      botDescription: req.body.botDescription,
      budget: req.body.budget ? Number(req.body.budget) : undefined,
      timeframe: req.body.timeframe
    });
    
    // Save to database
    await newCommission.save();
    
    res.json({
      success: true,
      message: 'Commission request received successfully'
    });
  } catch (error) {
    console.error('Error saving commission request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process commission request',
      error: error.message
    });
  }
});

// Add an admin endpoint to view commission requests
app.get('/api/admin/commissions', isAuthenticated, isAdmin, async (req, res) => {
  try {
    if (!isDbConnected()) {
      // Return in-memory commissions if DB is not available
      console.log(`Returning ${offlineCommissions.length} offline commissions`);
      return res.json(offlineCommissions);
    }
    
    const commissions = await CommissionRequest.find().sort({ submittedAt: -1 });
    console.log(`Returning ${commissions.length} commissions from database`);
    res.json(commissions);
  } catch (error) {
    console.error('Error fetching commission requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch commission requests',
      error: error.message
    });
  }
});

// Add an endpoint to update commission status
app.put('/api/admin/commissions/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`Attempting to update commission ${id} to status: ${status}`);
    
    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }
    
    if (!isDbConnected()) {
      // Handle updates for in-memory commissions
      const index = offlineCommissions.findIndex(c => c.id === id);
      console.log(`Looking for offline commission with ID: ${id}, found at index: ${index}`);
      
      if (index === -1) {
        return res.status(404).json({
          success: false,
          message: 'Commission request not found'
        });
      }
      
      offlineCommissions[index].status = status;
      
      // Update the backup file
      fs.writeFileSync(
        offlineCommissionsFile, 
        JSON.stringify(offlineCommissions, null, 2), 
        'utf8'
      );
      
      return res.json({
        success: true,
        message: 'Commission status updated (offline mode)',
        commission: offlineCommissions[index]
      });
    }
    
    // Update commission status in DB
    const commission = await CommissionRequest.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true }
    );
    
    if (!commission) {
      return res.status(404).json({
        success: false,
        message: 'Commission request not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Commission status updated',
      commission
    });
  } catch (error) {
    console.error('Error updating commission status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update commission status',
      error: error.message
    });
  }
});

// Set up automatic refresh of mods data every 5 minutes
setInterval(async () => {
  try {
    console.log("Automatic refresh of mods data triggered");
    await fetchModsFromAPI();
  } catch (error) {
    console.error('Error during automatic mods refresh:', error);
  }
}, 5 * 60 * 1000); // 5 minutes

// Initial fetch on server start
fetchModsFromAPI().catch(error => {
  console.error('Error during initial mods fetch:', error);
});

// Serve static files
app.use(express.static(__dirname));

// Special route for mod-manager.html
app.get('/mod-manager.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'ModINI/public/index.html'));
});

app.use('/mod-manager', express.static(path.join(__dirname, 'ModINI/public')));

// Login page route
app.get('/login.html', (req, res) => {
  // If already logged in, redirect to dashboard
  if (req.session.user) {
    return res.redirect('/dashboard.html');
  }
  // Otherwise serve the login page
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Protected routes
app.get('/dashboard.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/admin.html', isAuthenticated, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Admin commissions page route
app.get('/admin-commissions.html', isAuthenticated, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-commissions.html'));
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

// Revert to original app.listen
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});