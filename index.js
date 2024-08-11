const chatMessages = document.getElementById('chat-messages');
const loader = document.getElementById('loader');
const chatContainer = document.querySelector('.chat-container');

document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageInput = document.getElementById('message');
  const message = messageInput.value.trim();

  if (!message) return;

  // Append user message
  appendMessage('user', message);

  // Clear input
  messageInput.value = '';

  // Show loader
  loader.style.display = 'block';

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    // Append AI response
    appendMessage('ai', data.response);
  } catch (error) {
    console.error('Error:', error);
    appendMessage('ai', 'Sorry, there was an error processing your request.');
  } finally {
    // Hide loader
    loader.style.display = 'none';
  }
});

function appendMessage(sender, text) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}`;
  messageElement.innerHTML = `<p><strong>${sender === 'user' ? 'You' : 'AI'}:</strong> ${text.replace(/\n/g, '<br>')}</p>`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show loader in the middle of the chat container
chatContainer.appendChild(loader);