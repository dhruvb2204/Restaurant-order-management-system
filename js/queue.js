class QueueNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class Queue {
  constructor() {
    this.front = null;
    this.rear = null;
    this.size = 0;
  }

  enqueue(data) {
    const node = new QueueNode(data);
    if (this.isEmpty()) this.front = node;
    else this.rear.next = node;
    this.rear = node;
    this.size += 1;
  }

  dequeue() {
    if (this.isEmpty()) return null;
    const order = this.front.data;
    this.front = this.front.next;
    this.size -= 1;
    if (this.size === 0) this.rear = null;
    return order;
  }

  peek() { return this.front ? this.front.data : null; }
  isEmpty() { return this.size === 0; }
  getSize() { return this.size; }

  display() {
    const orders = [];
    let current = this.front;
    while (current) { orders.push(current.data); current = current.next; }
    return orders;
  }
}
