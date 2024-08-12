const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const { HfInference } = require("@huggingface/inference");
const path = require('path');
require('dotenv').config();                                                   

const app = express();
const port = 3000;

const inference = new HfInference(process.env.HF_API_KEY);

// MongoDB connection URL and database name
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

let db;

// Connect to MongoDB
MongoClient.connect(mongoUrl, {
  tls: true, // Ensure TLS/SSL is enabled
  tlsInsecure: false, // Do not allow insecure connections
  // tlsAllowInvalidCertificates: true, // Uncomment this if you want to allow invalid certificates
})
  .then((client) => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1); // Exit if the database connection fails
  });

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,))); // Adjust the path to serve static files

// Middleware to check if the database is initialized
app.use((req, res, next) => {
  if (!db) {
    return res.status(500).json({ error: 'Database not initialized' });
  }
  next();
});

// Fetch all chats
app.get('/chats', async (req, res) => {
  try {
    const chats = await db.collection('chats').find({}).toArray();
    res.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Fetch a specific chat by ID
app.get('/chats/:id', async (req, res) => {
  const chatId = req.params.id;

  try {
    const chat = await db.collection('chats').findOne({ _id: new ObjectId(chatId) });

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ messages: chat.messages });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// Delete a specific chat by ID
app.delete('/chats/:id', async (req, res) => {
  const chatId = req.params.id;

  try {
    const result = await db.collection('chats').deleteOne({ _id: new ObjectId(chatId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

// Handle chat messages and AI responses
app.post('/chat', async (req, res) => {
  const { message, chatId } = req.body;
  let responseText = '';
  let newChatId = chatId;

  try {
    for await (const chunk of inference.chatCompletionStream({
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      messages: [{ role: "user", content: message }],
      max_tokens: 8000,
    })) {
      responseText += chunk.choices[0]?.delta?.content || "";
    }

    let chat;

    if (chatId) {
      // Update existing chat
      chat = await db.collection('chats').findOneAndUpdate(
        { _id: new ObjectId(chatId) },
        {
          $push: {
            messages: {
              $each: [
                { sender: 'You', text: message },
                { sender: 'AI', text: responseText }
              ]
            }
          }
        },
        { returnDocument: 'after' }
      );
      chat = chat.value; // Extract the updated chat
    } else {
      // Create new chat
      const result = await db.collection('chats').insertOne({
        messages: [
          { sender: 'You', text: message },
          { sender: 'LIN-AI', text: responseText }
        ],
        timestamp: new Date(),
      });

      newChatId = result.insertedId;
      chat = await db.collection('chats').findOne({ _id: newChatId });
    }

    res.json({ response: responseText, chatId: newChatId, chat });
  } catch (error) {
    console.error('Error during AI inference:', error);
    res.status(500).json({ response: 'An error occurred while processing your request.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
