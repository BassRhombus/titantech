const express = require('express');
const path = require('path');
const app = express();
const PORT = 3003;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Serve the main HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/mod-manager.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'mod-manager.html'));
});

app.get('/community.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'community.html'));
});

app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/bots.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'bots.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`DinoMod Hub server running at http://localhost:${PORT}/`);
  console.log(`Press Ctrl+C to stop the server`);
});