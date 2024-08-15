const loader = document.getElementById('loader'); // Element to show loading spinner
const chatMessages = document.getElementById('chat-messages'); // Element to display chat messages
const chatHistory = document.getElementById('chat-history'); // Element to display chat history
let currentChatId = null; // Variable to keep track of the current chat ID

// Load chat history when the window loads
window.onload = async () => {
  await loadChatHistory();
};

// Function to load chat history from the server
async function loadChatHistory() {
  const response = await fetch('/chats'); // Fetch chat history from the server
  const data = await response.json(); // Parse the response as JSON

  chatHistory.innerHTML = ''; // Clear the chat history element
  data.chats.forEach(chat => {
    const li = document.createElement('li'); // Create a list item for each chat
    li.innerHTML = `
      Chat on ${new Date(chat.timestamp).toLocaleString()} 
      <span class="delete-icon" onclick="deleteChat('${chat._id}')" style="color: grey; float: right;">
        <i class="fa fa-trash"></i>
      </span>
    `; // Set the inner HTML of the list item
    li.onclick = () => loadChat(chat._id); // Set the click event to load the chat
    chatHistory.appendChild(li); // Append the list item to the chat history element
  });
}

// Function to load a specific chat by ID
async function loadChat(chatId) {
  const response = await fetch(`/chats/${chatId}`); // Fetch the chat data from the server
  const data = await response.json(); // Parse the response as JSON

  chatMessages.innerHTML = ''; // Clear the chat messages element
  currentChatId = chatId; // Set the current chat ID
  data.messages.forEach(message => {
    appendMessage(message.sender, message.text); // Append each message to the chat messages element
  });
}

// Function to delete a specific chat by ID
async function deleteChat(chatId) {
  await fetch(`/chats/${chatId}`, {
    method: 'DELETE'
  }); // Send a DELETE request to the server
  await loadChatHistory(); // Reload the chat history
}

// Function to append a message to the chat messages element
function appendMessage(sender, text) {
  const messageElement = document.createElement('div'); // Create a div element for the message
  messageElement.className = `message ${sender}`; // Set the class name based on the sender

  if (sender === 'user') {
    const textLength = text.length; // Get the length of the text
    messageElement.style.backgroundColor = '#f7f7f7'; // Set the background color for user messages
    messageElement.style.width = `auto`; // Set the width based on the text length
    messageElement.style.margin = '0 auto'; // Center the user message
  }

 messageElement.innerHTML = `<p><strong><span style="border-radius: 50%; padding: 7px; background-color: #f0f0f0;">${sender === 'user' ? '<i class="fa fa-user"></i>' : '<i class="fa fa-robot"></i>'}</span> </strong> ${text.replace(/\n/g, '<br>')}</p>`;// Set the inner HTML of the message element
  chatMessages.appendChild(messageElement); // Append the message element to the chat messages element
  chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom of the chat messages element
}
// Create and style the modal for deleting all chats
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
document.body.appendChild(modal); // Append the modal to the body

// Create and style the overlay for the modal
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
document.body.appendChild(overlay); // Append the overlay to the body

// Event listener for the delete-all button
document.getElementById('delete-all').addEventListener('click', () => {
  modal.style.display = 'block'; // Show the modal
  overlay.style.display = 'block'; // Show the overlay
});

// Event listener for the confirm-delete button
document.getElementById('confirm-delete').addEventListener('click', async () => {
  try {
    document.getElementById('loader').style.display = 'block'; // Show the loader

    const response = await fetch('/chats'); // Fetch all chats from the server
    const data = await response.json(); // Parse the response as JSON

    for (const chat of data.chats) {
      await fetch(`/chats/${chat._id}`, {
        method: 'DELETE'
      }); // Send a DELETE request for each chat
    }
    await loadChatHistory(); // Reload the chat history
    const successMessage = document.createElement('div'); // Create a success message element
    successMessage.className = 'bg-green-500 text-white p-4 rounded mb-4 fixed top-0 left-1/2 transform -translate-x-1/2';
    successMessage.innerText = 'All chats have been deleted.';
    document.body.appendChild(successMessage); // Append the success message to the body
    setTimeout(() => successMessage.remove(), 3000); // Remove the success message after 3 seconds
  } catch (error) {
    console.error('Error:', error); // Log the error
    const errorMessage = document.createElement('div'); // Create an error message element
    errorMessage.className = 'bg-red-500 text-white p-4 rounded mb-4 fixed top-0 left-1/2 transform -translate-x-1/2';
    errorMessage.innerText = 'Sorry, there was an error deleting all chats.';
    document.body.appendChild(errorMessage); // Append the error message to the body
    setTimeout(() => errorMessage.remove(), 3000); // Remove the error message after 3 seconds
  } finally {
    document.getElementById('loader').style.display = 'none'; // Hide the loader
    modal.style.display = 'none'; // Hide the modal
    overlay.style.display = 'none'; // Hide the overlay
  }
});

// Event listener for the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loader').style.display = 'none'; // Hide the loader
});

// Event listener for the cancel-delete button
document.getElementById('cancel-delete').addEventListener('click', () => {
  modal.style.display = 'none'; // Hide the modal
  overlay.style.display = 'none'; // Hide the overlay
});

// Event listener for the new-chat button
document.getElementById('new-chat').addEventListener('click', () => {
  currentChatId = null; // Reset the current chat ID
  chatMessages.innerHTML = ''; // Clear the chat messages element
  document.getElementById('chat-title').style.display = 'block'; // Show the "Chat with AI" text
});

// Event listener for the chat form submission
document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent the default form submission
  const messageInput = document.getElementById('message'); // Get the message input element
  const message = messageInput.value.trim(); // Get the trimmed value of the message input

  if (!message) return; // If the message is empty, return

  appendMessage('user', message); // Append the user's message

  messageInput.value = ''; // Clear the message input

  try {
    document.getElementById('loader').style.display = 'block'; // Show the loader
    document.getElementById('chat-title').style.pointerEvents = 'none'; // Disable the "Chat with AI" text
    document.getElementById('chat-title').style.display = 'none'; // Hide the "Chat with AI" text

    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, chatId: currentChatId })
    }); // Send a POST request to the server with the message and chat ID

    const data = await response.json(); // Parse the response as JSON

    appendMessage('ai', data.response); // Append the AI's response
    currentChatId = data.chatId; // Set the current chat ID
    await loadChatHistory(); // Reload the chat history
  } catch (error) {
    console.error('Error:', error); // Log the error
    appendMessage('ai', 'Sorry, there was an error processing your request.'); // Append an error message
  } finally {
    document.getElementById('loader').style.display = 'none'; // Hide the loader
    document.getElementById('chat-title').style.pointerEvents = 'auto'; // Enable the "Chat with AI" text
  }
});