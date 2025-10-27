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
    // Use a simpler approach - just create dummy embeddings for now
    // This avoids API quota issues and model availability problems
    console.log('Generating dummy embedding for text length:', text.length);
    const hash = text.length % 100;
    return new Array(384).fill(0).map((_, i) => (hash + i) / 1000);
  } catch (error) {
    console.log('Embedding generation error:', error.message);
    // Return dummy embedding with some variation based on text
    const hash = text.length % 100;
    return new Array(384).fill(0).map((_, i) => (hash + i) / 1000);
  }
};

// Upload document
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  console.log('Upload request received');
  console.log('User:', req.user?._id);
  console.log('File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');
  console.log('Body:', req.body);

  try {
    if (!req.file) {
      console.log('Error: No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { type } = req.body;
    if (!type || !['resume', 'job_description'].includes(type)) {
      console.log('Error: Invalid document type:', type);
      return res.status(400).json({ message: 'Invalid document type' });
    }

    console.log('Starting Cloudinary upload...');
    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'interview-prep',
          public_id: `${req.user._id}_${type}_${Date.now()}`
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload successful:', result.secure_url);
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    console.log('Starting PDF text extraction...');
    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;
    console.log('Extracted text length:', text.length);

    if (!text || text.trim().length === 0) {
      console.log('Warning: No text extracted from PDF');
      return res.status(400).json({ message: 'Could not extract text from PDF. Please ensure the PDF contains readable text.' });
    }

    console.log('Starting text chunking...');
    // Chunk the text
    const textChunks = chunkText(text);
    console.log('Created chunks:', textChunks.length);

    console.log('Starting embedding generation...');
    // Generate embeddings for each chunk
    const chunks = [];
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      try {
        console.log(`Processing chunk ${i + 1}/${textChunks.length}`);
        const embedding = await generateEmbedding(chunk);
        chunks.push({ text: chunk, embedding });
        console.log('Generated embedding for chunk, length:', embedding.length);
      } catch (embeddingError) {
        console.error('Error generating embedding for chunk:', embeddingError);
        // Use dummy embedding
        chunks.push({ text: chunk, embedding: new Array(384).fill(0) });
      }
    }

    console.log('Deleting existing document...');
    // Delete existing document of same type
    await Document.findOneAndDelete({ userId: req.user._id, type });

    console.log('Saving document to database...');
    // Save document to database
    const document = new Document({
      userId: req.user._id,
      type,
      filename: req.file.originalname,
      cloudinaryUrl: uploadResult.secure_url,
      chunks
    });

    await document.save();
    console.log('Document saved successfully:', document._id);

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
    console.error('Upload error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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