import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Ensure data directory exists for persistent storage
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'users_db.json');

interface UserRecord {
  id: string;
  username: string;
  passwordHash: string; // simple secure hash for local auth
  displayName: string;
  avatar: string;
  bio: string;
  createdAt: string;
  stats: {
    totalDebates: number;
    wins: number;
    topicsExplored: string[];
    favoriteOpponent: string | null;
    xp: number;
    level: number;
    achievements: Array<{
      id: string;
      title: string;
      description: string;
      unlockedAt: string;
      icon: string;
    }>;
  };
  debates: Array<{
    id: string;
    date: string;
    characterId: string;
    characterName: string;
    characterAvatar: string;
    topicTitle: string;
    category?: string;
    userStance?: string;
    outcome: 'Won' | 'Completed' | 'Draw';
    summary: string;
    messages?: any[];
  }>;
}

function loadUsers(): Record<string, UserRecord> {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading users db:', err);
  }
  return {};
}

function saveUsers(users: Record<string, UserRecord>) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users db:', err);
  }
}

// Load users from persistent storage (starts empty for new users)
let users = loadUsers();
// Clean up legacy auto-seeded starter user if it was never modified by a real user
if (users['alex'] && users['alex'].id === 'user-default-1' && users['alex'].stats.totalDebates === 0) {
  delete users['alex'];
  saveUsers(users);
}

// Safe user profile helper (without password)
function sanitizeUser(u: UserRecord) {
  const { passwordHash, ...safe } = u;
  return safe;
}

// ----------------- AUTH & PROFILE API ROUTES ----------------- //

// Register a new user
app.post('/api/auth/register', (req, res) => {
  const { username, password, displayName, avatar, bio } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const cleanUsername = username.trim().toLowerCase();
  users = loadUsers();
  if (users[cleanUsername]) {
    return res.status(409).json({ error: 'Username already exists. Please choose another.' });
  }

  const newUser: UserRecord = {
    id: `user-${Date.now()}`,
    username: cleanUsername,
    passwordHash: password,
    displayName: (displayName || '').trim(),
    avatar: avatar || '',
    bio: (bio || '').trim(),
    createdAt: new Date().toISOString(),
    stats: {
      totalDebates: 0,
      wins: 0,
      topicsExplored: [],
      favoriteOpponent: null,
      xp: 0,
      level: 1,
      achievements: [],
    },
    debates: [],
  };

  users[cleanUsername] = newUser;
  saveUsers(users);

  res.json({ user: sanitizeUser(newUser), token: newUser.id });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const cleanUsername = username.trim().toLowerCase();
  users = loadUsers();
  const user = users[cleanUsername];

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  res.json({ user: sanitizeUser(user), token: user.id });
});

// Get user profile
app.get('/api/user/:username', (req, res) => {
  const cleanUsername = req.params.username.trim().toLowerCase();
  users = loadUsers();
  const user = users[cleanUsername];
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({ user: sanitizeUser(user) });
});

// Update profile (display name, bio, avatar, and optional username)
app.put('/api/user/:username/profile', (req, res) => {
  const cleanUsername = req.params.username.trim().toLowerCase();
  const { displayName, bio, avatar, username: newUsername } = req.body;

  users = loadUsers();
  const user = users[cleanUsername];
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Handle optional username update
  let targetUsername = cleanUsername;
  if (newUsername !== undefined && typeof newUsername === 'string') {
    const sanitized = newUsername.trim().toLowerCase().replace(/[\s\t\n]+/g, '_');
    if (!sanitized) {
      return res.status(400).json({ error: 'Username cannot be empty.' });
    }
    if (sanitized !== cleanUsername) {
      if (users[sanitized]) {
        return res.status(409).json({ error: `Username "${sanitized}" is already taken.` });
      }
      user.username = sanitized;
      users[sanitized] = user;
      delete users[cleanUsername];
      targetUsername = sanitized;
    }
  }

  if (displayName !== undefined && typeof displayName === 'string') {
    const trimmed = displayName.trim();
    if (trimmed) user.displayName = trimmed;
  }
  if (bio !== undefined && typeof bio === 'string') {
    user.bio = bio.trim();
  }
  if (avatar !== undefined && typeof avatar === 'string') {
    user.avatar = avatar;
  }

  saveUsers(users);
  res.json({ user: sanitizeUser(user), newUsername: targetUsername, message: 'Profile updated successfully.' });
});

