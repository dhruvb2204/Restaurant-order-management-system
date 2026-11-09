const STORAGE_KEYS = {
  orders: "orderflow_orders",
  menu: "orderflow_menu",
  counter: "orderflow_counter"
};

const defaultMenu = [
  { id: "m1", name: "Paneer Tikka", category: "Starters", price: 220, icon: "🍢", enabled: true },
  { id: "m2", name: "Crispy Corn", category: "Starters", price: 180, icon: "🌽", enabled: true },
  { id: "m3", name: "Butter Chicken", category: "Main Course", price: 340, icon: "🍛", enabled: true },
  { id: "m4", name: "Veg Biryani", category: "Main Course", price: 260, icon: "🍚", enabled: true },
  { id: "m5", name: "Classic Burger", category: "Fast Food", price: 190, icon: "🍔", enabled: true },
  { id: "m6", name: "Margherita Pizza", category: "Fast Food", price: 280, icon: "🍕", enabled: true },
  { id: "m7", name: "Masala Chai", category: "Beverages", price: 70, icon: "☕", enabled: true },
  { id: "m8", name: "Fresh Lime Soda", category: "Beverages", price: 90, icon: "🍋", enabled: true },
  { id: "m9", name: "Gulab Jamun", category: "Desserts", price: 120, icon: "🍩", enabled: true },
  { id: "m10", name: "Chocolate Brownie", category: "Desserts", price: 160, icon: "🍫", enabled: true }
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key} from LocalStorage`, error);
    return fallback;
  }
}

function saveOrders(orders) { localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders)); }
function loadOrders() { return readStorage(STORAGE_KEYS.orders, []); }
function saveMenu(menu) { localStorage.setItem(STORAGE_KEYS.menu, JSON.stringify(menu)); }
function loadMenu() {
  const menu = readStorage(STORAGE_KEYS.menu, null);
  if (!menu) { saveMenu(defaultMenu); return [...defaultMenu]; }
  return menu;
}
function saveOrderCounter(counter) { localStorage.setItem(STORAGE_KEYS.counter, String(counter)); }
function loadOrderCounter() {
  const counter = Number(localStorage.getItem(STORAGE_KEYS.counter));
  return Number.isInteger(counter) && counter > 0 ? counter : 1;
}
