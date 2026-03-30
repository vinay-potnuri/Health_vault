import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
const app = express();
const PORT = process.env.PORT || 3000;
// Default to a non-existent mongo URI to trigger fallback if not set
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthvault';

// --- IN-MEMORY STORAGE (Fallback) ---
const memoryUsers = [];
const memoryRecords = [];
let isMongoConnected = false;

async function startServer() {
  // --- MIDDLEWARE ---
  app.use(cors());
  app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Ensure upload directory exists
  if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
  }

// Multer Storage for Files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// --- MONGODB SCHEMAS ---

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  profile: {
    bloodGroup: String,
    dob: String,
    weight: String,
    allergies: [String],
    emergencyContacts: [Object],
    avatarUrl: String,
    address: String,
    phone: String
  },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const RecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  date: String,
  type: String,
  doctorName: String,
  facility: String,
  summary: String,
  metrics: [Object],
  medications: [Object],
  safetyAlerts: [Object],
  originalFileName: String,
  fileUrl: String,
  createdAt: { type: Date, default: Date.now }
});
const Record = mongoose.model('Record', RecordSchema);

// --- ROUTES ---

// 1. AUTHENTICATION
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const verificationToken = crypto.randomBytes(32).toString('hex');

    if (isMongoConnected) {
        // MONGO MODE
        const existing = await User.findOne({ email });
        if (existing) {
          return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const newUser = new User({
          email,
          passwordHash,
          name,
          isVerified: false,
          verificationToken,
          profile: { name, email, bloodGroup: 'Unknown', allergies: [], emergencyContacts: [] }
        });
        await newUser.save();

    } else {
        // MEMORY MODE
        if (memoryUsers.find(u => u.email === email)) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }
        const newUser = {
            _id: crypto.randomUUID(),
            email,
            passwordHash,
            name,
            isVerified: false,
            verificationToken,
            profile: { name, email, bloodGroup: 'Unknown', allergies: [], emergencyContacts: [] },
            createdAt: new Date()
        };
        memoryUsers.push(newUser);
    }
    
    // Log for simulation
    console.log(`[EMAIL SIMULATION] To: ${email} | Verify: http://localhost:5173/?verificationToken=${verificationToken}`);

    res.json({ 
      success: true, 
      message: 'Registration successful. Please check your email.',
      verificationToken: verificationToken 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (isMongoConnected) {
        const user = await User.findOne({ verificationToken: token });
        if (!user) return res.status(400).json({ success: false, message: 'Invalid token' });
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
    } else {
        const user = memoryUsers.find(u => u.verificationToken === token);
        if (!user) return res.status(400).json({ success: false, message: 'Invalid token' });
        user.isVerified = true;
        user.verificationToken = undefined;
    }

    res.json({ success: true, message: 'Email verified. You can now login.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const inputHash = crypto.createHash('sha256').update(password).digest('hex');
    
    let user;

    if (isMongoConnected) {
        user = await User.findOne({ email });
        if (user) user = user.toObject();
    } else {
        user = memoryUsers.find(u => u.email === email);
    }

    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    if (inputHash !== user.passwordHash) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ success: false, message: 'Please verify email first.' });

    // Clean user object
    const { passwordHash, verificationToken, ...safeUser } = user;
    // Map _id to id
    safeUser.id = safeUser._id.toString();

    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. RECORDS
app.get('/api/records', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: 'UserId required' });

    let records = [];

    if (isMongoConnected) {
        const docs = await Record.find({ userId }).sort({ date: -1 });
        records = docs.map(d => {
            const obj = d.toObject();
            return { ...obj, id: obj._id.toString() };
        });
    } else {
        records = memoryRecords
            .filter(r => r.userId.toString() === userId)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(r => ({ ...r, id: r._id.toString() }));
    }

    res.json(records);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching records' });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    const recordData = req.body;
    delete recordData.id;
    delete recordData._id;

    if (isMongoConnected) {
        const newRecord = new Record(recordData);
        await newRecord.save();
        res.json({ success: true, record: { ...newRecord.toObject(), id: newRecord._id.toString() } });
    } else {
        const newRecord = {
            ...recordData,
            _id: crypto.randomUUID(),
            createdAt: new Date()
        };
        memoryRecords.push(newRecord);
        res.json({ success: true, record: { ...newRecord, id: newRecord._id.toString() } });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error saving record' });
  }
});

// 3. FILE UPLOAD
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ success: true, fileUrl });
});

// --- START SERVER ---
// Try to connect to Mongo, but start server regardless
mongoose.connect(MONGO_URI)
  .then(() => {
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB');
  })
  .catch(err => {
    isMongoConnected = false;
    console.log('⚠️ MongoDB not connected. Switching to In-Memory mode.');
    console.log('   (Data will be lost when server restarts)');
  });

// Vite middleware for development
async function setupFrontend() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

setupFrontend();
}

startServer();
