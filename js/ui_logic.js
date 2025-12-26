// --- MODE TOGGLE LOGIC ---
let currentMode = 'UI'; // UI or CLI
let cliApp = null;

function toggleMode() {
  const uiApp = document.getElementById('app-screen');
  const loginScreen = document.getElementById('login-screen');
  const cliView = document.getElementById('cli-view');
  const btn = document.getElementById('btn-toggle-mode');

  if (currentMode === 'UI') {
    // Switch to CLI
    currentMode = 'CLI';
    uiApp.style.display = 'none';
    loginScreen.style.display = 'none'; // Hide login if visible
    cliView.style.display = 'flex';
    if (btn) btn.textContent = "Switch to UI";

    // Initialize CLI App if first time or just sync
    if (!cliApp) {
      const uiCtrl = {
        print: function (text) {
          const out = document.getElementById('output');
          out.textContent += text;
          document.getElementById('terminal-content').scrollTop = document.getElementById('terminal-content').scrollHeight;
        },
        exit: function () {
          toggleMode();
        }
      };
      cliApp = new CliMessager(uiCtrl, window.backend);

      // Input Handler
      const inputEl = document.getElementById('command-input');
      inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          const cmd = this.value;
          this.value = '';
          cliApp.processInput(cmd);
        }
      });

      // Focus
      document.getElementById('cli-view').addEventListener('click', () => inputEl.focus());
    }

    // Sync State
    const out = document.getElementById('output');
    if (out) out.textContent = "";
    cliApp.processInput(null); // Init/Sync
    const cmdInput = document.getElementById('command-input');
    if (cmdInput) cmdInput.focus();

  } else {
    // Switch to UI
    currentMode = 'UI';
    cliView.style.display = 'none';
    if (btn) btn.textContent = "Terminal Mode";

    // Restore UI State
    if (window.currentUser && window.currentUser.logged_in) {
      uiApp.style.display = 'flex';
      // Refresh UI in case CLI changed something (like sent a msg)
      loadView(currentFolder);
    } else {
      loginScreen.style.display = 'flex';
      document.getElementById('login-username').value = '';
      document.getElementById('login-password').value = '';
    }
  }
}

// Bind Toggle Button (if exists on login screen or header)
const btnToggle = document.getElementById('btn-toggle-mode');
if (btnToggle) {
  btnToggle.addEventListener('click', toggleMode);
}

// UI LOGIC
let currentUser = null;
let currentFolder = 'INBOX'; // INBOX, SENT, STARRED, TRASH
let currentEmailObj = null; // For reading view

// --- AUTH ---
const btnLogin = document.getElementById('btn-login');
if (btnLogin) {
  btnLogin.addEventListener('click', () => {
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;
    const user = window.backend.login(u, p);
    if (user) {
      currentUser = user;
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app-screen').style.display = 'flex';
      const userInitial = document.getElementById('user-initial');
      if (userInitial) userInitial.textContent = user.username.charAt(0).toUpperCase();
      loadView('INBOX');
    } else {
      document.getElementById('login-error').textContent = "Invalid credentials";
    }
  });
}

const linkCreate = document.getElementById('link-create');
if (linkCreate) {
  linkCreate.addEventListener('click', () => {
    document.querySelector('.login-box').style.display = 'none';
    document.getElementById('create-account-box').style.display = 'block';
  });
}

const linkLogin = document.getElementById('link-login');
if (linkLogin) {
  linkLogin.addEventListener('click', () => {
    document.getElementById('create-account-box').style.display = 'none';
    document.querySelector('.login-box').style.display = 'block';
  });
}

const btnCreate = document.getElementById('btn-create');
if (btnCreate) {
  btnCreate.addEventListener('click', () => {
    const u = document.getElementById('create-username').value;
    const p = document.getElementById('create-password').value;
    const res = window.backend.createUser(u, p);
    if (res.success) {
      alert("Account created! Please login.");
      document.getElementById('link-login').click();
    } else {
      document.getElementById('create-error').textContent = res.message;
    }
  });
}

function logout() {
  location.reload();
}

// --- SEARCH ---
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      const val = this.value;
      if (val) {
        // Perform Search
        currentFolder = 'SEARCH';
        renderList(val);
        // Clear active
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        backToList();
      }
    }
  });
}

// --- NAVIGATION ---
function loadView(view) {
  currentFolder = view;
  const sInput = document.getElementById('search-input');
  if (sInput) sInput.value = ''; // Clear search

  // UI Updates
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (view === 'INBOX') { const el = document.getElementById('nav-inbox'); if (el) el.classList.add('active'); }
  if (view === 'SENT') { const el = document.getElementById('nav-sent'); if (el) el.classList.add('active'); }
  if (view === 'STARRED') { const el = document.getElementById('nav-starred'); if (el) el.classList.add('active'); }
  if (view === 'TRASH') { const el = document.getElementById('nav-trash'); if (el) el.classList.add('active'); }

  backToList(); // Ensure we are in list view
  renderList();
}

function refreshList() {
  if (currentFolder === 'SEARCH') {
    renderList(document.getElementById('search-input').value);
  } else {
    renderList();
  }
}

function backToList() {
  document.getElementById('read-view').style.display = 'none';
  document.getElementById('email-view').style.display = 'flex';
}

