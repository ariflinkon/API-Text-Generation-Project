const chatMessages = document.getElementById('chat-messages');

document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageInput = document.getElementById('message');
  const message = messageInput.value;

  // Append user message
  appendMessage('You', message);

  const response = await fetch('/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });

  const data = await response.json();
  
  // Append AI response
  appendMessage('AI', data.response);

  // Clear input
  messageInput.value = '';
});

function appendMessage(sender, text) {
  const messageElement = document.createElement('div');
  messageElement.className = `mb-2 ${sender === 'You' ? 'text-right' : 'text-left'}`;
  messageElement.innerHTML = `
    <span class="inline-block px-2 py-1 rounded-lg ${sender === 'You' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}">
      <strong>${sender}:</strong> ${text}
    </span>
  `;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