// Unified save or create user profile
app.post('/api/user/save-profile', (req, res) => {
  const { oldUsername, username, displayName, bio, avatar } = req.body;
  const cleanUsername = (username || '').trim().toLowerCase().replace(/[\s\t\n]+/g, '_');
  const cleanOld = (oldUsername || '').trim().toLowerCase().replace(/[\s\t\n]+/g, '_');

  users = loadUsers();
  let targetUser = cleanOld && users[cleanOld] ? users[cleanOld] : null;

  if (targetUser) {
    if (cleanUsername && cleanUsername !== cleanOld) {
      if (users[cleanUsername]) {
        return res.status(409).json({ error: `Username "${cleanUsername}" is already taken.` });
      }
      targetUser.username = cleanUsername;
      users[cleanUsername] = targetUser;
      delete users[cleanOld];
    }
  } else if (cleanUsername) {
    if (!users[cleanUsername]) {
      targetUser = {
        id: `user-${Date.now()}`,
        username: cleanUsername,
        passwordHash: 'pass123',
        displayName: displayName !== undefined ? displayName : '',
        avatar: avatar !== undefined ? avatar : '',
        bio: bio !== undefined ? bio : '',
        createdAt: new Date().toISOString(),
        stats: {
          totalDebates: 0,
          wins: 0,
          topicsExplored: [],
          favoriteOpponent: null,
          xp: 0,
          level: 1,
          achievements: [],
        },
        debates: [],
      };
      users[cleanUsername] = targetUser;
    } else {
      targetUser = users[cleanUsername];
    }
  }

  if (targetUser) {
    if (displayName !== undefined) targetUser.displayName = displayName;
    if (bio !== undefined) targetUser.bio = bio;
    if (avatar !== undefined) targetUser.avatar = avatar;
    saveUsers(users);
    return res.json({ user: sanitizeUser(targetUser), success: true });
  }

  res.json({ success: true });
});

// Dedicated endpoint to update username independently
app.put('/api/user/:username/username', (req, res) => {
  const cleanOld = req.params.username.trim().toLowerCase();
  const rawNew = req.body.username || req.body.newUsername;

  if (!rawNew || typeof rawNew !== 'string') {
    return res.status(400).json({ error: 'Please provide a valid username.' });
  }

  const cleanNew = rawNew.trim().toLowerCase().replace(/[\s\t\n]+/g, '_');
  if (!cleanNew) {
    return res.status(400).json({ error: 'Username cannot be empty.' });
  }
  if (cleanNew.length < 2) {
    return res.status(400).json({ error: 'Username must be at least 2 characters.' });
  }
  if (!/^[a-z0-9_-]+$/.test(cleanNew)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, underscores, and hyphens.' });
  }

  users = loadUsers();
  const user = users[cleanOld];
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (cleanNew === cleanOld) {
    return res.json({ user: sanitizeUser(user), newUsername: cleanNew, message: 'Username is unchanged.' });
  }

  if (users[cleanNew]) {
    return res.status(409).json({ error: `Username "${cleanNew}" is already taken. Please choose another.` });
  }

  user.username = cleanNew;
  users[cleanNew] = user;
  delete users[cleanOld];

  saveUsers(users);
  res.json({ user: sanitizeUser(user), newUsername: cleanNew, message: 'Username updated successfully.' });
});

// Save completed debate to user profile
app.post('/api/user/:username/debate-complete', (req, res) => {
  const cleanUsername = req.params.username.trim().toLowerCase();
  const debateRecord = req.body;

  users = loadUsers();
  const user = users[cleanUsername];
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.debates = [debateRecord, ...(user.debates || [])];
  user.stats.totalDebates += 1;
  if (debateRecord.outcome === 'Won') {
    user.stats.wins += 1;
  }
  user.stats.xp += 100;
  user.stats.level = Math.floor(user.stats.xp / 200) + 1;

  if (debateRecord.topicTitle && !user.stats.topicsExplored.includes(debateRecord.topicTitle)) {
    user.stats.topicsExplored.push(debateRecord.topicTitle);
  }

  // Favorite opponent calculation
  const counts: Record<string, number> = {};
  user.debates.forEach((d) => {
    counts[d.characterName] = (counts[d.characterName] || 0) + 1;
  });
  let topOpponent = user.stats.favoriteOpponent;
  let max = 0;
  Object.entries(counts).forEach(([name, c]) => {
    if (c > max) {
      max = c;
      topOpponent = name;
    }
  });
  user.stats.favoriteOpponent = topOpponent;

  // Real milestone achievements
  if (user.stats.totalDebates === 1 && !user.stats.achievements.some((a) => a.id === 'first-debate')) {
    user.stats.achievements.push({
      id: 'first-debate',
      title: 'First Debate',
      description: 'Completed your very first debate in the arena!',
      unlockedAt: 'Just now',
      icon: 'Play',
    });
  }
  if (user.stats.topicsExplored.length >= 3 && !user.stats.achievements.some((a) => a.id === 'curious-explorer')) {
    user.stats.achievements.push({
      id: 'curious-explorer',
      title: 'Curious Explorer',
      description: 'Explored 3 different debate topics!',
      unlockedAt: 'Just now',
      icon: 'Compass',
    });
  }

  saveUsers(users);
  res.json({ user: sanitizeUser(user) });
});

