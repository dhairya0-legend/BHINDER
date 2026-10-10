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

// Opening line for each character
const openingLines = {
  Mika: "Hm. You showed up. Try not to say anything silly in the first minute.",
  Shiori: "Oh, a new visitor! Sit down. I'll tease you first and help you later, maybe.",
  Mina: "WAIT\u2014you're actually here?! Okay, tell me everything. Anime opinions, go!",
  Makima: "Interesting. You came all the way here. Go on, say something.",
  Rani: "Oh look, a new contestant. Send your best line. I'm scoring it out of 10 and I'm stingy.",
  Tanvi: "Finally someone to roast. Don't worry, I only do this to people I find interesting. Probably.",
  Dolly: "You're late. I was starting to think you'd found someone else. Did you? Tell me the truth.",
  Chhavi: "Rule 1: tell me something true. Rule 2: I'll make up Rule 2 later. Go!"
};

// Categories that need the "crazy zone" warning before chatting
const warnedCategories = ['crazy-girls'];


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

  updateMenuActive(screenId);

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

// True once the visitor has passed the 18+ screen (the menu cannot skip it)
let ageGatePassed = false;

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

    ageGatePassed = true;

    showScreen('loadingScreen');

    setTimeout(() => {

      showScreen('chooseScreen');

    }, 1000);

  });


// =========================
// CHARACTER SELECTION
// =========================

let crazyWarned = false;

let pendingCard = null;

const crazyWarning =
  document.getElementById('crazyWarning');

function startChat(card) {

  if (
    warnedCategories.includes(card.dataset.category) &&
    !crazyWarned
  ) {

    pendingCard = card;

    crazyWarning.hidden = false;

    document.getElementById('crazyAccept').focus();

    return;
  }

  beginChat(card);
}

document
  .getElementById('crazyAccept')
  .addEventListener('click', () => {

    crazyWarned = true;

    crazyWarning.hidden = true;

    if (pendingCard) beginChat(pendingCard);

    pendingCard = null;

  });

document
  .getElementById('crazyDecline')
  .addEventListener('click', () => {

    crazyWarning.hidden = true;

    pendingCard = null;

  });

function beginChat(card) {

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
      openingLines[name] ||
      `Oh, hi. I’m ${name}. So, what makes you think you can keep up with me?`,
      'bot'
    );


    // Give the chat this character's colours

    document
      .getElementById('chatScreen')
      .dataset.character = name;


    // Open chat

    showScreen('chatScreen');

    messageInput.focus();

}

