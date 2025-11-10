import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Pool } = pkg;

// Load few-shot examples
const fewShotExamples = JSON.parse(
  readFileSync(join(__dirname, 'few-shot-examples.json'), 'utf-8')
);

const app = express();
app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- helpers ---
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// --- Middleware: authenticate JWT ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user; // { userId, email }
    next();
  });
}

// --- Auth: register (optional; handy for testing) ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const { rows: existing } = await pool.query('SELECT userId FROM "users" WHERE email=$1', [email]);
    if (existing.length) return res.status(409).json({ error: 'email already in use' });

    const hash = await bcrypt.hash(password, 12);
    const insert = `
      INSERT INTO "users" (firstName, lastName, email, password)
      VALUES ($1,$2,$3,$4)
      RETURNING userId, firstName, lastName, email
    `;
    const { rows } = await pool.query(insert, [firstName || '', lastName || '', email, hash]);
    const user = rows[0];
    const token = signToken({ userId: user.userid, email: user.email });
    res.status(201).json({ user, token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// --- Auth: login ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await pool.query('SELECT userId, email, password, firstName, lastName FROM "users" WHERE email=$1', [email]);
    if (!rows.length) return res.status(401).json({ error: 'Invalid Credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid Credentials' });

    const token = signToken({ userId: user.userid, email: user.email });
    res.json({
      token,
      user: {
        userId: user.userid,
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

// --- Chat/Conversation Endpoints ---

// GET all conversations for the logged-in user
app.get('/api/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const query = `
      SELECT 
        c.chatId as id,
        c.chatTitle as title,
        c.archived,
        COALESCE(
          (SELECT m.answer 
           FROM "messages" m 
           WHERE m.chatId = c.chatId 
           ORDER BY m.timestamp DESC 
           LIMIT 1),
          'No messages yet'
        ) as "lastMessage",
        COALESCE(
          (SELECT m.timestamp 
           FROM "messages" m 
           WHERE m.chatId = c.chatId 
           ORDER BY m.timestamp DESC 
           LIMIT 1),
          NOW()
        ) as timestamp
      FROM "chats" c
      WHERE c.userId = $1 AND c.archived = false
      ORDER BY timestamp DESC
    `;
    
    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
  } catch (e) {
    console.error('Error fetching conversations:', e);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// POST create a new conversation
app.post('/api/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title } = req.body;
    
    const query = `
      INSERT INTO "chats" (userId, chatTitle, archived, chatType)
      VALUES ($1, $2, false, 0)
      RETURNING chatId as id, chatTitle as title, archived
    `;
    
    const { rows } = await pool.query(query, [userId, title || 'New Conversation']);
    const newChat = rows[0];
    
    res.status(201).json({
      ...newChat,
      lastMessage: 'No messages yet',
      timestamp: new Date()
    });
  } catch (e) {
    console.error('Error creating conversation:', e);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// GET messages for a specific conversation
app.get('/api/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    
    // Verify the chat belongs to the user
    const chatCheck = await pool.query(
      'SELECT chatId FROM "chats" WHERE chatId = $1 AND userId = $2',
      [conversationId, userId]
    );
    
    if (chatCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    const query = `
      SELECT 
        messageId,
        question,
        answer,
        timestamp
      FROM "messages"
      WHERE chatId = $1
      ORDER BY timestamp ASC
    `;
    
    const { rows } = await pool.query(query, [conversationId]);
    
    // Transform to match frontend format (alternating user/ai messages)
    const messages = [];
    rows.forEach(row => {
      if (row.question) {
        messages.push({
          id: `${row.messageid}-user`,
          text: row.question,
          sender: 'user',
          timestamp: row.timestamp
        });
      }
      if (row.answer) {
        messages.push({
          id: `${row.messageid}-ai`,
          text: row.answer,
          sender: 'ai',
          timestamp: row.timestamp
        });
      }
    });
    
    res.json(messages);
  } catch (e) {
    console.error('Error fetching messages:', e);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST send a message and get AI response
app.post('/api/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Message text is required' });
    }
    
    // Verify the chat belongs to the user
    const chatCheck = await pool.query(
      'SELECT chatId FROM "chats" WHERE chatId = $1 AND userId = $2',
      [conversationId, userId]
    );
    
    if (chatCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Get conversation history for context
    const historyQuery = await pool.query(
      'SELECT question, answer FROM "messages" WHERE chatId = $1 ORDER BY timestamp ASC LIMIT 5',
      [conversationId]
    );
    
    // Build conversation history for OpenAI with few-shot examples
    const messages = [
      {
        role: 'system',
        content: `${fewShotExamples.systemContext.role} ${fewShotExamples.systemContext.principles.join(' ')} ${fewShotExamples.systemContext.formattingInstructions}`
      }
    ];
    
    // Add few-shot examples to improve response quality
    fewShotExamples.examples.forEach(example => {
      messages.push({ role: 'user', content: example.user });
      messages.push({ role: 'assistant', content: example.assistant });
    });
    
    // Add conversation history
    historyQuery.rows.forEach(row => {
      if (row.question) {
        messages.push({ role: 'user', content: row.question });
      }
      if (row.answer) {
        messages.push({ role: 'assistant', content: row.answer });
      }
    });
    
    // Add current user message
    messages.push({ role: 'user', content: text });
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    // Insert message with both question and answer
    const query = `
      INSERT INTO "messages" (chatId, question, answer, timestamp)
      VALUES ($1, $2, $3, NOW())
      RETURNING messageId, question, answer, timestamp
    `;
    
    const { rows } = await pool.query(query, [conversationId, text, aiResponse]);
    const message = rows[0];
    
    // Update chat title if it's still "New Conversation"
    const chatQuery = await pool.query(
      'SELECT chatTitle FROM "chats" WHERE chatId = $1',
      [conversationId]
    );
    
    if (chatQuery.rows[0].chattitle === 'New Conversation') {
      // Generate a title from the first message (take first 50 chars)
      const newTitle = text.substring(0, 50) + (text.length > 50 ? '...' : '');
      await pool.query(
        'UPDATE "chats" SET chatTitle = $1 WHERE chatId = $2',
        [newTitle, conversationId]
      );
    }
    
    res.json({
      userMessage: {
        id: `${message.messageid}-user`,
        text: message.question,
        sender: 'user',
        timestamp: message.timestamp
      },
      aiMessage: {
        id: `${message.messageid}-ai`,
        text: message.answer,
        sender: 'ai',
        timestamp: message.timestamp
      }
    });
  } catch (e) {
    console.error('Error sending message:', e);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.get('/api/health', async (_req, res) => {
  const { rows } = await pool.query('SELECT NOW() as now');
  res.json({ ok: true, now: rows[0].now });
});

app.listen(PORT, () => {
  console.log(`AI-Do API listening on http://localhost:${PORT}`);
});