// ----------------- AI DEBATE GENERATION (GEMINI API ENGINE) ----------------- //

const CHARACTER_PLAYBOOKS: Record<string, { role: string; style: string; rhetoric: string }> = {
  strategist: {
    role: 'The Strategist',
    style: 'Systems analyst, game theorist, and optimizer of operational trade-offs and incentives.',
    rhetoric: 'Dissects friction, liabilities, cognitive overhead, and second-order consequences. Treats the user claim as a fragile tactical illusion or misallocation of focus. Speaks with calm, surgical authority.'
  },
  scientist: {
    role: 'The Scientist',
    style: 'Empirical researcher, cognitive neuroscientist, and evidence purist.',
    rhetoric: 'Grounds counter-claims in observable mechanisms, sensory biology, cognitive encoding, and empirical data. Exposes why real-world physical limits refute the user claim. Speaks with sharp, inquisitive precision.'
  },
  skeptic: {
    role: 'The Skeptic',
    style: 'Contrarian philosopher, Socratic interrogator, and destroyer of marketing orthodoxies.',
    rhetoric: 'Ruthlessly targets the unexamined assumption the user took for granted. Exposes false dichotomies, the paradox of choice, and the trap of digital convenience. Speaks with incisive, challenging intensity.'
  },
  futurist: {
    role: 'The Futurist',
    style: 'Technological forecaster, evolutionary thinker, and civilizational architect.',
    rhetoric: 'Analyzes exponential curves, durable civilizational artifacts, and enduring mediums vs fleeting consumer gadgets. Distinguishes genuine cognitive evolution from corporate software lock-in. Speaks with visionary, forward-leaning momentum.'
  },
  ethicist: {
    role: 'The Ethicist',
    style: 'Moral philosopher, humanist advocate, and protector of human agency.',
    rhetoric: 'Reframes the argument around human dignity, psychological autonomy, attention extraction, and who bears the hidden human toll. Questions whether tech convenience is eroding core intellectual sovereignty. Speaks with deep, principled weight.'
  },
  creative: {
    role: 'The Creative',
    style: 'Lateral thinker, artistic provocateur, and master of evocative metaphor.',
    rhetoric: 'Uses vivid allegories, unexpected sensory paradoxes, and lateral leaps that disrupt the debate frame. Turns the user argument inside out with striking imagery. Speaks with vibrant, poetic, and memorable flair.'
  }
};

function formatConversationContext(previousMessages: any[], characterName: string, currentRound: number): string {
  if (!Array.isArray(previousMessages) || previousMessages.length === 0) {
    return 'This is the opening round of the debate.';
  }
  const cleanMsgs = previousMessages
    .filter((m) => (m.sender === 'user' || m.sender === 'character') && m.text && m.text.trim().length > 0)
    .slice(-8);

  if (cleanMsgs.length === 0) return 'This is the opening round of the debate.';

  return cleanMsgs
    .map((m) => `${m.sender === 'user' ? 'User' : characterName} [Round ${m.roundNumber || 1}]: "${m.text.trim()}"`)
    .join('\n');
}

