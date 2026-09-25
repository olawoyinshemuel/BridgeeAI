// BridgeeAI — Instant Join Client Controller
let currentSession = null;
let languages = [];
let selectedLanguage = null;
let selectedMode = 'read';

// Extract roomId from URL path /join/:roomId or query string
function getRoomIdFromUrl() {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'join' && pathParts[1]) {
    return pathParts[1].toUpperCase();
  }
  const params = new URLSearchParams(window.location.search);
  return params.get('room')?.toUpperCase() || null;
}

// Elements
const activeSessionView = document.getElementById('activeSessionView');
const manualTokenView = document.getElementById('manualTokenView');
const loadingView = document.getElementById('loadingView');

const sessionCard = document.getElementById('sessionCard');
const sessionTemplate = document.getElementById('sessionTemplate');
const sessionRoomToken = document.getElementById('sessionRoomToken');
const sessionTitle = document.getElementById('sessionTitle');
const sessionHost = document.getElementById('sessionHost');

const languageSearch = document.getElementById('languageSearch');
const languageList = document.getElementById('languageList');
const ttsFallbackAlert = document.getElementById('ttsFallbackAlert');
const ttsFallbackText = document.getElementById('ttsFallbackText');

const modeRead = document.getElementById('modeRead');
const modeListen = document.getElementById('modeListen');
const modeReadListen = document.getElementById('modeReadListen');
const enterSessionBtn = document.getElementById('enterSessionBtn');

const tokenForm = document.getElementById('tokenForm');
const manualTokenInput = document.getElementById('manualTokenInput');
const tokenErrorMsg = document.getElementById('tokenErrorMsg');
const quickTokensList = document.getElementById('quickTokensList');

// Fetch and load session
async function init() {
  const roomId = getRoomIdFromUrl();

  if (!roomId) {
    await showManualTokenView();
    return;
  }

  try {
    const res = await fetch(`/api/sessions/${roomId}`);
    const data = await res.json();

    if (!data.success) {
      await showManualTokenView(data.error || 'Session not found');
      return;
    }

    currentSession = data.session;
    languages = data.languages;
    renderSession(currentSession);
    renderLanguages(languages);

    // Select default language (Français or first with audio)
    const defaultLang = languages.find(l => l.code === 'fr-FR') || languages[0];
    selectLanguage(defaultLang);

    loadingView.style.display = 'none';
    manualTokenView.style.display = 'none';
    activeSessionView.style.display = 'block';

  } catch (err) {
    console.error('Failed to load session:', err);
    await showManualTokenView('Unable to connect to session gateway');
  }
}

// Render session information
function renderSession(session) {
  sessionTemplate.textContent = session.template.toUpperCase();
  sessionRoomToken.textContent = `ROOM: ${session.roomId}`;
  sessionTitle.textContent = session.title;
  sessionHost.textContent = session.hostName;
  document.title = `${session.title} — BridgeeAI Instant Join`;
}

// Render language items
function renderLanguages(list) {
  languageList.innerHTML = '';

  if (list.length === 0) {
    languageList.innerHTML = `
      <div style="padding: 24px; text-align: center; color: rgba(255,252,244,0.4); font-size: 14px;">
        No matching languages found
      </div>
    `;
    return;
  }

  list.forEach(lang => {
    const item = document.createElement('div');
    item.className = 'language-item';
    item.setAttribute('role', 'option');
    item.dataset.code = lang.code;

    if (selectedLanguage && selectedLanguage.code === lang.code) {
      item.classList.add('selected');
    }

    const hasAudio = lang.capabilities.audio;

    item.innerHTML = `
      <div class="lang-primary">
        <span class="lang-native-name">${lang.name}</span>
        <span class="lang-english-name">${lang.englishName}</span>
      </div>
      <div class="lang-badges">
        <span class="badge-pill badge-text-only">Text</span>
        ${hasAudio ? '<span class="badge-pill badge-audio">Audio</span>' : ''}
      </div>
    `;

    item.addEventListener('click', () => selectLanguage(lang));
    languageList.appendChild(item);
  });
}

// Select a language and update capability enforcement
function selectLanguage(lang) {
  selectedLanguage = lang;

  // Highlight selected item in list
  document.querySelectorAll('.language-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.code === lang.code);
  });

  // Check TTS Audio Capability (MoSCoW Must-Have: Silent Text-Only Fallback)
  const audioSupported = lang.capabilities.audio;

  if (!audioSupported) {
    // Disable audio modes
    modeListen.classList.add('disabled');
    modeReadListen.classList.add('disabled');

    // Auto-downgrade to Read mode
    if (selectedMode !== 'read') {
      setMode('read');
    }

    // Display fallback notice
    ttsFallbackText.textContent = `Voice audio is not yet available in ${lang.englishName}. Switched to real-time Read Mode.`;
    ttsFallbackAlert.classList.add('active');
  } else {
    // Enable audio modes
    modeListen.classList.remove('disabled');
    modeReadListen.classList.remove('disabled');
    ttsFallbackAlert.classList.remove('active');
  }
}

// Mode Selection Handler
function setMode(mode) {
  selectedMode = mode;
  [modeRead, modeListen, modeReadListen].forEach(card => {
    card.classList.toggle('selected', card.dataset.mode === mode);
  });
}

modeRead.addEventListener('click', () => setMode('read'));
modeListen.addEventListener('click', () => {
  if (!modeListen.classList.contains('disabled')) setMode('listen');
});
modeReadListen.addEventListener('click', () => {
  if (!modeReadListen.classList.contains('disabled')) setMode('read_listen');
});

// Live Search Filter
languageSearch.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  const filtered = languages.filter(l => 
    l.name.toLowerCase().includes(query) ||
    l.englishName.toLowerCase().includes(query) ||
    l.code.toLowerCase().includes(query)
  );
  renderLanguages(filtered);
});

// Enter Session Handoff
enterSessionBtn.addEventListener('click', () => {
  if (!currentSession || !selectedLanguage) return;

  // Save participant session state
  const participantSession = {
    sessionId: currentSession.sessionId,
    roomId: currentSession.roomId,
    language: selectedLanguage,
    mode: selectedMode,
    joinedAt: new Date().toISOString()
  };

  sessionStorage.setItem('bridgee_participant', JSON.stringify(participantSession));

  // Route to /live/[room-id]
  window.location.href = `/live/${currentSession.roomId}?lang=${selectedLanguage.code}&mode=${selectedMode}`;
});

// Manual Token View fallback & demo sessions
async function showManualTokenView(error = null) {
  loadingView.style.display = 'none';
  activeSessionView.style.display = 'none';
  manualTokenView.style.display = 'block';

  if (error) {
    tokenErrorMsg.textContent = error;
    tokenErrorMsg.style.display = 'block';
  } else {
    tokenErrorMsg.style.display = 'none';
  }

  try {
    const res = await fetch('/api/sessions');
    const data = await res.json();
    if (data.success && data.sessions) {
      quickTokensList.innerHTML = '';
      data.sessions.forEach(s => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'quick-token-chip';
        chip.textContent = `${s.roomId} (${s.template})`;
        chip.addEventListener('click', () => {
          window.location.href = `/join/${s.roomId}`;
        });
        quickTokensList.appendChild(chip);
      });
    }
  } catch (e) {
    console.error('Failed to load demo sessions:', e);
  }
}

tokenForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const token = manualTokenInput.value.trim().toUpperCase();
  if (token) {
    window.location.href = `/join/${token}`;
  }
});

// Launch
init();
