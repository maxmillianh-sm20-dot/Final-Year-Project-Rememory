const lru = require('lru-cache');
console.log('Type:', typeof lru);
console.log('Is Constructor:', typeof lru === 'function' && !!lru.prototype && !!lru.prototype.constructor.name);
console.log('Value:', lru);
try {
  new lru({ max: 100 });
  console.log('Instantiation success');
} catch (e) {
  console.log('Instantiation failed:', e.message);
}
