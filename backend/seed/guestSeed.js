// backend/seed/guestSeed.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Note from '../models/Note.js';
import StudyPlan from '../models/StudyPlan.js';
import Chat from '../models/Chat.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const GUEST_EMAIL = 'guest@studyai.com';
const DEMO_NOTE_TITLE = 'JavaScript Interview Prep';

const parsedContent = `Closures: A closure is a function that remembers its outer variables. Example: function counter() { let count = 0; return function() { return ++count; } }
Promises: Handle async operations. States: pending, fulfilled, rejected.
Event Loop: JS is single-threaded. Call stack + callback queue + microtask queue.
Hoisting: var declarations moved to top. let/const not initialized.
Prototypes: Objects inherit from other objects via prototype chain.
this keyword: depends on how function is called.
Arrow functions: no own this, no arguments object.
Destructuring: const { a, b } = obj; const [x, y] = arr;
Spread/Rest: ...args collects rest params, ...arr spreads array.
async/await: syntactic sugar over Promises.`;

const addDays = (base, days) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d;
};

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is missing in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  let guest = await User.findOne({ email: GUEST_EMAIL });
  if (!guest) {
    guest = await User.create({
      name: 'Guest User',
      email: GUEST_EMAIL,
      password: 'GuestPass123!',
      role: 'guest',
    });
    console.log('Created guest user');
  } else {
    console.log('Guest user already exists');
  }

  const existingNote = await Note.findOne({
    userId: guest._id,
    title: DEMO_NOTE_TITLE,
  });

  if (!existingNote) {
    await Note.create({
      userId: guest._id,
      title: DEMO_NOTE_TITLE,
      description: 'Key JS concepts for interviews',
      filePath: 'uploads/guest-demo-javascript.txt',
      fileName: 'guest-demo-javascript.txt',
      fileSize: parsedContent.length,
      fileType: 'txt',
      content: parsedContent,
      category: 'interview-prep',
      tags: ['javascript', 'interview', 'frontend'],
    });
    console.log('Created demo note');
  } else {
    console.log('Demo note already exists');
  }

  const existingPlan = await StudyPlan.findOne({
    userId: guest._id,
    title: '7-Day JavaScript Mastery',
  });

  if (!existingPlan) {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    await StudyPlan.create({
      userId: guest._id,
      title: '7-Day JavaScript Mastery',
      goal: 'Master JavaScript fundamentals for FAANG interviews',
      category: 'interview-prep',
      endDate: addDays(today, 7),
      duration: { value: 7, unit: 'days' },
      aiGenerated: true,
      isActive: true,
      schedule: [
        {
          dayNumber: 1,
          date: addDays(today, 0),
          tasks: [
            {
              topic: 'Closures & Scope',
              duration: '2 hrs',
              description:
                'Study lexical scope, closure examples, common interview questions',
            },
            {
              topic: 'Promises & Async',
              duration: '2 hrs',
              description: 'Promise chaining, async/await, error handling',
            },
          ],
        },
        {
          dayNumber: 2,
          date: addDays(today, 1),
          tasks: [
            {
              topic: 'Prototypes & Classes',
              duration: '2 hrs',
              description: 'Prototype chain, ES6 classes, inheritance',
            },
            {
              topic: 'Event Loop',
              duration: '1 hr',
              description: 'Call stack, Web APIs, callback queue, microtasks',
            },
          ],
        },
        {
          dayNumber: 3,
          date: addDays(today, 2),
          tasks: [
            {
              topic: 'Array Methods',
              duration: '2 hrs',
              description: 'map, filter, reduce, find, some, every with examples',
            },
            {
              topic: 'DOM Manipulation',
              duration: '1 hr',
              description: 'querySelector, event listeners, event delegation',
            },
          ],
        },
      ],
    });
    console.log('Created demo study plan');
  } else {
    console.log('Demo study plan already exists');
  }

  const existingChat = await Chat.findOne({
    userId: guest._id,
    title: 'JavaScript Q&A Session',
  });

  if (!existingChat) {
    await Chat.create({
      userId: guest._id,
      title: 'JavaScript Q&A Session',
      category: 'notes-based',
      messages: [
        {
          role: 'user',
          content: 'What is a closure in JavaScript?',
        },
        {
          role: 'assistant',
          content:
            'A closure is a function that retains access to its outer scope even after the outer function has returned. Example: function makeCounter() { let count = 0; return function() { return ++count; }; } const counter = makeCounter(); counter(); // 1',
        },
        {
          role: 'user',
          content: 'What is the difference between let and var?',
        },
        {
          role: 'assistant',
          content:
            'var is function-scoped and hoisted. let is block-scoped and not initialized until declaration. let also prevents redeclaration in the same scope.',
        },
      ],
    });
    console.log('Created demo chat');
  } else {
    console.log('Demo chat already exists');
  }

  console.log('Guest seed completed successfully');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Guest seed failed:', err);
  process.exit(1);
});
