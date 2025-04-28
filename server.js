const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = 3003;
const http = require('http');
const fs = require('fs');

// Setup local JSON storage
const dataDir = path.join(__dirname, 'data');
const commissionsFile = path.join(dataDir, 'commissions.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created data directory at ${dataDir}`);
}

// Initialize commissions storage
let commissions = [];

// Load existing commissions from JSON file
function loadCommissions() {
  try {
    if (fs.existsSync(commissionsFile)) {
      const data = fs.readFileSync(commissionsFile, 'utf8');
      commissions = JSON.parse(data);
      console.log(`Loaded ${commissions.length} commissions from ${commissionsFile}`);
    } else {
      console.log(`No commissions file found at ${commissionsFile}, starting with empty array`);
      saveCommissions(); // Create the initial empty file
    }
  } catch (err) {
    console.error(`Error loading commissions from ${commissionsFile}:`, err);
    commissions = []; // Start with empty array in case of error
  }
}

// Save commissions to JSON file
function saveCommissions() {
  try {
    fs.writeFileSync(commissionsFile, JSON.stringify(commissions, null, 2), 'utf8');
    console.log(`Saved ${commissions.length} commissions to ${commissionsFile}`);
    return true;
  } catch (err) {
    console.error(`Error saving commissions to ${commissionsFile}:`, err);
    return false;
  }
}

// Generate a unique ID for commissions
function generateId() {
  return 'commission_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Load commissions at startup
loadCommissions();

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
    
    // Create a new commission
    const timestamp = new Date();
    const newCommission = {
      id: generateId(),
      discordUsername: req.body.discordUsername,
      email: req.body.email || '',
      botType: req.body.botType,
      botDescription: req.body.botDescription,
      budget: req.body.budget ? Number(req.body.budget) : undefined,
      timeframe: req.body.timeframe,
      submittedAt: timestamp,
      status: 'pending'
    };
    
    // Add to commissions array
    commissions.push(newCommission);
    
    // Save to JSON file
    if (saveCommissions()) {
      res.json({
        success: true,
        message: 'Commission request received successfully'
      });
    } else {
      throw new Error('Failed to save commission to disk');
    }
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
    console.log(`Returning ${commissions.length} commissions from JSON file`);
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
    
    // Find the commission by id
    const index = commissions.findIndex(c => c.id === id);
    console.log(`Looking for commission with ID: ${id}, found at index: ${index}`);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Commission request not found'
      });
    }
    
    // Update the status
    commissions[index].status = status;
    
    // Save to JSON file
    if (saveCommissions()) {
      return res.json({
        success: true,
        message: 'Commission status updated',
        commission: commissions[index]
      });
    } else {
      throw new Error('Failed to save updated commission to disk');
    }
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