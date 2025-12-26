# SrmMail (CCC Project 2)
### A Data Structures Driven Gmail Simulation

**SrmMail** is a comprehensive simulation of an email management system, demonstrating the practical application of Data Structures and Algorithms (DSA). This project focuses on the efficient use of **Linked Lists** to model a real-world mailing system.

---

## 📸 Screenshots

| Login & Authentication | Inbox View |
|:---:|:---:|
| <img src="assets/Screenshot 2025-12-08 000029.png" width="400"> | <img src="assets/Screenshot 2025-12-08 000156.png" width="400"> |

| Compose Email | Terminal Mode (CLI) |
|:---:|:---:|
| <img src="assets/Screenshot 2025-12-08 000207.png" width="400"> | <img src="assets/Screenshot 2025-12-08 000215.png" width="400"> |


| Reading an Email | Sidebar & Navigation |
|:---:|:---:|
| <img src="assets/Screenshot 2025-12-08 000223.png" width="400"> | <img src="assets/Screenshot 2025-12-08 000234.png" width="400"> |

| Prototype UI |
|:---:|
| <img src="assets/proto_ui.png" width="800"> |

---

## 🔗 Core Data Structures (Linked List Implementation)

The backbone of this simulation is the **Linked List**. Unlike standard arrays, our system uses dynamic pointers to manage users and messages efficiently in memory.

### 1. User Management (Doubly Linked List)
We utilize a **Doubly Linked List** to store all registered user accounts.
*   **Why?** Allows for O(1) addition of new users and efficient O(n) traversal for login verification.
*   **Structure**: Each `UserNode` contains:
    *   `username` / `password`
    *   `*next` pointer (to next user)
    *   `*prev` pointer (to previous user)
    *   Pointers to their personal `Inbox` and `SentBox`.

### 2. Message Storage (Singly Linked Lists)
Every user has two private **Singly Linked Lists**:
*   **Inbox List**: Stores all received messages. HEAD points to the most recent email.
*   **SentBox List**: Stores all sent messages.
*   **Why?** Singly linked lists are lightweight and perfect for linear message history where we primarily access the head (latest message).

### 3. Message Node Structure
Each message is a node in the linked list containing:
*   `sender` (string)
*   `receiver` (string)
*   `content` (string)
*   `date` (string)
*   `isStarred` (boolean)
*   `*next` (pointer to the next message)

---

## ✨ Features
### Hybrid Interface
*   **Modern Web UI**: A responsive GUI with sidebar navigation, search, and rich text reading.
*   **Terminal Mode**: A toggleable CLI that gives a "hacker-style" view of the underlying linked list operations.

### Functionality
*   **Authentication**: Secure Login/Signup using list traversal.
*   **Compose**: Creates a new Message Node and appends it to:
    1.  The Sender's `SentBox` Linked List.
    2.  The Receiver's `Inbox` Linked List.
*   **Delete**: Removes a node from the Linked List (pointer manipulation).
*   **Search**: Traverses the Linked List to find nodes matching the query.

---

## 🚀 Live Demo
You can view the live simulation here: **https://sxvyx.github.io/SrmMail/**

## 📂 Project Structure
*   **`index.html`**: Entry point.
*   **`js/simulation_logic.js`**: Contains the JS translation of the C++ Linked List logic.
*   **`src/messager.cpp`**: The original C++ source code referencing the raw pointers and classes.
*   **`assets/`**: Images and screenshots.

---
