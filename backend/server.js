const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' })); // Adjust the origin if your frontend runs on a different port

// Set up MySQL connection
const db = mysql.createConnection({
  host: 'mysql.railway.internal',
  user: 'root',
  password: 'czUDHlJfqioKBtGQOfNqLhRqrIrfSyeh', // Update with your MySQL password
  database: 'railway', // Update with your database name
});

// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL');
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token.split(' ')[1], 'your_jwt_secret', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.userId = decoded.userId;
    req.userRole = decoded.role; // Attach user role to the request
    next();
  });
};

// 🟦 STEP 1: Update Login Route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result[0];

    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ token, role: user.role, message: 'Login successful' });
  });
});

// 🟦 STEP 2: Token Validation with Role
app.post('/validate-token', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token.split(' ')[1], 'your_jwt_secret', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    res.status(200).json({ message: 'Token is valid', role: decoded.role });
  });
});

// 🟦 STEP 3: Role-Based Protected Routes
// Fetch safety violations - accessible to admin and manager
app.get('/api/violations', verifyToken, (req, res) => {
  if (!['admin', 'manager'].includes(req.userRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const query = 'SELECT * FROM safety_violations ORDER BY timestamp DESC';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching violations:', err);
      return res.status(500).json({ message: 'Error fetching violations' });
    }
    res.status(200).json(results);
  });
});

// Worker registration - accessible only to admin
app.post('/api/workers/register', verifyToken, (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { name, employee_id, department, contact, assigned_area } = req.body;
  const query = 'INSERT INTO workers (name, employee_id, department, contact, assigned_area) VALUES (?, ?, ?, ?, ?)';

  db.query(query, [name, employee_id, department, contact, assigned_area], (err) => {
    if (err) {
      console.error('Error inserting worker:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(201).json({ message: 'Worker registered successfully' });
  });
});

// View all workers - accessible to admin and manager
app.get('/api/workers', verifyToken, (req, res) => {
  if (!['admin', 'manager'].includes(req.userRole)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  db.query('SELECT * FROM workers', (err, result) => {
    if (err) {
      console.error('Error fetching workers:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(result);
  });
});


// Fetch a worker by ID - accessible to admin and manager
app.get('/api/workers/:id', verifyToken, (req, res) => {
  if (!['admin', 'manager'].includes(req.userRole)) {
      return res.status(403).json({ message: 'Access denied' });
  }

  const workerId = req.params.id;
  const query = 'SELECT * FROM workers WHERE id = ?'; // Ensure correct column name

  db.query(query, [workerId], (err, result) => {
      if (err) {
          console.error('Error fetching worker details:', err);
          return res.status(500).json({ message: 'Database error' });
      }

      if (result.length === 0) {
          return res.status(404).json({ message: 'Worker not found' });
      }

      res.status(200).json(result[0]); // Return the worker object
  });
});
// DELETE a worker by ID - accessible to admin only
app.delete('/api/workers/:id', verifyToken, (req, res) => {
  if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
  }

  const workerId = req.params.id;
  const query = 'DELETE FROM workers WHERE id = ?'; // Ensure the correct column name

  db.query(query, [workerId], (err, result) => {
      if (err) {
          console.error('Error deleting worker:', err);
          return res.status(500).json({ message: 'Database error' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Worker not found' });
      }

      res.status(200).json({ message: 'Worker deleted successfully' });
  });
});
// PUT endpoint to update a worker's details
app.put('/api/workers/:id', verifyToken, (req, res) => {
  if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
  }

  const workerId = req.params.id;
  const { name, employee_id, department, contact, assigned_area } = req.body;

  const query = `
      UPDATE workers 
      SET name = ?, employee_id = ?, department = ?, contact = ?, assigned_area = ?
      WHERE id = ?`;

  db.query(query, [name, employee_id, department, contact, assigned_area, workerId], (err, result) => {
      if (err) {
          console.error('Error updating worker:', err);
          return res.status(500).json({ message: 'Database error' });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Worker not found' });
      }

      res.status(200).json({ message: 'Worker updated successfully' });
  });
});

// 🔵 User registration - for new workers/managers
app.post('/register', (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if the user already exists
  const checkQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkQuery, [email], (err, result) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (result.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Insert new user
    const insertQuery = 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)';
    db.query(insertQuery, [email, password, role], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).json({ message: 'Database error during registration' });
      }

      return res.status(201).json({ message: 'User registered successfully' });
    });
  });
});
// Example Express route to get logged-in user details
// 🔵 Fetch logged-in user's profile
app.get('/api/user/profile', verifyToken, (req, res) => {
  const userId = req.userId;

  const query = 'SELECT id, email, role FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(results[0]);
  });
});


// Start the server
const PORT = 7755;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
