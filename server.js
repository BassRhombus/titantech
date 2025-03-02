const express = require('express');
const path = require('path');
const app = express();
const PORT = 3003;

// Serve static files from root directory
app.use(express.static(__dirname));

// Special route for mod-manager.html that serves the ModINI content
app.get('/mod-manager.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'ModINI/public/index.html'));
});

// Make ModINI assets available
app.use('/mod-manager', express.static(path.join(__dirname, 'ModINI/public')));

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