// backend/services/geminiService.js
import Groq from 'groq-sdk';

const MODEL = 'llama-3.3-70b-versatile';

let client = null;

const getClient = () => {
  if (!client) {
    const key = process.env.GROQ_API_KEY?.trim();
    if (!key) throw new Error('GROQ_API_KEY is not set in backend/.env');
    client = new Groq({ apiKey: key });
  }
  return client;
};

const extractFirstJSON = (text) => {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  try { return JSON.parse(trimmed); } catch (e) {}
  const findBlock = (openChar, closeChar) => {
    let depth = 0, start = -1;
    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (ch === openChar) { if (depth === 0) start = i; depth++; }
      else if (ch === closeChar && depth > 0) {
        depth--;
        if (depth === 0 && start !== -1) {
          const candidate = trimmed.slice(start, i + 1);
          try { return JSON.parse(candidate); } catch { start = -1; }
        }
      }
    }
    return null;
  };
  return findBlock('{', '}') || findBlock('[', ']');
};

const callGroq = async (prompt, maxTokens = 1024) => {
  const response = await getClient().chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error('No response from Groq API');
  return text;
};

const upstreamErrorMessage = (err) => err?.message || 'Unknown error';

export const getGeminiResponse = async (userMessage, context = '') => {
  try {
    const prompt = context
      ? `Context:\n${context}\n\nUser Question:\n${userMessage}`
      : userMessage;
    return await callGroq(prompt, 1024);
  } catch (error) {
    throw new Error('Failed to get AI response: ' + upstreamErrorMessage(error));
  }
};

export const generateSummary = async (content) => {
  try {
    return await callGroq(
      `Summarize the following content clearly in bullet points:\n\n${content}`, 512
    );
  } catch (error) {
    throw new Error('Failed to generate summary: ' + upstreamErrorMessage(error));
  }
};

export const generateQuestions = async (content, count = 5) => {
  try {
    const response = await callGroq(
      `Generate ${count} important questions from this content.
Return ONLY a JSON array of strings. No explanation.

Content:
${content}`, 1024
    );
    const parsed = extractFirstJSON(response);
    if (!Array.isArray(parsed)) throw new Error('Invalid JSON');
    return parsed;
  } catch (error) {
    throw new Error('Failed to generate questions: ' + upstreamErrorMessage(error));
  }
};

export const generateMCQs = async (content, count = 5) => {
  try {
    const response = await callGroq(
      `Generate ${count} MCQs from this content.
Return ONLY a JSON array like:
[{"question":"...","options":["A","B","C","D"],"answer":"A","explanation":"..."}]

Content:
${content}`, 2048
    );
    const parsed = extractFirstJSON(response);
    if (!Array.isArray(parsed)) throw new Error('Invalid JSON');
    return parsed;
  } catch (error) {
    throw new Error('Failed to generate MCQs: ' + upstreamErrorMessage(error));
  }
};

export const generateFlashcards = async (content, count = 10) => {
  try {
    const response = await callGroq(
      `Generate ${count} flashcards from this content.
Return ONLY a JSON array like:
[{"front":"question or term","back":"answer or definition"}]

Content:
${content}`, 2048
    );
    const parsed = extractFirstJSON(response);
    if (!Array.isArray(parsed)) throw new Error('Invalid JSON');
    return parsed;
  } catch (error) {
    throw new Error('Failed to generate flashcards: ' + upstreamErrorMessage(error));
  }
};

export const analyzeResume = async (resumeContent) => {
  try {
    const response = await callGroq(
      `Analyze this resume and return ONLY a JSON object with this exact shape:
{
  "atsScore": 75,
  "detectedSkills": ["skill1", "skill2"],
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "missingKeywords": ["keyword1"],
  "improvementSuggestions": ["suggestion1"],
  "overallFeedback": "paragraph of overall feedback",
  "skills": { "technical": [], "soft": [] },
  "keywords": { "found": [], "missing": [] }
}

Resume:
${resumeContent}`, 2048
    );
    const parsed = extractFirstJSON(response);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON');
    return parsed;
  } catch (error) {
    throw new Error('Failed to analyze resume: ' + upstreamErrorMessage(error));
  }
};

