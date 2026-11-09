# OrderFlow — Smart Restaurant Order Management System

OrderFlow is a browser-only MCA Data Structures mini-project built with HTML5, CSS3 and vanilla JavaScript. It uses LocalStorage, so it runs directly with VS Code Live Server and does not require Node.js, a backend or a database.

## Run in VS Code

1. Open this folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click [index.html](./index.html) and choose **Open with Live Server**.
4. Open the dashboard in the browser.

## Data structures

- `Queue` in [js/queue.js](./js/queue.js) uses custom `QueueNode` objects with `front` and `rear` pointers. `enqueue()` and `dequeue()` are O(1).
- `LinkedList` in [js/linkedlist.js](./js/linkedlist.js) uses custom `OrderNode` objects. `insert()` is O(1) using the tail, while `search()`, `update()` and `delete()` are O(n).
- [js/app.js](./js/app.js) inserts every order into the linked list and enqueues pending orders. Starting preparation dequeues only the front order, preserving FIFO behavior.

## Features

Dashboard statistics, food ordering, cart calculations, 5% tax, FIFO kitchen workflow, cancellation, search and status filtering, order details, menu CRUD, responsive layout and LocalStorage restoration are all implemented.

## Test cases

| Test | Expected result |
|---|---|
| Place one order | The order appears in the linked list, history and pending queue. |
| Place three orders | The kitchen starts them in the same order they were placed. |
| Start the first order | It is dequeued and becomes Preparing. |
| Mark ready and complete | The status advances to Ready, then Completed; history retains it. |
| Cancel a pending order | It leaves the queue and remains in history as Cancelled. |
| Search by ID or customer | Matching records are shown in Order History. |
| Refresh the browser | Orders, menu items and the order counter are restored. |
| Empty queue | A friendly empty-state message is shown. |
| Invalid/empty order | Submission is blocked with an explanatory notification. |

