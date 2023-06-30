const express = require('express');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
let port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
  })
);

// Database connection
const db = new sqlite3.Database('./db/database.db');

// GET ROUTES

// Default to login
app.get('/', (req, res) => {
  // Render login page
  res.sendFile(__dirname + '/views/login.html');
});

// Register Route
app.get('/register', (req, res) => {
  res.send(`
    <h1>Registration</h1>
    <form action="/register" method="POST">
      <input type="text" name="username" placeholder="Username" required><br>
      <input type="password" name="password" placeholder="Password" required><br>
      <button type="submit">Register</button>
    </form>
  `);
});

// Route to the Landing Page when logged in.
app.get('/landingPage', (req, res) => {
  res.sendFile(path.join(__dirname+'/views/landingPage.html'));
});


// POST ROUTES

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Retrieve the user from the database
  db.get('SELECT * FROM users WHERE username = ?', username, (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Internal Server Error');
    }

    if (!row) {
      return res.status(401).send('Invalid credentials');
    }

    // Check if the provided password matches the stored password
    if (row.password !== password) {
      return res.status(401).send('Invalid credentials');
    }

    return res.status(200).redirect('/landingPage');

  });
});

// Register user route
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Insert the user record into the database
  db.run(`INSERT INTO users (username, password, type) VALUES (?, ?, 'user')`, [username, password], function (err) {
    if (err) {
      console.error(err);
      res.send('Error - cannot register user.');
    } else {
      res.send('User registered!');
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

