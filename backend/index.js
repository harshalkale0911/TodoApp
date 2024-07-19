const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Add this line for environment variables

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:5173', // Update this to match your client URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
});

const SECRET_KEY = process.env.SECRET_KEY || 'masai'; // Use environment variable

app.use(cors());
app.use(express.json());

let tasks = [];
let users = [];

app.get('/', (req, res) => {
  res.send("This is my home");
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).send('User registered');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username);
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from Bearer scheme
  if (!token) return res.status(401).send('Access Denied');
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = user;
    next();
  });
};

app.get('/tasks', authenticateToken, (req, res) => {
  res.json(tasks);
});

app.get('/users', (req, res) => {
  res.json(users);
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Access Denied'));
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return next(new Error('Invalid Token'));
    socket.user = user;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('New server connected');
  socket.emit('init', tasks);

  socket.on('addTask', (task) => {
    tasks.push(task);
    io.emit('updateTasks', tasks);
  });

  socket.on('updateTask', (updatedTask) => {
    tasks = tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
    io.emit('updateTasks', tasks);
  });

  socket.on('deleteTask', (taskId) => {
    tasks = tasks.filter(task => task.id !== taskId);
    io.emit('updateTasks', tasks);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000; // Use environment variable for port
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
