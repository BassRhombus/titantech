const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = 3003;
const http = require('http');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Setup local JSON storage
const dataDir = path.join(__dirname, 'data');
const commissionsFile = path.join(dataDir, 'commissions.json');
const showcaseFile = path.join(dataDir, 'showcase.json');

// Set up multer storage for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads', 'showcase');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `showcase_${uniqueId}${ext}`);
  }
});

// Create upload middleware with file size and type restrictions
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit initially so we can handle resizing on server if needed
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created data directory at ${dataDir}`);
}

// Initialize storage
let commissions = [];
let showcaseItems = [];

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

// Load existing showcase items from JSON file
function loadShowcaseItems() {
  try {
    if (fs.existsSync(showcaseFile)) {
      const data = fs.readFileSync(showcaseFile, 'utf8');
      showcaseItems = JSON.parse(data);
      console.log(`Loaded ${showcaseItems.length} showcase items from ${showcaseFile}`);
    } else {
      console.log(`No showcase file found at ${showcaseFile}, starting with empty array`);
      saveShowcaseItems(); // Create the initial empty file
    }
  } catch (err) {
    console.error(`Error loading showcase items from ${showcaseFile}:`, err);
    showcaseItems = []; // Start with empty array in case of error
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

// Save showcase items to JSON file
function saveShowcaseItems() {
  try {
    fs.writeFileSync(showcaseFile, JSON.stringify(showcaseItems, null, 2), 'utf8');
    console.log(`Saved ${showcaseItems.length} showcase items to ${showcaseFile}`);
    return true;
  } catch (err) {
    console.error(`Error saving showcase items to ${showcaseFile}:`, err);
    return false;
  }
}

// Generate a unique ID for commissions
function generateId() {
  return 'commission_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Load commissions and showcase items at startup
loadCommissions();
loadShowcaseItems();

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
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.json({ limit: '20mb' }));

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
    // Use different API host depending on environment
    let API_HOSTNAME;
    if (process.env.NODE_ENV === 'production') {
      API_HOSTNAME = '93a6e810-83b8-48c5-8486-6bd7051b906b';
    } else {
      API_HOSTNAME = '104.243.37.159';
    }
    const API_PORT = 25056;
    const API_PATH = '/api/mods';
    const JSON_FILE_PATH = path.join(__dirname, 'ModINI', 'public', 'mods_details.json');
    
    console.log(`[${new Date().toISOString()}] Fetching mods data from API host: ${API_HOSTNAME}`);
    
    // First read existing file to preserve creator info
    let existingMods = [];
    try {
      if (fs.existsSync(JSON_FILE_PATH)) {
        const existingData = fs.readFileSync(JSON_FILE_PATH, 'utf8');
        existingMods = JSON.parse(existingData);
        console.log(`Read ${existingMods.length} existing mods for creator preservation`);
      }
    } catch (error) {
      console.warn(`Warning: Could not read existing mods file: ${error.message}`);
      // Continue anyway as we'll get fresh data from API
    }

    // Create a map of existing mods by SKU for quick lookup
    const existingModMap = {};
    existingMods.forEach(mod => {
      if (mod.sku) {
        existingModMap[mod.sku] = mod;
      }
    });

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
            const apiResponse = JSON.parse(data);
            // Support both array and object-with-mods formats
            const modsData = Array.isArray(apiResponse) ? apiResponse : apiResponse.mods;
            if (!Array.isArray(modsData)) {
              throw new Error('API response does not contain a mods array');
            }
            console.log('First mod object from API:', JSON.stringify(modsData[0], null, 2));
            // Transform API data to our format using correct API field names
            const transformedMods = modsData.map(apiMod => ({
              sku: apiMod.sku,
              name: apiMod.name,
              description: apiMod.description || '',
              icon: apiMod.icon || '',
              creator: apiMod.creator || 'Unknown Creator'
            }));
            // Deduplicate by SKU (in case API has duplicates)
            const uniqueModsMap = new Map();
            transformedMods.forEach(mod => {
              if (mod.sku) {
                uniqueModsMap.set(mod.sku, mod);
              }
            });
            // Convert back to array and sort alphabetically
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
      tosAgreement: req.body.tosAgreement === true,
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
    console.log(`Current commissions: ${commissions.length} total`);
    
    // Debug: List all commission IDs to check if the requested one exists
    const commissionIds = commissions.map(c => c.id);
    console.log(`Available commission IDs: ${JSON.stringify(commissionIds)}`);
    
    // Validate status
    const validStatuses = ['pending', 'in-progress', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }
    
    // Find the commission by id - handle both direct match and MongoDB ObjectId string formats
    let index = commissions.findIndex(c => c.id === id);
    
    // If not found, try matching just the timestamp part of the ID (for backward compatibility)
    if (index === -1 && id.includes('_')) {
      const idParts = id.split('_');
      if (idParts.length >= 2) {
        const timestampPart = idParts[1];
        index = commissions.findIndex(c => 
          c.id && c.id.includes(timestampPart)
        );
        console.log(`Tried matching by timestamp part: ${timestampPart}, found at index: ${index}`);
      }
    }
    
    console.log(`Looking for commission with ID: ${id}, found at index: ${index}`);
    
    if (index === -1) {
      // Try to reload commissions from disk in case they were updated elsewhere
      try {
        loadCommissions();
        
        // Try direct match again after reload
        index = commissions.findIndex(c => c.id === id);
        
        // If still not found, try the timestamp part matching again
        if (index === -1 && id.includes('_')) {
          const idParts = id.split('_');
          if (idParts.length >= 2) {
            const timestampPart = idParts[1];
            index = commissions.findIndex(c => 
              c.id && c.id.includes(timestampPart)
            );
            console.log(`After reload, tried matching by timestamp part: ${timestampPart}, found at index: ${index}`);
          }
        }
        
        if (index === -1) {
          return res.status(404).json({
            success: false,
            message: 'Commission request not found'
          });
        } else {
          console.log(`Found commission after reload at index: ${index}`);
          // Continue with the found index
          commissions[index].status = status;
          
          if (saveCommissions()) {
            return res.json({
              success: true,
              message: 'Commission status updated after reload',
              commission: commissions[index]
            });
          } else {
            throw new Error('Failed to save updated commission to disk after reload');
          }
        }
      } catch (reloadError) {
        console.error('Error reloading commissions:', reloadError);
        return res.status(404).json({
          success: false,
          message: 'Commission request not found and reload failed'
        });
      }
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

// Add an endpoint to upload showcase items
app.post('/api/showcase', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const newShowcaseItem = {
      id: uuidv4(),
      title: req.body.title,
      description: req.body.description,
      imagePath: req.file.path,
      uploadedAt: new Date()
    };

    showcaseItems.push(newShowcaseItem);

    if (saveShowcaseItems()) {
      res.json({
        success: true,
        message: 'Showcase item uploaded successfully',
        item: newShowcaseItem
      });
    } else {
      throw new Error('Failed to save showcase item to disk');
    }
  } catch (error) {
    console.error('Error uploading showcase item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload showcase item',
      error: error.message
    });
  }
});

// Showcase API endpoints

// Public endpoint to get approved showcase items
app.get('/api/showcase', (req, res) => {
  try {
    // Only return approved items for public view
    const approvedItems = showcaseItems.filter(item => item.status === 'approved');
    res.json(approvedItems);
  } catch (error) {
    console.error('Error fetching showcase items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch showcase items',
      error: error.message
    });
  }
});

// Endpoint to submit a new showcase item
app.post('/api/showcase/submit', upload.single('imageFile'), (req, res) => {
  try {
    // Validate required fields
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    if (!req.body.imageTitle || !req.body.authorName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create a new showcase item
    const timestamp = new Date();
    const newShowcaseItem = {
      id: uuidv4(),
      imageTitle: req.body.imageTitle,
      imageDescription: req.body.imageDescription || '',
      imagePath: '/uploads/showcase/' + req.file.filename, // Store path relative to public directory
      authorName: req.body.authorName,
      submittedAt: timestamp,
      status: 'pending', // All submissions start with pending status
      likes: 0
    };
    
    // Add to showcase items array
    showcaseItems.push(newShowcaseItem);
    
    // Save to JSON file
    if (saveShowcaseItems()) {
      res.json({
        success: true,
        message: 'Your submission has been received and is pending approval by our team.'
      });
    } else {
      throw new Error('Failed to save showcase item to disk');
    }
  } catch (error) {
    console.error('Error submitting showcase item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process showcase submission',
      error: error.message
    });
  }
});

// Admin endpoint to get all showcase items (for management)
app.get('/api/admin/showcase', isAuthenticated, isAdmin, (req, res) => {
  try {
    res.json(showcaseItems);
  } catch (error) {
    console.error('Error fetching showcase items for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch showcase items',
      error: error.message
    });
  }
});

// Admin endpoint to update showcase item status
app.put('/api/admin/showcase/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }
    
    // Find the item by id
    const index = showcaseItems.findIndex(item => item.id === id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Showcase item not found'
      });
    }
    
    // Update the status
    showcaseItems[index].status = status;
    
    // Add reason if provided (for rejections)
    if (reason) {
      showcaseItems[index].rejectionReason = reason;
    }
    
    // Add timestamp for the status change
    if (status === 'approved') {
      showcaseItems[index].approvedAt = new Date();
    } else if (status === 'rejected') {
      showcaseItems[index].rejectedAt = new Date();
    }
    
    // Save to JSON file
    if (saveShowcaseItems()) {
      return res.json({
        success: true,
        message: 'Showcase item status updated',
        item: showcaseItems[index]
      });
    } else {
      throw new Error('Failed to save updated showcase item to disk');
    }
  } catch (error) {
    console.error('Error updating showcase item status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update showcase item status',
      error: error.message
    });
  }
});

// Admin endpoint to delete a showcase item
app.delete('/api/admin/showcase/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the item by id
    const index = showcaseItems.findIndex(item => item.id === id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Showcase item not found'
      });
    }
    
    // Get the image path for deletion
    const imagePath = showcaseItems[index].imagePath;
    
    // Remove from array
    showcaseItems.splice(index, 1);
    
    // Save to JSON file
    if (saveShowcaseItems()) {
      // Try to delete the image file (but don't fail if we can't)
      if (imagePath) {
        const fullImagePath = path.join(__dirname, imagePath);
        if (fs.existsSync(fullImagePath)) {
          try {
            fs.unlinkSync(fullImagePath);
            console.log(`Deleted showcase image file: ${fullImagePath}`);
          } catch (err) {
            console.error(`Warning: Could not delete showcase image file ${fullImagePath}:`, err);
          }
        }
      }
      
      return res.json({
        success: true,
        message: 'Showcase item deleted successfully'
      });
    } else {
      throw new Error('Failed to save showcase items to disk after deletion');
    }
  } catch (error) {
    console.error('Error deleting showcase item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete showcase item',
      error: error.message
    });
  }
});

// Admin route for showcase management page
app.get('/admin-showcase.html', isAuthenticated, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-showcase.html'));
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