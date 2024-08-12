
/* Main code start */
const loader = document.getElementById('loader');
const chatMessages = document.getElementById('chat-messages');
const chatHistory = document.getElementById('chat-history');
let currentChatId = null;

// Load chat history on page load
window.onload = async () => {
  await loadChatHistory();
};

// Load chat history
async function loadChatHistory() {
  const response = await fetch('/chats');
  const data = await response.json();

  chatHistory.innerHTML = '';
  data.chats.forEach(chat => {
    const li = document.createElement('li');
    li.innerHTML = `
      Chat on ${new Date(chat.timestamp).toLocaleString()} 
      <span class="delete-icon" onclick="deleteChat('${chat._id}')" style="color: grey; float: right;">
        <i class="fa fa-trash"></i>
      </span>
    `;
    li.onclick = () => loadChat(chat._id);
    chatHistory.appendChild(li);
  });
}
// Load a specific chat
async function loadChat(chatId) {
  const response = await fetch(`/chats/${chatId}`);
  const data = await response.json();

  chatMessages.innerHTML = '';
  currentChatId = chatId;
  data.messages.forEach(message => {
    appendMessage(message.sender, message.text);
  });
}

// Delete a chat
async function deleteChat(chatId) {
  await fetch(`/chats/${chatId}`, {
    method: 'DELETE'
  });
  await loadChatHistory();
}

// Delete all chats
document.getElementById('delete-all').addEventListener('click', async () => {
  if (confirm('Are you sure you want to delete all chats?')) {
    try {
      // Show loader when sending the request
      document.getElementById('loader').style.display = 'block';

      // Get chat history
      const response = await fetch('/chats');
      const data = await response.json();

      // Iterate over each chat and delete the chatId
      for (const chat of data.chats) {
        await fetch(`/chats/${chat._id}`, {
          method: 'DELETE'
        });
      }

      await loadChatHistory(); // Reload chat history to reflect the deletion
      alert('All chats have been deleted.');
    } catch (error) {
      console.error('Error:', error);
      alert('Sorry, there was an error deleting all chats.');
    } finally {
      // Hide loader after processing is complete
      document.getElementById('loader').style.display = 'none';
    }
  }
});

// Start a new chat
document.getElementById('new-chat').addEventListener('click', () => {
  currentChatId = null;
  chatMessages.innerHTML = '';
});

// Ensure the loader is hidden on page load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loader').style.display = 'none';
});

// Handle message submission
document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageInput = document.getElementById('message');
  const message = messageInput.value.trim();

  if (!message) return;

  // Append user message
  appendMessage('user', message);

  // Clear input
  messageInput.value = '';

  try {
    // Show loader when sending the request
    document.getElementById('loader').style.display = 'block';

    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, chatId: currentChatId })
    });

    const data = await response.json();

    // Append AI response
    appendMessage('ai', data.response);
    currentChatId = data.chatId;
    await loadChatHistory(); // Reload chat history to reflect the new or updated chat
  } catch (error) {
    console.error('Error:', error);
    appendMessage('ai', 'Sorry, there was an error processing your request.');
  } finally {
    // Hide loader after processing is complete
    document.getElementById('loader').style.display = 'none';
  }
});

function appendMessage(sender, text) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}`;
  messageElement.innerHTML = `<p><strong>${sender === 'user' ? 'You' : 'LIN-AI'}:</strong> ${text.replace(/\n/g, '<br>')}</p>`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}