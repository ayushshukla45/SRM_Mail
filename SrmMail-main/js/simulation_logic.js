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
    this.subject = ""; // Added for Gmail UI, though C++ didn't have it explicitly, we'll auto-generate or append
    this.link = null;
  }
}

class User {
  constructor() {
    this.username = "";
    this.password = "";
    this.headS = null; // Sent messages Linked List Head
    this.headR = null; // Received messages Linked List Head
    this.trash = [];   // Trash vector (Array)
    this.next = null;  // DLL Next
    this.prev = null;  // DLL Prev
  }
}

class System {
  constructor() {
    this.start = null; // Head of User DLL
    this.last = null;  // Tail of User DLL
  }

  // --- User Management ---

  // Create a new user (SignUp)
  // Returns: { success: true, message: "..." } or { success: false, message: "..." }
  createUser(username, password) {
    if (!username || !password) return { success: false, message: "Invalid input" };

    let ptr = this.start;
    while (ptr != null) {
      if (ptr.username === username) {
        return { success: false, message: "Username already exists" };
      }
      ptr = ptr.next;
    }

    let newUser = new User();
    newUser.username = username;
    newUser.password = password;

    if (this.start === null) {
      this.start = newUser;
      this.last = newUser;
    } else {
      this.last.next = newUser;
      newUser.prev = this.last;
      this.last = newUser;
    }

    return { success: true, message: "Account created successfully" };
  }

  // Login
  // Returns: User object or null
  login(username, password) {
    let ptr = this.start;
    while (ptr != null) {
      if (ptr.username === username) {
        if (ptr.password === password) {
          return ptr;
        } else {
          return null; // Wrong password
        }
      }
      ptr = ptr.next;
    }
    return null; // User not found
  }

  // --- Messaging ---

  // Send Message
  sendMessage(fromUser, toUsername, text, subject = "No Subject") {
    let ptrT = this.start;
    while (ptrT != null) {
      if (ptrT.username === toUsername) break;
      ptrT = ptrT.next;
    }

    if (ptrT == null) return { success: false, message: "Recipient not found" };

    let date = new Date().toString();

    // 1. Add to Recipient's Inbox (Head of SLL)
    let mIn = new Msg();
    mIn.to = toUsername;
    mIn.from = fromUser.username;
    mIn.text = text;
    mIn.subject = subject;
    mIn.dt = date;
    mIn.read = false;

    mIn.link = ptrT.headR;
    ptrT.headR = mIn;

    // 2. Add to Sender's Sentbox (Head of SLL)
    let mOut = new Msg();
    mOut.sent = true;
    mOut.to = toUsername;
    mOut.from = fromUser.username;
    mOut.text = text;
    mOut.subject = subject;
    mOut.dt = date;
    mOut.read = true; // Sent messages are read by default?

    mOut.link = fromUser.headS;
    fromUser.headS = mOut;

    return { success: true, message: "Sent" };
  }

  // Get Messages as Array (Helper for UI)
  // type: "INBOX", "SENT", "STARRED_INBOX", "STARRED_SENT"
  getMessages(user, type) {
    let msgs = [];
    let head = null;

    if (type === "INBOX" || type === "STARRED_INBOX") head = user.headR;
    else if (type === "SENT" || type === "STARRED_SENT") head = user.headS;

    let ptr = head;
    while (ptr != null) {
      // Apply Filters
      if (type.includes("STARRED")) {
        if (ptr.star) msgs.push(ptr);
      } else {
        msgs.push(ptr);
      }
      ptr = ptr.link;
    }
    return msgs;
  }

  // Search
  searchMessages(user, query) {
    let results = [];
    if (!query) return results;
    query = query.toLowerCase();

    // Search in Inbox and Sent
    let sources = [user.headR, user.headS];

    for (let head of sources) {
      let ptr = head;
      while (ptr != null) {
        if (ptr.text.toLowerCase().includes(query) ||
          ptr.from.toLowerCase().includes(query) ||
          ptr.to.toLowerCase().includes(query) ||
          ptr.subject.toLowerCase().includes(query)) {
          results.push(ptr);
        }
        ptr = ptr.link;
      }
    }
    return results;
  }

  getTrash(user) {
    return user.trash;
  }

  // Action: Delete
  // Moves to trash
  deleteMessage(user, type, msgObj) {
    // We need to find the node and remove it from the SLL
    // type: "INBOX" (headR) or "SENT" (headS)
    let headProp = (type === "SENT") ? "headS" : "headR";
    let head = user[headProp];

    if (head === null) return false;

    if (head === msgObj) {
      user[headProp] = head.link;
      user.trash.push(msgObj);
      return true;
    }

    let prev = head;
    let curr = head.link;
    while (curr != null) {
      if (curr === msgObj) {
        prev.link = curr.link;
        user.trash.push(msgObj);
        return true;
      }
      prev = curr;
      curr = curr.link;
    }
    return false;
  }

  // Action: Star/Unstar
  toggleStar(msgObj) {
    msgObj.star = !msgObj.star;
    return msgObj.star;
  }

  // Action: Read
  markRead(msgObj) {
    msgObj.read = true;
  }
}

// Global System Instance
window.backend = new System();

// Seed some data for testing
window.backend.createUser("saurav", "1234");
window.backend.createUser("abhinav", "1234");

// Manual login to send welcome message
let u1 = window.backend.login("saurav", "1234");
let u2 = window.backend.login("abhinav", "1234");

window.backend.sendMessage(u1, "abhinav", "Welcome to the simulation! This is using Linked Lists under the hood.", "Hello World");
window.backend.sendMessage(u2, "saurav", "Thanks! The UI looks like Gmail but the logic is C++.", "Re: Hello World");
window.backend.sendMessage(u1, "abhinav", "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", "Project Update");
