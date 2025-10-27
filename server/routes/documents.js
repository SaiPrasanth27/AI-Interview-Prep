const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');
const Document = require('../models/Document');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Helper function to chunk text
const chunkText = (text, maxWords = 500) => {
  const words = text.split(' ');
  const chunks = [];
  
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  
  return chunks;
};

// Helper function to generate embeddings (simplified)
const generateEmbedding = async (text) => {
  try {
    // Try to use Gemini embedding, but fallback to dummy if quota exceeded
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.log('Embedding API error, using dummy embedding:', error.message);
    // Return dummy embedding with some variation based on text
    const hash = text.length % 100;
    return new Array(384).fill(0).map((_, i) => (hash + i) / 1000);
  }
};

// Upload document
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { type } = req.body;
    if (!type || !['resume', 'job_description'].includes(type)) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'interview-prep',
          public_id: `${req.user._id}_${type}_${Date.now()}`
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;
    console.log('Extracted text length:', text.length);

    // Chunk the text
    const textChunks = chunkText(text);
    console.log('Created chunks:', textChunks.length);

    // Generate embeddings for each chunk
    const chunks = [];
    for (const chunk of textChunks) {
      try {
        const embedding = await generateEmbedding(chunk);
        chunks.push({ text: chunk, embedding });
        console.log('Generated embedding for chunk, length:', embedding.length);
      } catch (embeddingError) {
        console.error('Error generating embedding for chunk:', embeddingError);
        // Skip this chunk or use dummy embedding
        chunks.push({ text: chunk, embedding: new Array(384).fill(0) });
      }
    }

    // Delete existing document of same type
    await Document.findOneAndDelete({ userId: req.user._id, type });

    // Save document to database
    const document = new Document({
      userId: req.user._id,
      type,
      filename: req.file.originalname,
      cloudinaryUrl: uploadResult.secure_url,
      chunks
    });

    await document.save();

    res.json({
      message: 'Document uploaded successfully',
      document: {
        id: document._id,
        type: document.type,
        filename: document.filename,
        uploadedAt: document.createdAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// List documents
router.get('/list', auth, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .select('type filename createdAt')
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch documents', error: error.message });
  }
});

// Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete from Cloudinary
    const publicId = document.cloudinaryUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`interview-prep/${publicId}`, { resource_type: 'raw' });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete document', error: error.message });
  }
});

module.exports = router;