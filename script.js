const startRecordBtn = document.getElementById('start-record-btn');
const responseText = document.getElementById('response-text');
const conversationHistory = document.getElementById('conversation-history');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onstart = function() {
    responseText.innerHTML = 'Listening...';
};

recognition.onspeechend = function() {
    recognition.stop();
};

recognition.onresult = function(event) {
    const userInput = event.results[0][0].transcript;
    responseText.innerHTML = `You said: "${userInput}"`;

    // Send user input to Flask server
    fetch('/process_voice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_input: userInput }),
    })
    .then(response => response.json())
    .then(data => {
        const aiResponse = data.response;
        responseText.innerHTML = `AI Response: "${aiResponse}"`;

        // Update conversation history with both user input and AI response
        updateConversationHistory(data.conversation_history);

        speakResponse(aiResponse);
    })
    .catch(error => {
        responseText.innerHTML = 'Error processing request.';
    });
};

startRecordBtn.addEventListener('click', () => {
    recognition.start();
});

// Update the conversation history section
function updateConversationHistory(history) {
    conversationHistory.innerHTML = '';  // Clear existing history

    history.forEach(entry => {
        const historyEntry = document.createElement('div');
        historyEntry.classList.add('history-entry');

        const userInput = document.createElement('div');
        userInput.classList.add('user-input');
        userInput.innerHTML = `You: ${entry.user}`;

        const aiResponse = document.createElement('div');
        aiResponse.classList.add('ai-response');
        aiResponse.innerHTML = `AI: ${entry.ai}`;

        historyEntry.appendChild(userInput);
        historyEntry.appendChild(aiResponse);

        conversationHistory.appendChild(historyEntry);
    });
}

// Use the SpeechSynthesis API to speak the AI response
function speakResponse(text) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
}
