const screenIds = [
  'welcomeScreen',
  'loadingScreen',
  'chooseScreen',
  'chatScreen',
  'finishScreen'
];

const characters =
  document.querySelectorAll('.choose-card');

const messages =
  document.getElementById('messages');

const messageInput =
  document.getElementById('messageInput');

let currentCharacter = 'Mika';

let conversationHistory = [];


// =========================
// SCREEN SWITCHING
// =========================

function showScreen(screenId) {

  screenIds.forEach((id) => {

    const screen =
      document.getElementById(id);

    if (!screen) return;

    const active =
      id === screenId;

    screen.hidden = !active;

    screen.classList.toggle(
      'active',
      active
    );

  });

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}


// =========================
// ADD MESSAGE
// =========================

function addMessage(text, sender) {

  const bubble =
    document.createElement('div');

  bubble.className =
    `message ${sender}`;

  const label =
    document.createElement('span');

  label.className =
    'message-label';

  label.textContent =
    sender === 'bot'
      ? currentCharacter
      : 'You';

  const body =
    document.createElement('span');

  body.textContent = text;

  bubble.appendChild(label);

  bubble.appendChild(body);

  messages.appendChild(bubble);

  messages.scrollTop =
    messages.scrollHeight;

  return {
    bubble,
    body
  };
}


// =========================
// AGE CONFIRMATION
// =========================

let ageConfirmed = false;

document
  .getElementById('enterButton')
  .addEventListener('click', () => {

    if (!ageConfirmed) {

      ageConfirmed = true;

      const gateNote =
        document.getElementById('gateNote');

      gateNote.hidden = false;

      document
        .getElementById('enterButton')
        .textContent =
        'Continue — I’m 18+';

      return;
    }

    showScreen('loadingScreen');

    setTimeout(() => {

      showScreen('chooseScreen');

    }, 1000);

  });


// =========================
// CHARACTER SELECTION
// =========================

characters.forEach((card) => {

  card.addEventListener('click', () => {

    currentCharacter =
      card.dataset.name;

    conversationHistory = [];

    const name =
      card.dataset.name;

    const vibe =
      card.dataset.vibe;

    const image =
      card.dataset.image;


    // Update chat name

    document
      .getElementById('chatTitle')
      .textContent = name;


    // Update vibe

    document
      .getElementById('chatVibe')
      .textContent =
      `${vibe} · fictional`;


    // Update profile picture

    const chatAvatar =
      document.getElementById('chatAvatar');

    if (chatAvatar) {

      // Supports both emoji divs and img elements

      if (
        chatAvatar.tagName === 'IMG'
      ) {

        chatAvatar.src = image;

      } else {

        chatAvatar.innerHTML = '';

        const img =
          document.createElement('img');

        img.src = image;

        img.alt =
          `${name} profile picture`;

        img.className =
          'avatar-image';

        chatAvatar.appendChild(img);

      }

    }


    // Clear old messages

    messages.replaceChildren();


    // Opening message

    addMessage(
      `Oh, hi. I’m ${name}. So, what makes you think you can keep up with me?`,
      'bot'
    );


    // Open chat

    showScreen('chatScreen');

    messageInput.focus();

  });

});


// =========================
// STREAMING AI CHAT
// =========================

document
  .getElementById('chatForm')
  .addEventListener(
    'submit',
    async (event) => {

      event.preventDefault();

      const text =
        messageInput.value.trim();

      if (!text) return;


      // Display user's message

      addMessage(
        text,
        'user'
      );

      messageInput.value = '';

      messageInput.disabled = true;


      // Temporary typing indicator

      const typing =
        document.createElement('div');

      typing.className =
        'message bot';

      typing.textContent =
        `${currentCharacter} is thinking...`;

      messages.appendChild(typing);

      messages.scrollTop =
        messages.scrollHeight;


      try {

        const response =
          await fetch(
            'https://floral-base-a99fbhinder-ai.him-writess.workers.dev/chat',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json'
              },

              body: JSON.stringify({

                character:
                  currentCharacter,

                message:
                  text,

                history:
                  conversationHistory

              })
            }
          );


        if (!response.ok) {

          let errorMessage =
            'AI request failed';

          try {

            const errorData =
              await response.json();

            errorMessage =
              errorData.error ||
              errorMessage;

          } catch (_) {}

          throw new Error(
            errorMessage
          );
        }


        if (!response.body) {

          throw new Error(
            'Streaming is not supported by this response.'
          );

        }


        // Remove typing indicator

        typing.remove();


        // Create empty bot message

        const botMessage =
          addMessage(
            '',
            'bot'
          );

        const botBody =
          botMessage.body;


        // Read stream

        const reader =
          response.body.getReader();

        const decoder =
          new TextDecoder();

        let fullReply = '';

        while (true) {

          const {
            value,
            done
          } = await reader.read();

          if (done) break;


          const chunk =
            decoder.decode(
              value,
              {
                stream: true
              }
            );

          fullReply += chunk;

          botBody.textContent =
            fullReply;

          messages.scrollTop =
            messages.scrollHeight;
        }


        // Flush decoder

        fullReply +=
          decoder.decode();


        if (!fullReply.trim()) {

          throw new Error(
            'AI returned an empty response.'
          );

        }


        // Save conversation

        conversationHistory.push({

          role: 'user',

          content: text

        });

        conversationHistory.push({

          role: 'assistant',

          content: fullReply

        });


      } catch (error) {

        console.error(
          'AI ERROR:',
          error
        );

        typing.remove();

        addMessage(
          'Oops 😭 Something went wrong. Try again.',
          'bot'
        );

      } finally {

        messageInput.disabled =
          false;

        messageInput.focus();

      }

    }
  );


// =========================
// BACK BUTTON
// =========================

document
  .getElementById('backButton')
  .addEventListener('click', () => {

    showScreen(
      'chooseScreen'
    );

  });


// =========================
// END CHAT
// =========================

document
  .getElementById('endButton')
  .addEventListener('click', () => {

    showScreen(
      'finishScreen'
    );

  });


// =========================
// RESTART
// =========================

document
  .getElementById('restartButton')
  .addEventListener('click', () => {

    conversationHistory = [];

    showScreen(
      'chooseScreen'
    );

  });