export const generateDetailedStudyPlan = async (goal, topics, hoursPerDay, targetDate) => {
  try {
    const topicsList = Array.isArray(topics) ? topics.join(', ') : topics;
    const response = await callGroq(
      `Create a day-by-day study plan from today through ${targetDate}.
Goal: ${goal}
Topics: ${topicsList}
Hours per day: ${hoursPerDay}

Return ONLY a JSON object:
{
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "tasks": [
        {
          "topic": "topic name",
          "duration": "2 hrs",
          "description": "what to study",
          "resources": ["https://optional-link.com"]
        }
      ]
    }
  ]
}`, 4096
    );
    const parsed = extractFirstJSON(response);
    if (!parsed || !Array.isArray(parsed.days)) throw new Error('Invalid JSON');
    return parsed;
  } catch (error) {
    throw new Error('Failed to generate study plan: ' + upstreamErrorMessage(error));
  }
};

export const generateStudyPlan = async (goal, category, difficulty = 'intermediate', duration) => {
  try {
    const response = await callGroq(
      `Create a study plan.
Goal: ${goal}
Category: ${category}
Difficulty: ${difficulty}
Duration: ${duration?.value} ${duration?.unit}
Return ONLY a JSON object.`, 2048
    );
    const parsed = extractFirstJSON(response);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON');
    return parsed;
  } catch (error) {
    throw new Error('Failed to generate study plan: ' + upstreamErrorMessage(error));
  }
};

export const generateNoteInterviewQuestions = async (content, count = 10) => {
  try {
    const response = await callGroq(
      `Generate ${count} interview questions from this study material.
Return ONLY a JSON array:
[{"question":"...","answer":"...","difficulty":"easy"|"medium"|"hard"}]

Material:
${(content || '').slice(0, 6000)}`, 2048
    );
    const parsed = extractFirstJSON(response);
    if (!Array.isArray(parsed)) throw new Error('Invalid JSON');
    return parsed;
  } catch (error) {
    throw new Error('Failed to generate interview questions: ' + upstreamErrorMessage(error));
  }
};

export const generateInterviewQuestions = async (category, difficulty = 'intermediate', count = 5) => {
  try {
    const response = await callGroq(
      `Generate ${count} ${difficulty} level interview questions for ${category}.
Return ONLY a JSON array like:
[{"question":"...","expectedAnswer":"...","difficulty":"medium"}]`, 1024
    );
    const parsed = extractFirstJSON(response);
    if (!Array.isArray(parsed)) throw new Error('Invalid JSON');
    return parsed.map((q, i) => ({ ...q, id: q.id || `q-${i}` }));
  } catch (error) {
    throw new Error('Failed to generate interview questions: ' + upstreamErrorMessage(error));
  }
};

export const evaluateInterviewResponse = async (question, userResponse, category) => {
  try {
    const response = await callGroq(
      `Evaluate this ${category} interview response.
Question: ${question}
Response: ${userResponse}

Return ONLY a JSON object:
{"score": 8, "feedback": "...", "strengths": ["..."], "improvements": ["..."]}`, 1024
    );
    const parsed = extractFirstJSON(response);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON');
    return parsed;
  } catch (error) {
    throw new Error('Failed to evaluate response: ' + upstreamErrorMessage(error));
  }
};

export const generateContent = async (prompt, expectJSON = false) => {
  const text = await callGroq(prompt, 2048);
  if (!expectJSON) return text;
  const parsed = extractFirstJSON(text);
  if (!parsed) {
    console.error('Groq raw response:', text);
    throw new Error('AI returned invalid JSON format. Please try again.');
  }
  return parsed;
};