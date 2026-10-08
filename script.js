const screenIds = [
  'welcomeScreen',
  'loadingScreen',
  'chooseScreen',
  'chatScreen',
  'finishScreen'
];

const characters = document.querySelectorAll('.choose-card');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');

let currentCharacter = 'Riya';
let conversationHistory = [];


// =========================
// SCREEN SWITCHING
// =========================

function showScreen(screenId) {
  screenIds.forEach((id) => {
    const screen = document.getElementById(id);
    const active = id === screenId;

    screen.hidden = !active;
    screen.classList.toggle('active', active);
  });

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}


// =========================
// ADD MESSAGE TO CHAT
// =========================

function addMessage(text, sender) {
  const bubble = document.createElement('div');

  bubble.className = `message ${sender}`;

  const label = document.createElement('span');

  label.className = 'message-label';

  label.textContent =
    sender === 'bot'
      ? currentCharacter
      : 'You';

  const body = document.createElement('span');

  body.textContent = text;

  bubble.append(label, body);

  messages.appendChild(bubble);

  messages.scrollTop = messages.scrollHeight;
}


// =========================
// AGE CONFIRMATION
// =========================

let ageConfirmed = false;

document.getElementById('enterButton').addEventListener('click', () => {

  if (!ageConfirmed) {

    ageConfirmed = true;

    document.getElementById('gateNote').hidden = false;

    document.getElementById('enterButton').textContent =
      'Continue — I’m 18+';

    return;
  }

  showScreen('loadingScreen');

  window.setTimeout(() => {
    showScreen('chooseScreen');
  }, 1500);

});


// =========================
// CHARACTER SELECTION
// =========================

characters.forEach((card) => {

  card.addEventListener('click', () => {

    currentCharacter = card.dataset.name;

    // Start a completely new conversation
    conversationHistory = [];

    document.getElementById('chatTitle').textContent =
      currentCharacter;

    document.getElementById('chatVibe').textContent =
      `${card.dataset.vibe} · fictional`;

    document.getElementById('chatAvatar').textContent =
      card.dataset.emoji;

    messages.replaceChildren();

    addMessage(
      `Oh, hi. I’m ${currentCharacter}. So, what makes you think you can keep up with me?`,
      'bot'
    );

    showScreen('chatScreen');

    messageInput.focus();

  });

});


// =========================
// AI CHAT
// =========================

document.getElementById('chatForm').addEventListener('submit', async (event) => {

  event.preventDefault();

  const text = messageInput.value.trim();

  if (!text) return;


  // Show user's message
  addMessage(text, 'user');

  messageInput.value = '';

  messageInput.disabled = true;


  // Typing indicator
  const typing = document.createElement('div');

  typing.className = 'message bot';

  typing.textContent =
    `${currentCharacter} is typing...`;

  messages.appendChild(typing);

  messages.scrollTop = messages.scrollHeight;


  try {

    // Send message to Cloudflare Worker
    const response = await fetch(
      'https://floral-base-a99fbhinder-ai.him-writess.workers.dev/chat',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({

          character: currentCharacter,

          message: text,

          history: conversationHistory

        })
      }
    );


    const data = await response.json();


    // Remove typing indicator
    typing.remove();


    if (!response.ok) {

      throw new Error(
        data.error || 'AI request failed'
      );

    }


    // Display AI response
    addMessage(data.reply, 'bot');


    // Save conversation
    conversationHistory.push({
      role: 'user',
      content: text
    });

    conversationHistory.push({
      role: 'assistant',
      content: data.reply
    });


  } catch (error) {

    console.error('AI ERROR:', error);

    typing.remove();

    addMessage(
      'Oops 😭 Something went wrong. Try again.',
      'bot'
    );

  } finally {

    messageInput.disabled = false;

    messageInput.focus();

  }

});


// =========================
// NAVIGATION
// =========================

document
  .getElementById('backButton')
  .addEventListener('click', () => {

    showScreen('chooseScreen');

  });


document
  .getElementById('endButton')
  .addEventListener('click', () => {

    showScreen('finishScreen');

  });


document
  .getElementById('restartButton')
  .addEventListener('click', () => {

    showScreen('chooseScreen');

  }); 
