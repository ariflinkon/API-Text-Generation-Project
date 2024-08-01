const express = require('express');
const bodyParser = require('body-parser');
const { HfInference } = require("@huggingface/inference");
const path = require('path');

const app = express();
const port = 3000;

const inference = new HfInference("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");

app.use(bodyParser.json());
/* app.use(express.static('public')); */

// Serve the HTML file for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, /* 'public',  */'index.html'));
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

  res.json({ response: responseText });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});