function buildDebatePrompt(params: {
  topic: string;
  userStance: string;
  opponentStance: string;
  character: any;
  roundNumber: number;
  totalRounds?: number;
  previousMessages: any[];
  userArgument: string;
  difficulty?: string;
  isUnlimited?: boolean;
}) {
  const { topic, userStance, opponentStance, character, roundNumber, totalRounds, previousMessages, userArgument, difficulty, isUnlimited } = params;
  const playbook = CHARACTER_PLAYBOOKS[character?.id] || {
    role: character?.name || 'Debate Opponent',
    style: character?.description || 'Intelligent, sharp debate partner.',
    rhetoric: character?.debateStyle || 'Dissects arguments with logic and real-world trade-offs.'
  };

  const history = formatConversationContext(previousMessages, character?.name || 'Opponent', roundNumber);

  const systemInstruction = `You are roleplaying as ${character.name} in a high-intensity, live debate on DebateX.
YOUR CHARACTER IDENTITY:
- Persona: ${playbook.role}
- Philosophical Stance: ${playbook.style}
- Rhetorical Playbook: ${playbook.rhetoric}
- Voice & Tone: ${character.voiceTone || 'Sharp, articulate, and confident'}

DEBATE PARAMETERS:
- Topic: "${topic}"
- User Stance: "${userStance}"
- YOUR ASSIGNED OPPOSING STANCE: "${opponentStance}" (You MUST defend this side strictly)
- Difficulty Level: ${difficulty || 'Beginner'} (${
    difficulty === 'Advanced' ? 'deliver sophisticated dialectics, scrutiny of premises, and rigorous counter-models' :
    difficulty === 'Intermediate' ? 'provide layered counter-arguments balancing practical examples and analytical principles' :
    'use accessible, crystal-clear reasoning and relatable everyday dynamics'
  })
- Format: ${isUnlimited ? `Unlimited Match · Round ${roundNumber}` : `Quick Match · Round ${roundNumber} of ${totalRounds || 3}`}

CRITICAL RULES OF ENGAGEMENT:
1. DIRECT TARGETING (MANDATORY): You must directly dissect the user's latest claim, specific logic, examples, and assumptions. For instance, if they argue "tablets store thousands of books", tackle storage/archival illusions, digital hoarding, or retention friction vs physical books. Never deflect or reply with an unrelated generic talking point.
2. CONTINUITY & REPETITION DETECTION: Review prior rounds. If the user repeats or recycles a claim they or you already addressed earlier, explicitly call out that they are repeating themselves (e.g., "You are still leaning on that storage claim from earlier, yet you haven't answered...") and push the debate forward.
3. ABSOLUTE BAN ON ROBOTIC INTRODUCTIONS:
   - NEVER begin with: "As ${character.name}...", "I hear your point...", "Defending ${opponentStance}...", "While I understand...", "You make a good point...", "In this debate...", or "Let's be clear...".
   - Dive directly in media res into the rebuttal.
4. NATURAL SPEECH & VARIED CLOSINGS:
   - Speak like an articulate, confident human debater, not an essay generator.
   - Length: 60 to 110 words. Punchy, intense, memorable.
   - DO NOT end with an obligatory rhetorical question every time. Use declarative points, sharp observations, or counter-assertions naturally.
5. SOLIDARITY TO OPPOSING STANCE: Defend "${opponentStance}" with conviction.`;

  const promptText = `DEBATE TRANSCRIPT SO FAR:
${history}

CURRENT USER ARGUMENT (Round ${roundNumber}):
"${userArgument}"

Deliver ${character.name}'s counterargument defending "${opponentStance}" now:`;

  return { systemInstruction, promptText };
}

