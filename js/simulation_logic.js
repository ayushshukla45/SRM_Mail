/**
 * Simulation Backend - Pure Logic Layer
 * logic mirrored from messager.cpp
 */

class Msg {
  constructor() {
    this.star = false;
    this.sent = false;
    this.read = false;
    this.dt = "";
    this.to = "";
    this.from = "";
    this.text = "";
    this.subject = "";
    this.link = null;
  }
}

class User {
  constructor() {
    this.username = "";
    this.password = "";
    this.headS = null;
    this.headR = null;
    this.trash = [];
    this.next = null;
    this.prev = null;
  }
}

class System {
  constructor() {
    this.start = null;
    this.last = null;
  }

  // ---------- USER MANAGEMENT ----------
  createUser(username, password) {
    if (!username || !password)
      return { success: false, message: "Invalid input" };

    let ptr = this.start;
    while (ptr) {
      if (ptr.username === username)
        return { success: false, message: "Username already exists" };
      ptr = ptr.next;
    }

    const user = new User();
    user.username = username;
    user.password = password;

    if (!this.start) {
      this.start = this.last = user;
    } else {
      this.last.next = user;
      user.prev = this.last;
      this.last = user;
    }

    return { success: true };
  }

  login(username, password) {
    let ptr = this.start;
    while (ptr) {
      if (ptr.username === username && ptr.password === password) {
        return ptr;
      }
      ptr = ptr.next;
    }
    return null;
  }

  // ---------- MESSAGING ----------
  sendMessage(fromUser, toUsername, text, subject = "No Subject") {
    let receiver = this.start;
    while (receiver && receiver.username !== toUsername) {
      receiver = receiver.next;
    }

    if (!receiver)
      return { success: false, message: "Recipient not found" };

    const dt = new Date().toString();

    const inboxMsg = new Msg();
    inboxMsg.from = fromUser.username;
    inboxMsg.to = toUsername;
    inboxMsg.text = text;
    inboxMsg.subject = subject;
    inboxMsg.dt = dt;
    inboxMsg.link = receiver.headR;
    receiver.headR = inboxMsg;

    const sentMsg = new Msg();
    sentMsg.sent = true;
    sentMsg.from = fromUser.username;
    sentMsg.to = toUsername;
    sentMsg.text = text;
    sentMsg.subject = subject;
    sentMsg.dt = dt;
    sentMsg.read = true;
    sentMsg.link = fromUser.headS;
    fromUser.headS = sentMsg;

    return { success: true };
  }

  getMessages(user, type) {
    let msgs = [];
    let head =
      type === "SENT" || type === "STARRED_SENT"
        ? user.headS
        : user.headR;

    let ptr = head;
    while (ptr) {
      if (!type.includes("STARRED") || ptr.star) msgs.push(ptr);
      ptr = ptr.link;
    }
    return msgs;
  }

  searchMessages(user, query) {
    if (!query) return [];
    query = query.toLowerCase();

    let res = [];
    for (let head of [user.headR, user.headS]) {
      let ptr = head;
      while (ptr) {
        if (
          ptr.text.toLowerCase().includes(query) ||
          ptr.from.toLowerCase().includes(query) ||
          ptr.to.toLowerCase().includes(query) ||
          ptr.subject.toLowerCase().includes(query)
        ) {
          res.push(ptr);
        }
        ptr = ptr.link;
      }
    }
    return res;
  }

  getTrash(user) {
    return user.trash;
  }

  deleteMessage(user, type, msg) {
    let key = type === "SENT" ? "headS" : "headR";
    let head = user[key];

    if (!head) return false;

    if (head === msg) {
      user[key] = head.link;
      user.trash.push(msg);
      return true;
    }

    let prev = head;
    let cur = head.link;
    while (cur) {
      if (cur === msg) {
        prev.link = cur.link;
        user.trash.push(msg);
        return true;
      }
      prev = cur;
      cur = cur.link;
    }
    return false;
  }

  toggleStar(msg) {
    msg.star = !msg.star;
    return msg.star;
  }

  markRead(msg) {
    msg.read = true;
  }
}

// ---------- GLOBAL BACKEND ----------
window.backend = new System();

// ---------- SEED DATA (FINAL) ----------
window.backend.createUser("ayush", "1234");
window.backend.createUser("abhinav", "1234");

let u1 = window.backend.login("ayush", "1234");
let u2 = window.backend.login("abhinav", "1234");

window.backend.sendMessage(
  u1,
  "abhinav",
  "Welcome to the simulation! This is using Linked Lists under the hood.",
  "Hello World"
);

window.backend.sendMessage(
  u2,
  "ayush",
  "Thanks! The UI looks like Gmail but the logic is C++.",
  "Re: Hello World"
);

window.backend.sendMessage(
  u1,
  "abhinav",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "Project Update"
);