// --- RENDER LIST ---
function renderList(searchQuery) {
  const listContainer = document.getElementById('email-list');
  listContainer.innerHTML = '';

  let msgs = [];
  if (currentFolder === 'TRASH') {
    msgs = window.backend.getTrash(currentUser);
  } else if (currentFolder === 'STARRED') {
    let inboxStarred = window.backend.getMessages(currentUser, 'STARRED_INBOX');
    let sentStarred = window.backend.getMessages(currentUser, 'STARRED_SENT');
    msgs = inboxStarred.concat(sentStarred);
  } else if (currentFolder === 'SEARCH') {
    msgs = window.backend.searchMessages(currentUser, searchQuery);
  } else {
    msgs = window.backend.getMessages(currentUser, currentFolder);
  }

  if (msgs.length === 0) {
    let msg = (currentFolder === 'SEARCH') ? 'No results found' : 'No messages';
    listContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: #777;">${msg}</div>`;
    return;
  }

  msgs.forEach((msg, idx) => {
    const el = document.createElement('div');
    el.className = `email-row ${msg.read ? 'read' : 'unread'}`;

    // Star Icon
    const starIcon = msg.star ? 'star' : 'star_border';
    const starClass = msg.star ? 'starred' : '';

    // Content
    const sender = (currentFolder === 'SENT') ? `To: ${msg.to}` : msg.from;
    const subject = msg.subject || "(No Subject)";
    const preview = msg.text.substring(0, 50);
    const date = msg.dt.substring(4, 10);

    el.innerHTML = `
                <div class="row-check"><span class="material-icons" style="font-size: 20px;">check_box_outline_blank</span></div>
                <div class="row-star"><span class="material-icons ${starClass}" onclick="toggleStar(event, this)">${starIcon}</span></div>
                <div class="row-sender">${sender}</div>
                <div class="row-content">
                    <span class="subject">${subject}</span>
                    <span class="preview"> - ${preview}</span>
                </div>
                <div class="row-date">${date}</div>
            `;

    el.msgRef = msg;

    el.addEventListener('click', (e) => {
      if (e.target.closest('.row-star') || e.target.closest('.row-check')) return;
      openEmail(msg);
    });

    listContainer.appendChild(el);
  });
}

// --- ACTIONS ---
function openEmail(msg) {
  currentEmailObj = msg;
  window.backend.markRead(msg);

  // Format Date
  let dateStr = msg.dt;
  try {
    const d = new Date(msg.dt);
    if (!isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
        ", " +
        d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    }
  } catch (e) { }

  document.getElementById('email-view').style.display = 'none';
  document.getElementById('read-view').style.display = 'flex';

  document.getElementById('read-subject').textContent = msg.subject || "(No Subject)";

  const fromName = msg.from;
  const readFrom = document.getElementById('read-from');
  if (readFrom) readFrom.innerHTML = `${fromName} <span class="email-address">&lt;${fromName}@gmail.sim&gt;</span>`;

  document.getElementById('read-date').textContent = dateStr;
  document.getElementById('read-body').textContent = msg.text;

  // Avatar Color
  const colors = ['#ef5350', '#ec407a', '#ab47bc', '#7e57c2', '#5c6bc0', '#42a5f5', '#29b6f6', '#26c6da',
    '#26a69a', '#66bb6a', '#9ccc65', '#d4e157', '#ffca28', '#ffa726', '#ff7043', '#8d6e63', '#bdbdbd', '#78909c'];
  const charCode = fromName.charCodeAt(0) || 0;
  const color = colors[charCode % colors.length];

  const avatar = document.getElementById('read-avatar');
  if (avatar) {
    avatar.textContent = fromName.charAt(0).toUpperCase();
    avatar.style.backgroundColor = color;
  }
}

function toggleStar(e, icon) {
  e.stopPropagation();
  const row = icon.closest('.email-row');
  const msg = row.msgRef;
  const isStarred = window.backend.toggleStar(msg);

  if (isStarred) {
    icon.textContent = 'star';
    icon.classList.add('starred');
  } else {
    icon.textContent = 'star_border';
    icon.classList.remove('starred');
  }
}

function deleteCurrentEmail() {
  if (!currentUser || !currentEmailObj) return;

  if (currentFolder === 'TRASH') {
    // Permanent delete
    const idx = currentUser.trash.indexOf(currentEmailObj);
    if (idx > -1) currentUser.trash.splice(idx, 1);
  } else {
    // Move to trash
    // If the message is in Sent list, delete from sent.
    let deleted = window.backend.deleteMessage(currentUser, 'INBOX', currentEmailObj);
    if (!deleted) window.backend.deleteMessage(currentUser, 'SENT', currentEmailObj);
  }

  backToList();
  renderList();
}

// --- COMPOSE ---
function openCompose() {
  document.getElementById('compose-modal').style.display = 'flex';
  document.getElementById('compose-to').value = '';
  document.getElementById('compose-subject').value = '';
  document.getElementById('compose-text').value = '';
}

function closeCompose() {
  document.getElementById('compose-modal').style.display = 'none';
}

function sendEmail() {
  let rawTo = document.getElementById('compose-to').value;
  // Sanitize: "saurav@gmail.sim" -> "saurav"
  const to = rawTo.split('@')[0].trim();
  const sub = document.getElementById('compose-subject').value;
  const txt = document.getElementById('compose-text').value;

  const res = window.backend.sendMessage(currentUser, to, txt, sub);
  if (res.success) {
    closeCompose();
    alert("Message Sent!");
    if (currentFolder === 'SENT') renderList();
  } else {
    alert("Error: " + res.message);
  }
}
