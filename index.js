const chatMessages = document.getElementById('chat-messages');

document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageInput = document.getElementById('message');
  const message = messageInput.value;

  // Append user message
  appendMessage('user', message);

  const response = await fetch('/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });

  const data = await response.json();
  
  // Append AI response
  appendMessage('ai', data.response);

  // Clear input
  messageInput.value = '';
});

function appendMessage(sender, text) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}`;
  messageElement.innerHTML = `<p><strong>${sender === 'user' ? 'You' : 'AI'}:</strong> ${text.replace(/\n/g, '<br>')}</p>`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
