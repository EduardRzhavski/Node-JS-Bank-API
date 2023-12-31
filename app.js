const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

/// Define CORS options for React app URL
const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

// Use CORS middleware with specified options
app.use(cors(corsOptions));

// Parse JSON requests
app.use(bodyParser.json());

// database for users
let users = [];

app.use(bodyParser.json());

// Add a new user to the bank
app.post('/users', (req, res) => {
  const { id, cash, credit } = req.body;

  // Check if user with the same ID already exists
  if (users.some(user => user.id === id)) {
    return res.status(400).json({ error: 'User with the same ID already exists' });
  }

  const newUser = {
    id: id || users.length + 1,
    cash: cash || 0,
    credit: credit || 0,
    isActive: true, // user activity status
  };

  users.push(newUser);

  res.status(201).json(newUser);
});

// Get all users
app.get('/users', (req, res) => {
  res.json(users);
});

// Get user by ID
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(user => user.id === userId);

  // Check if user exists
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// Update user by ID and update cash, credit and activity status
app.put('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(user => user.id === userId);

  // Check if user exists
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  users[userIndex] = { ...users[userIndex], ...req.body };

  res.json(users[userIndex]);
});

// Deposit cash to a user by ID and amount
app.post('/users/:id/deposit', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(user => user.id === userId);

  // Check if user exists
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const amount = req.body.amount || 0;
  user.cash += amount;

  res.json(user);
});

// Update user's credit
app.put('/users/:id/update-credit', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(user => user.id === userId);

  // Check if user exists
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newCredit = req.body.credit;

  if (newCredit >= 0) {
    user.credit = newCredit;
    res.json(user);
  } else {
    res.status(400).json({ error: 'Credit must be a positive number' });
  }
});

// Withdraw money from user
app.post('/users/:id/withdraw', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(user => user.id === userId);

  // Check if user exists
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const amount = req.body.amount || 0;

  if (amount > user.cash + user.credit) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  // Withdraw from cash first and then credit
  if (amount <= user.cash) {
    user.cash -= amount;
  } else {
    const remainingCredit = amount - user.cash;
    user.cash = 0;
    user.credit -= remainingCredit;
  }

  res.json(user);
});

// Transfer money from one user to another with credit
app.post('/users/:fromId/transfer/:toId', (req, res) => {
  const fromUserId = parseInt(req.params.fromId);
  const toUserId = parseInt(req.params.toId);

  const fromUser = users.find(user => user.id === fromUserId);
  const toUser = users.find(user => user.id === toUserId);

  // Check if both users exist
  if (!fromUser || !toUser) {
    return res.status(404).json({ error: 'One or both users not found' });
  }

  const amount = req.body.amount || 0;

  if (amount > fromUser.cash + fromUser.credit) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  // Withdraw from cash first and then credit
  if (amount <= fromUser.cash) {
    fromUser.cash -= amount;
  } else {
    const remainingCredit = amount - fromUser.cash;
    fromUser.cash = 0;
    fromUser.credit -= remainingCredit;
  }

  toUser.cash += amount;

  res.json({ fromUser, toUser });
});

// Fetch details of user by ID
app.get('/users/:id/details', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(user => user.id === userId);

  // Check if user exists
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    cash: user.cash,
    credit: user.credit,
    isActive: user.isActive,
  });
});

// Fetch details of all users
app.get('/users/details', (req, res) => {
  const userDetails = users.map(user => ({
    id: user.id,
    cash: user.cash,
    credit: user.credit,
    isActive: user.isActive,
  }));

  res.json(userDetails);
});

// Fetch active users with specified amount
app.get('/users/filter/active/:amount', (req, res) => {
  const amount = parseInt(req.params.amount);

  // Filter active users based on the amount
  const activeUsers = users.filter(user => user.isActive && user.cash >= amount);

  res.json(activeUsers);
});

// Start the server
app.listen(port, () => {
  console.log(`Bank API is running on http://localhost:${port}`);
});
