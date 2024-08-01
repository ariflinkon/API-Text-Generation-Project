const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
/* const MongoClient = require('mongodb').MongoClient; */
const { HfInference } = require("@huggingface/inference");
const path = require('path');

const app = express();
const port = 3000;

const inference = new HfInference("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");

// MongoDB connection URL and database name
const mongoUrl = 'mongodb+srv://ariflinkon:GVrC7PlBzYrtxzn8@cluster0.ptir0ud.mongodb.net/';
const dbName = 'textgenerationdb';

let db;

// Connect to MongoDB
MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
  .then((client) => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
  });

app.use(bodyParser.json());

// Serve the HTML file for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/chat', async (req, res) => {
  const userInput = req.body.message;
  let responseText = '';

  for await (const chunk of inference.chatCompletionStream({
    model: "meta-llama/Meta-Llama-3-8B-Instruct",
    messages: [{ role: "user", content: userInput }],
    max_tokens: 8000,
  })) {
    responseText += chunk.choices[0]?.delta?.content || "";
  }

  // Store user message and AI response in MongoDB
  const chatCollection = db.collection('chats');
  await chatCollection.insertOne({
    user: 'You',
    message: userInput,
    response: responseText,
    timestamp: new Date(),
  });

  res.json({ response: responseText });
});

app.listen(port, () => {
  console.log(`Server is running`);
});