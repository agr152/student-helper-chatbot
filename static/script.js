document.getElementById("chat-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        // Prevent default action of Enter key (new line or form submission)
        event.preventDefault();
        
        // Call the sendMessage function when Enter is pressed
        sendMessage();
    }
});


function sendMessage() {
    const userInput = document.getElementById("chat-input").value.trim();
    if (!userInput) return;

    // Display user message
    const chatBox = document.getElementById("chat-messages");
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = userInput;
    chatBox.appendChild(userMessage);

    // Display loading message for the bot
    const loadingMessage = document.createElement("div");
    loadingMessage.className = "bot-message";
    loadingMessage.textContent = "Loading...";  // You can style it as you wish
    chatBox.appendChild(loadingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Clear input
    document.getElementById("chat-input").value = "";

    // Send the query to the backend
    fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: userInput })
    })
        .then(response => response.json())
        .then(data => {
            // Replace loading message with bot response
            loadingMessage.textContent = data.answer || "Error: Unable to get a response.";
            chatBox.scrollTop = chatBox.scrollHeight;
        })
        .catch(error => {
            // Replace loading message with error message
            loadingMessage.textContent = "Error: Unable to reach the server.";
            chatBox.scrollTop = chatBox.scrollHeight;
        });
}


//---------------------------------------------------------------------------------------------
function openLoginForm() {
    document.getElementById('login-form-container').style.display = 'flex';
}

function closeLoginForm() {
    document.getElementById('login-form-container').style.display = 'none';
}

function submitLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        alert('Logged in as ' + username);
        closeLoginForm();
    } else {
        alert('Please enter both username and password');
    }
}

//--------------------------------------------------------------------------------

