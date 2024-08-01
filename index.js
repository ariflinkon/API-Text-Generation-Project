const { HfInference } = require("@huggingface/inference");
const readline = require('readline');

const inference = new HfInference("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");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Please enter your message: ', async (userInput) => {
  for await (const chunk of inference.chatCompletionStream({
    model: "meta-llama/Meta-Llama-3-8B-Instruct",
    messages: [{ role: "user", content: userInput }],
    max_tokens: 8000,
  })) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
  rl.close();
}); 