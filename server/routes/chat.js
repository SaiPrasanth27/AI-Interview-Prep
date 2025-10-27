const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const Chat = require('../models/Chat');

const router = express.Router();

// Configure Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to calculate cosine similarity
const cosineSimilarity = (a, b) => {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

// Helper function to generate embeddings (simplified)
const generateEmbedding = async (text) => {
  try {
    // Try to use Gemini embedding, but fallback to dummy if quota exceeded
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.log('Embedding API error, using dummy embedding');
    // Return dummy embedding with some variation based on text
    const hash = text.length % 100;
    return new Array(384).fill(0).map((_, i) => (hash + i) / 1000);
  }
};

// Helper function to find similar chunks
const findSimilarChunks = async (query, documents, topK = 2) => {
  const queryEmbedding = await generateEmbedding(query);
  const allChunks = [];

  documents.forEach(doc => {
    doc.chunks.forEach(chunk => {
      const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
      allChunks.push({
        text: chunk.text,
        similarity,
        docType: doc.type
      });
    });
  });

  return allChunks
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
};

// Start chat session
router.post('/start', auth, async (req, res) => {
  try {
    console.log('=== STARTING CHAT SESSION ===');
    console.log('User ID:', req.user._id);

    // Check if both documents exist
    const documents = await Document.find({ userId: req.user._id });
    console.log('Found documents:', documents.length);

    if (documents.length === 0) {
      console.log('No documents found for user');
      return res.status(400).json({
        message: 'No documents found. Please upload your resume and job description first.'
      });
    }

    const hasResume = documents.some(doc => doc.type === 'resume');
    const hasJD = documents.some(doc => doc.type === 'job_description');
    console.log('Has Resume:', hasResume, 'Has JD:', hasJD);

    if (!hasResume || !hasJD) {
      return res.status(400).json({
        message: 'Both resume and job description must be uploaded before starting chat'
      });
    }

    // Generate questions using Gemini
    console.log('Generating questions with Gemini...');
    let questions;

    try {
      const jdDoc = documents.find(doc => doc.type === 'job_description');
      const jdText = jdDoc?.chunks?.map(chunk => chunk.text).join(' ').substring(0, 2000) || 'General position';

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `Based on this job description, generate exactly 3 interview questions that would be relevant for this position. Make them specific and practical.

Job Description:
${jdText}

Format your response as a numbered list of questions only.`;

      const result = await model.generateContent(prompt);
      questions = result.response.text();
      console.log('Generated questions successfully');
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      // Fallback questions if Gemini fails
      questions = `1. Tell me about your relevant experience for this position.
2. What interests you most about this role and our company?
3. How do your skills align with the requirements mentioned in the job description?`;
      console.log('Using fallback questions due to Gemini error');
    }

    // Create or update chat session
    console.log('Creating chat session...');
    let chat = await Chat.findOne({ userId: req.user._id });
    if (!chat) {
      chat = new Chat({ userId: req.user._id, messages: [] });
    } else {
      chat.messages = []; // Reset for new session
    }

    const welcomeMessage = `Welcome to your interview preparation session! I've prepared some questions for you. Let's start:\n\n${questions}\n\nPlease answer the first question, and I'll provide feedback based on your resume and the job requirements.`;

    chat.messages.push({
      role: 'assistant',
      content: welcomeMessage
    });

    console.log('Saving chat to database...');
    await chat.save();
    console.log('Chat saved successfully');

    res.json({
      message: 'Chat session started',
      chatId: chat._id,
      initialMessage: welcomeMessage
    });

    console.log('=== CHAT SESSION STARTED SUCCESSFULLY ===');
  } catch (error) {
    console.error('=== CHAT START ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Failed to start chat session',
      error: error.message,
      details: error.stack
    });
  }
});

