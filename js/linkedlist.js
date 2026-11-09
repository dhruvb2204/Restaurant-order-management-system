class OrderNode {
  constructor(order) {
    this.order = order;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  insert(order) {
    const node = new OrderNode(order);
    if (!this.head) this.head = node;
    else this.tail.next = node;
    this.tail = node;
    this.size += 1;
  }

  search(orderId) {
    let current = this.head;
    while (current) {
      if (current.order.id === orderId) return current.order;
      current = current.next;
    }
    return null;
  }

  update(orderId, updatedData) {
    const order = this.search(orderId);
    if (!order) return false;
    Object.assign(order, updatedData);
    return true;
  }

  delete(orderId) {
    let current = this.head;
    let previous = null;
    while (current) {
      if (current.order.id === orderId) {
        if (previous) previous.next = current.next;
        else this.head = current.next;
        if (current === this.tail) this.tail = previous;
        this.size -= 1;
        return true;
      }
      previous = current;
      current = current.next;
    }
    return false;
  }

  display() {
    const orders = [];
    let current = this.head;
    while (current) { orders.push(current.order); current = current.next; }
    return orders;
  }

  getSize() { return this.size; }
}
