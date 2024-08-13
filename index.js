
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
// Create a modal for delete confirmation
const modal = document.createElement('div');
modal.id = 'delete-modal';
modal.style.display = 'none';
modal.style.position = 'fixed';
modal.style.top = '50%';
modal.style.left = '50%';
modal.style.transform = 'translate(-50%, -50%)';
modal.style.backgroundColor = 'white';
modal.style.padding = '20px';
modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
modal.style.zIndex = '1000';
modal.className = 'bg-white p-6 rounded-lg shadow-lg';
modal.innerHTML = `
  <p class="mb-4">Are you sure you want to delete all chats?</p>
  <div class="flex justify-end">
    <button id="confirm-delete" class="mr-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">Delete</button>
    <button id="cancel-delete" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700">Cancel</button>
  </div>
`;
document.body.appendChild(modal);

// Create an overlay for the modal
const overlay = document.createElement('div');
overlay.id = 'overlay';
overlay.style.display = 'none';
overlay.style.position = 'fixed';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100%';
overlay.style.height = '100%';
overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
overlay.style.zIndex = '999';
document.body.appendChild(overlay);

document.getElementById('delete-all').addEventListener('click', () => {
  modal.style.display = 'block';
  overlay.style.display = 'block';
});

document.getElementById('confirm-delete').addEventListener('click', async () => {
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
    modal.style.display = 'none';
    overlay.style.display = 'none';
  }
});

document.getElementById('cancel-delete').addEventListener('click', () => {
  modal.style.display = 'none';
  overlay.style.display = 'none';
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