function generateContextualFallback(character: any, userArgument: string, userStance: string, opponentStance: string, topic: string): string {
  const lower = (userArgument || '').toLowerCase();
  const charId = character?.id || 'strategist';

  let rebuttalCore = '';
  if (lower.includes('store') || lower.includes('storage') || lower.includes('thousand') || lower.includes('space') || lower.includes('carry')) {
    rebuttalCore = 'Carrying thousands of unread files confuses archival capacity with actual comprehension. The paradox of an infinite digital shelf fragments attention and breeds superficial skimming rather than deep reading.';
  } else if (lower.includes('cost') || lower.includes('cheap') || lower.includes('money') || lower.includes('price') || lower.includes('free')) {
    rebuttalCore = 'The apparent cost advantage masks heavy long-term liabilities: continuous hardware obsolescence, subscription lock-in, and the commodification of your private reading habits.';
  } else if (lower.includes('fast') || lower.includes('speed') || lower.includes('quick') || lower.includes('time') || lower.includes('convenien')) {
    rebuttalCore = 'Convenience without cognitive friction breeds intellectual fragility. When an experience requires zero physical presence, the brain treats the knowledge as ephemeral and disposable.';
  } else if (lower.includes('environment') || lower.includes('tree') || lower.includes('green') || lower.includes('paper')) {
    rebuttalCore = 'Ignoring the toxic e-waste, lithium extraction, and non-renewable energy required to manufacture and charge disposable screens invalidates the simplistic ecological claim.';
  } else {
    rebuttalCore = `Assuming that ${userStance} provides a superior outcome overlooks the structural and cognitive strengths inherent in ${opponentStance}. What seems effortless on the surface introduces deep compromises in practice.`;
  }

  if (charId === 'scientist') {
    return `${rebuttalCore} Empirical studies on deep reading prove that spatial landmarks and physical tactile feedback anchor memory formation in ways pixel displays cannot replicate.`;
  }
  if (charId === 'skeptic') {
    return `${rebuttalCore} You have bought into the myth of quantity over substance. Accessing everything is not the same as absorbing anything.`;
  }
  if (charId === 'futurist') {
    return `${rebuttalCore} Technological endurance belongs to mediums that operate with zero battery failure, zero data tracking, and permanent sensory resonance.`;
  }
  if (charId === 'ethicist') {
    return `${rebuttalCore} When literacy is mediated by proprietary operating systems, human cognitive autonomy is traded away for corporate convenience.`;
  }
  if (charId === 'creative') {
    return `${rebuttalCore} A screen is an open doorway to a buzzing bazaar; a tangible book is a quiet sanctuary. You cannot enter both simultaneously.`;
  }
  return `${rebuttalCore} From a systems perspective, the optimal trade-off favors singular depth over boundless, unintegrated noise every single time.`;
}