characters.forEach((card) => {

  card.addEventListener('click', () => startChat(card));

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
        'message bot typing';

      const typingLabel =
        document.createElement('span');

      typingLabel.className =
        'message-label';

      typingLabel.textContent =
        currentCharacter;

      const typingDots =
        document.createElement('span');

      typingDots.className =
        'typing-dots';

      typingDots.setAttribute(
        'aria-label',
        `${currentCharacter} is typing`
      );

      // Three bouncing dots (fixed text, nothing from the user)

      typingDots.innerHTML =
        '<i></i><i></i><i></i>';

      typing.appendChild(typingLabel);

      typing.appendChild(typingDots);

      messages.appendChild(typing);

      messages.scrollTop =
        messages.scrollHeight;


      let botMessage = null;

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

          let fromWorker = false;

          try {

            const errorData =
              await response.json();

            if (errorData.error) {

              errorMessage =
                errorData.error;

              fromWorker = true;

            }

          } catch (_) {}

          const failure =
            new Error(errorMessage);

          // Messages written by our own Worker are safe to show visitors
          if (fromWorker) {

            failure.userMessage =
              errorMessage;

          }

          throw failure;
        }


        if (!response.body) {

          throw new Error(
            'Streaming is not supported by this response.'
          );

        }


        // Remove typing indicator

        typing.remove();


        // Create empty bot message

        botMessage = addMessage('', 'bot');

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

        // Don't leave an empty chat bubble behind after an error
        if (botMessage && !botMessage.body.textContent.trim()) {
          botMessage.bubble.remove();
        }

        addMessage(
          error.userMessage ||
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



// =========================
// CATEGORIES
// =========================

// To add a new category later:
//   1. Add a line to this list (id, name, emoji).
//   2. In index.html, add character cards with
//      data-category="your-id" (copy one of the cards in the deck).

const categories = [
  { id: 'anime-fangurls', name: 'Anime Fangurls', emoji: '🌸' },
  { id: 'crazy-girls', name: '2 Crazy Girls', emoji: '🔥' }
];

let currentCategory = categories[0].id;


// =========================
// MENU SIDEBAR
// =========================

const menuButton =
  document.getElementById('menuButton');

const menuDrawer =
  document.getElementById('menuDrawer');

const menuOverlay =
  document.getElementById('menuOverlay');

const menuClose =
  document.getElementById('menuClose');

const menuHome =
  document.getElementById('menuHome');

const categoryList =
  document.getElementById('categoryList');


function openMenu() {

  document.body.classList.add('menu-open');

  menuDrawer.inert = false;

  menuButton.setAttribute('aria-expanded', 'true');

  menuClose.focus();
}


function closeMenu(returnFocus = true) {

  if (!document.body.classList.contains('menu-open')) return;

  document.body.classList.remove('menu-open');

  menuDrawer.inert = true;

  menuButton.setAttribute('aria-expanded', 'false');

  if (returnFocus) menuButton.focus();
}


function updateMenuActive(screenId) {

  menuHome.classList.toggle(
    'is-active',
    screenId === 'welcomeScreen' ||
    screenId === 'loadingScreen'
  );

  const inCategory =
    screenId === 'chooseScreen' ||
    screenId === 'chatScreen';

  categoryList
    .querySelectorAll('.menu-item')
    .forEach((item) => {

      item.classList.toggle(
        'is-active',
        inCategory &&
        item.dataset.category === currentCategory
      );

    });
}


function goHome() {

  closeMenu(false);

  showScreen('welcomeScreen');
}


function openCategory(id) {

  currentCategory = id;

  buildDeck();

  closeMenu(false);

  // The menu can never skip the 18+ screen

  if (!ageGatePassed) {

    showScreen('welcomeScreen');

    return;
  }

  showScreen('chooseScreen');
}


function renderCategoryList() {

  categoryList.replaceChildren();

  categories.forEach((category) => {

    const count =
      Array.from(characters).filter(
        (card) => card.dataset.category === category.id
      ).length;

    const item =
      document.createElement('button');

    item.type = 'button';

    item.className = 'menu-item';

    item.dataset.category = category.id;

    const emoji =
      document.createElement('span');

    emoji.className = 'menu-emoji';

    emoji.textContent = category.emoji;

    emoji.setAttribute('aria-hidden', 'true');

    const label =
      document.createElement('span');

    label.textContent = category.name;

    const badge =
      document.createElement('span');

    badge.className = 'menu-count';

    badge.textContent = String(count);

    item.append(emoji, label, badge);

    item.addEventListener(
      'click',
      () => openCategory(category.id)
    );

    categoryList.appendChild(item);

  });
}


menuButton.addEventListener('click', openMenu);

menuClose.addEventListener('click', () => closeMenu());

menuOverlay.addEventListener('click', () => closeMenu());

menuHome.addEventListener('click', goHome);

document
  .getElementById('brandLink')
  .addEventListener('click', (event) => {

    event.preventDefault();

    goHome();

  });


// =========================
// SWIPEABLE CHARACTER DECK
// =========================

const deck =
  document.getElementById('deck');

const deckWrap =
  deck.parentElement;

const deckDots =
  document.getElementById('deckDots');

// How far to drag (px) before it counts as a swipe,
// or how fast a quick flick has to be (px per ms)

const SWIPE_DISTANCE = 90;

const SWIPE_SPEED = 0.55;

let deckOrder = [];     // cards in this category, top card first

let deckBusy = false;   // true while a card is flying away

let drag = null;        // the drag in progress

let swallowClick = false;   // stops the end of a drag from also "tapping" the card


function setImportant(element, styles) {

  Object.entries(styles).forEach(([property, value]) => {

    element.style.setProperty(property, value, 'important');

  });
}


function resetCardStyles(card) {

  ['transform', 'transition', 'opacity'].forEach((property) => {

    card.style.removeProperty(property);

  });

  card.querySelectorAll('.swipe-stamp').forEach((stamp) => {

    stamp.style.removeProperty('opacity');

  });
}


function renderDeck() {

  deckOrder.forEach((card, index) => {

    card.dataset.pos = String(index);

    card.tabIndex = index === 0 ? 0 : -1;

    card.setAttribute(
      'aria-hidden',
      index === 0 ? 'false' : 'true'
    );

  });

  const top = deckOrder[0];

  if (!top) return;

  // Tint the buttons and dots with the top character's colour

  const colours = getComputedStyle(top);

  deckWrap.style.setProperty(
    '--accent',
    colours.getPropertyValue('--accent').trim()
  );

  deckWrap.style.setProperty(
    '--accent-2',
    colours.getPropertyValue('--accent-2').trim()
  );

  // One dot per character, in their original order

  const inOrder =
    Array.from(characters).filter(
      (card) => card.dataset.category === currentCategory
    );

  deckDots.replaceChildren(

    ...inOrder.map((card) => {

      const dot =
        document.createElement('i');

      if (card === top) dot.className = 'on';

      return dot;

    })

  );

  deckWrap.classList.toggle(
    'deck-single',
    deckOrder.length < 2
  );
}


function buildDeck() {

  deckOrder =
    Array.from(characters).filter(
      (card) => card.dataset.category === currentCategory
    );

  characters.forEach((card) => {

    if (!deckOrder.includes(card)) {

      card.dataset.pos = 'out';

    }

  });

  renderDeck();
}


// Send the top card flying: right = roast, left = next

function flyAway(direction) {

  const card = deckOrder[0];

  if (!card || deckBusy) return;

  deckBusy = true;

  const roast = direction > 0;

  const stamp =
    card.querySelector(
      roast ? '.stamp-roast' : '.stamp-next'
    );

  if (stamp) stamp.style.opacity = '1';

  setImportant(card, {
    transition: 'transform .32s ease, opacity .32s ease',
    transform: `translate(${direction * 130}%, 6%) rotate(${direction * 22}deg)`,
    opacity: '0'
  });

  setTimeout(() => {

    if (roast) {

      startChat(card);

      resetCardStyles(card);

    } else {

      // First card goes to the back of the pile

      deckOrder.push(deckOrder.shift());

      // ...without flying back across the screen

      setImportant(card, { transition: 'none' });

      card.style.removeProperty('transform');

      renderDeck();

      void card.offsetWidth;

      card.style.removeProperty('transition');

      card.style.removeProperty('opacity');

      card.querySelectorAll('.swipe-stamp').forEach((item) => {

        item.style.removeProperty('opacity');

      });

    }

    deckBusy = false;

  }, 330);
}


// ---- Dragging with finger or mouse ----

deck.addEventListener('pointerdown', (event) => {

  swallowClick = false;

  const card = deckOrder[0];

  if (!card || deckBusy) return;

  if (!card.contains(event.target)) return;

  if (event.pointerType === 'mouse' && event.button !== 0) return;

  drag = {
    card,
    id: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    dx: 0,
    moved: false,
    time: performance.now()
  };

  card.setPointerCapture(event.pointerId);
});


deck.addEventListener('pointermove', (event) => {

  if (!drag || event.pointerId !== drag.id) return;

  const dx = event.clientX - drag.startX;

  const dy = event.clientY - drag.startY;

  drag.dx = dx;

  if (!drag.moved && Math.hypot(dx, dy) > 6) {

    drag.moved = true;

  }

  if (!drag.moved) return;

  setImportant(drag.card, {
    transition: 'none',
    transform: `translate(${dx}px, ${dy * 0.25}px) rotate(${dx / 18}deg)`
  });

  const roastStamp =
    drag.card.querySelector('.stamp-roast');

  const nextStamp =
    drag.card.querySelector('.stamp-next');

  if (roastStamp) {

    roastStamp.style.opacity =
      String(Math.min(Math.max(dx / 110, 0), 1));

  }

  if (nextStamp) {

    nextStamp.style.opacity =
      String(Math.min(Math.max(-dx / 110, 0), 1));

  }
});


deck.addEventListener('pointerup', (event) => {

  if (!drag || event.pointerId !== drag.id) return;

  const { card, dx, moved, time } = drag;

  drag = null;

  // Just a tap: the normal click picks this character

  if (!moved) return;

  swallowClick = true;

  const speed =
    dx / Math.max(performance.now() - time, 1);

  if (dx > SWIPE_DISTANCE || (dx > 35 && speed > SWIPE_SPEED)) {

    flyAway(1);

  } else if (dx < -SWIPE_DISTANCE || (dx < -35 && speed < -SWIPE_SPEED)) {

    flyAway(-1);

  } else {

    resetCardStyles(card);

  }
});


// The browser took over (for example to scroll the page): put the card back

deck.addEventListener('pointercancel', (event) => {

  if (!drag || event.pointerId !== drag.id) return;

  resetCardStyles(drag.card);

  drag = null;
});


// Swallow the click that comes right after a drag

deck.addEventListener('click', (event) => {

  if (!swallowClick) return;

  swallowClick = false;

  event.stopPropagation();

  event.preventDefault();

}, true);


// ---- Buttons and keyboard ----

document
  .getElementById('deckNext')
  .addEventListener('click', () => {

    if (deckOrder.length > 1) flyAway(-1);

  });

document
  .getElementById('deckRoast')
  .addEventListener('click', () => flyAway(1));


document.addEventListener('keydown', (event) => {

  if (event.key === 'Escape') {

    closeMenu();

    return;
  }

  const onChooser =
    !document.getElementById('chooseScreen').hidden;

  if (!onChooser) return;

  if (document.body.classList.contains('menu-open')) return;

  if (event.key === 'ArrowLeft' && deckOrder.length > 1) {

    flyAway(-1);

  }

  if (event.key === 'ArrowRight') {

    flyAway(1);

  }
});


// ---- Set everything up ----

characters.forEach((card) => {

  // The two stamps that show while dragging

  card.insertAdjacentHTML(
    'beforeend',
    '<em class="swipe-stamp stamp-roast" aria-hidden="true">ROAST ME</em>' +
    '<em class="swipe-stamp stamp-next" aria-hidden="true">NEXT</em>'
  );

  const picture = card.querySelector('img');

  if (picture) picture.draggable = false;

});

renderCategoryList();

buildDeck();

updateMenuActive('welcomeScreen');