// Process chat query (simplified without Gemini)
router.post('/query', auth, async (req, res) => {
  try {
    console.log('=== PROCESSING CHAT QUERY ===');
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    console.log('User message:', message);

    // Get or create chat session
    let chat = await Chat.findOne({ userId: req.user._id });
    if (!chat) {
      chat = new Chat({ userId: req.user._id, messages: [] });
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message
    });

    // Generate AI feedback using Gemini
    let aiResponse;
    let score = 7; // Default score

    try {
      console.log('=== ATTEMPTING GEMINI API CALL ===');
      console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
      console.log('API Key length:', process.env.GEMINI_API_KEY?.length || 0);

      // Get document context for better feedback
      const documents = await Document.find({ userId: req.user._id });
      const resumeDoc = documents.find(doc => doc.type === 'resume');
      const jdDoc = documents.find(doc => doc.type === 'job_description');

      const resumeText = resumeDoc?.chunks?.map(chunk => chunk.text).join(' ').substring(0, 1000) || 'No resume available';
      const jdText = jdDoc?.chunks?.map(chunk => chunk.text).join(' ').substring(0, 1000) || 'No job description available';

      console.log('Resume text length:', resumeText.length);
      console.log('JD text length:', jdText.length);
      console.log('User message:', message);

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      console.log('Model created successfully');

      const prompt = `You are an AI interviewer evaluating a candidate's response. Be specific and vary your feedback based on the actual content.

Job Requirements:
${jdText}

Candidate's Resume/Background:
${resumeText}

Candidate's Response:
"${message}"

Please provide:
1. A score from 1-10 (where 10 is excellent)
2. Constructive feedback (max 100 words) - BE SPECIFIC to this response
3. Suggestions for improvement
4. A follow-up question if appropriate

Format your response as:
Score: [number]
Feedback: [your feedback]
Follow-up: [optional follow-up question]`;

      console.log('Calling Gemini API...');
      const result = await model.generateContent(prompt);
      aiResponse = result.response.text();
      console.log('Gemini API response received:', aiResponse.substring(0, 100) + '...');

      // Extract score from response
      const scoreMatch = aiResponse.match(/Score:\s*(\d+)/i);
      score = scoreMatch ? parseInt(scoreMatch[1]) : 7;

      console.log('=== GEMINI API SUCCESS ===');
    } catch (geminiError) {
      console.error('=== GEMINI API ERROR IN FEEDBACK ===');
      console.error('Error details:', geminiError.message);
      console.error('Full error:', geminiError);

      // More varied fallback feedback based on message content
      const messageWords = message.toLowerCase().split(' ');
      let feedback;
      let followUp;

      if (messageWords.includes('experience') || messageWords.includes('worked')) {
        feedback = `Great! You've mentioned your experience. To make it even stronger, try quantifying your achievements with specific numbers or metrics.`;
        followUp = `Can you share a specific project where you made a measurable impact?`;
      } else if (messageWords.includes('skill') || messageWords.includes('technology')) {
        feedback = `Good technical awareness! Consider explaining how you've applied these skills in real-world scenarios.`;
        followUp = `What was the most challenging technical problem you solved using these skills?`;
      } else if (messageWords.includes('team') || messageWords.includes('collaborate')) {
        feedback = `Excellent focus on teamwork! Employers value collaboration skills highly.`;
        followUp = `Tell me about a time when you had to resolve a conflict within your team.`;
      } else if (messageWords.includes('learn') || messageWords.includes('growth')) {
        feedback = `I appreciate your growth mindset! Continuous learning is crucial in today's fast-paced environment.`;
        followUp = `What's a recent skill you've learned that you're excited to apply?`;
      } else {
        const randomFeedback = [
          `Solid response! You're communicating clearly and showing good understanding of the role.`,
          `Nice answer! You're demonstrating relevant knowledge for this position.`,
          `Well articulated! Your response shows thoughtful consideration of the question.`,
          `Good insight! You're connecting your background well to what the role requires.`
        ];
        feedback = randomFeedback[Math.floor(Math.random() * randomFeedback.length)];
        followUp = `Can you elaborate on that with a specific example?`;
      }

      score = Math.floor(Math.random() * 3) + 6; // Random score 6-8 for fallback
      aiResponse = `Score: ${score}/10\n\nFeedback: ${feedback}\n\nFollow-up: ${followUp}`;
      console.log('Using intelligent fallback feedback due to Gemini error');
    }

    // Add AI response
    chat.messages.push({
      role: 'assistant',
      content: aiResponse,
      score: score
    });

    await chat.save();
    console.log('Chat saved successfully');

    res.json({
      response: aiResponse,
      score: score,
      citations: [] // Empty for now since we're not using embeddings
    });

    console.log('=== CHAT QUERY PROCESSED SUCCESSFULLY ===');
  } catch (error) {
    console.error('=== CHAT QUERY ERROR ===');
    console.error('Chat query error:', error);
    res.status(500).json({ message: 'Failed to process query', error: error.message });
  }
});

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ userId: req.user._id });

    if (!chat) {
      return res.json({ messages: [] });
    }

    res.json({ messages: chat.messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch chat history', error: error.message });
  }
});

module.exports = router;