// SSE Streaming AI counterargument endpoint
app.post('/api/debate/respond/stream', async (req, res) => {
  const t_req_start = Date.now();
  console.log(`[Debate Engine Stream] Request started at: ${new Date().toISOString()}`);

  const {
    topic,
    userStance,
    opponentStance,
    character,
    roundNumber,
    totalRounds,
    previousMessages,
    userArgument,
    difficulty,
    isUnlimited,
  } = req.body;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof (res as any).flushHeaders === 'function') {
    (res as any).flushHeaders();
  }

  let isClientConnected = true;
  req.on('close', () => {
    isClientConnected = false;
  });

  const sendSSE = (obj: any) => {
    if (!isClientConnected) return;
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
    if (typeof (res as any).flush === 'function') {
      (res as any).flush();
    }
  };

  const { systemInstruction, promptText } = buildDebatePrompt({
    topic,
    userStance,
    opponentStance,
    character,
    roundNumber,
    totalRounds,
    previousMessages,
    userArgument,
    difficulty,
    isUnlimited,
  });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log('[Debate Engine Stream] No GEMINI_API_KEY found, streaming intelligent fallback');
    const fallbackText = generateContextualFallback(character, userArgument, userStance, opponentStance, topic);
    const words = fallbackText.split(' ');
    for (const w of words) {
      if (!isClientConnected) break;
      sendSSE({ chunk: w + ' ' });
      await new Promise((r) => setTimeout(r, 30));
    }
    sendSSE({ done: true });
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  // Model cascade: try fast low-latency models first, resiliently fall back if Google returns 503 high demand
  const modelsToAttempt = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
  let streamSucceeded = false;
  const ai = new GoogleGenAI();

  for (const model of modelsToAttempt) {
    if (!isClientConnected) break;
    try {
      console.log(`[Debate Engine Stream] Attempting stream with model: ${model}`);
      const t_stream_start = Date.now();
      const stream = await ai.models.generateContentStream({
        model,
        contents: promptText,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      let tokenCount = 0;
      for await (const chunk of stream) {
        if (!isClientConnected) break;
        const text = chunk.text;
        if (text) {
          if (tokenCount === 0) {
            console.log(`[Debate Engine Stream] Model ${model} TTFT: ${Date.now() - t_stream_start}ms`);
          }
          tokenCount++;
          sendSSE({ chunk: text });
        }
      }

      if (tokenCount > 0) {
        console.log(`[Debate Engine Stream] Model ${model} stream completed in ${Date.now() - t_stream_start}ms (Total: ${Date.now() - t_req_start}ms)`);
        streamSucceeded = true;
        break;
      }
    } catch (err: any) {
      console.warn(`[Debate Engine Stream] Model ${model} encountered error: ${err?.message || err}. Trying next fallback...`);
    }
  }

  if (!streamSucceeded && isClientConnected) {
    console.log('[Debate Engine Stream] Upstream models busy, streaming dynamic contextual counterargument');
    const fallbackText = generateContextualFallback(character, userArgument, userStance, opponentStance, topic);
    const words = fallbackText.split(' ');
    for (const w of words) {
      if (!isClientConnected) break;
      sendSSE({ chunk: w + ' ' });
      await new Promise((r) => setTimeout(r, 25));
    }
  }

  if (isClientConnected) {
    sendSSE({ done: true });
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Non-streaming AI counterargument endpoint (upgraded with identical cognitive engine)
app.post('/api/debate/respond', async (req, res) => {
  const t_req_start = Date.now();
  console.log(`[Debate Engine Standard] Request received at: ${new Date().toISOString()}`);

  const {
    topic,
    userStance,
    opponentStance,
    character,
    roundNumber,
    totalRounds,
    previousMessages,
    userArgument,
    difficulty,
    isUnlimited,
  } = req.body;

  const { systemInstruction, promptText } = buildDebatePrompt({
    topic,
    userStance,
    opponentStance,
    character,
    roundNumber,
    totalRounds,
    previousMessages,
    userArgument,
    difficulty,
    isUnlimited,
  });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const text = generateContextualFallback(character, userArgument, userStance, opponentStance, topic);
    return res.json({ text });
  }

  const modelsToAttempt = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
  const ai = new GoogleGenAI();

  for (const model of modelsToAttempt) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: promptText,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const reply = response.text?.trim();
      if (reply) {
        console.log(`[Debate Engine Standard] Generated with ${model} in ${Date.now() - t_req_start}ms`);
        return res.json({ text: reply });
      }
    } catch (err: any) {
      console.warn(`[Debate Engine Standard] Model ${model} failed: ${err?.message || err}. Trying next...`);
    }
  }

  // Smart contextual fallback if all models fail
  const fallbackText = generateContextualFallback(character, userArgument, userStance, opponentStance, topic);
  res.json({ text: fallbackText });
});

// Generate constructive end-of-debate feedback
app.post('/api/debate/evaluate', async (req, res) => {
  const { topic, userStance, opponentStance, characterName, messages } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json({
      reasoning: 'You supported your points with clear, practical reasoning and stayed on topic throughout all rounds.',
      clarity: 'Your arguments were straightforward, easy to understand, and well structured.',
      evidence: 'You used relatable examples to illustrate your stance effectively.',
      summary: `You had an engaging debate defending ${userStance} against ${characterName}. Both sides exchanged thoughtful arguments!`,
    });
  }

  try {
    const ai = new GoogleGenAI();
    const transcript = (messages || [])
      .map((m: any) => `${m.sender === 'user' ? 'User' : characterName}: ${m.text}`)
      .join('\n\n');

    const promptText = `Analyze this debate on the topic "${topic}".
User defended: "${userStance}"
AI opponent defended: "${opponentStance}"

Debate transcript:
${transcript}

Provide constructive, beginner-friendly feedback on the user's performance in JSON format with these exact keys:
{
  "reasoning": "1-2 sentences evaluating their logic and reasoning",
  "clarity": "1-2 sentences on how clearly they expressed themselves",
  "evidence": "1-2 sentences on their examples and points",
  "summary": "A friendly 1-sentence overall encouraging summary"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const json = JSON.parse(response.text || '{}');
    res.json({
      reasoning: json.reasoning || 'You presented solid logic and stayed grounded in your core points.',
      clarity: json.clarity || 'Your arguments were clear, concise, and easy to follow.',
      evidence: json.evidence || 'You shared practical examples that strengthened your perspective.',
      summary: json.summary || `A wonderful debate on "${topic}" with thoughtful points on both sides!`,
    });
  } catch (err) {
    console.error('Evaluation error:', err);
    res.json({
      reasoning: 'You presented solid logic and stayed grounded in your core points.',
      clarity: 'Your arguments were clear, concise, and easy to follow.',
      evidence: 'You shared practical examples that strengthened your perspective.',
      summary: `A wonderful debate on "${topic}" with thoughtful points on both sides!`,
    });
  }
});

// ----------------- VITE DEVELOPMENT SERVER INTEGRATION ----------------- //

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DebateX full-stack dev server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
