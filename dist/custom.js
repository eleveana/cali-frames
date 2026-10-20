// Custom poster form: saves the answers as a cart item, then opens the cart
// on the shop page, where checkout sends them to Shopify as line item details.
const form = document.getElementById('custom-form');
const error = document.getElementById('form-error');

const questions = [
  ['name', 'Name'],
  ['age', 'Age'],
  ['location', 'Location'],
  ['colors', 'Favorite colors'],
  ['hobbies', 'Hobbies'],
  ['loves', 'Loves'],
  ['extra', 'Extra notes'],
  ['reference', 'Reference image'],
  ['email', 'Email'],
];

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const get = (k) => (data.get(k) || '').toString().trim();

  const missing = [...form.querySelectorAll('[required]')].find((el) => !el.value.trim() || !el.checkValidity());
  if (missing) {
    error.textContent = missing.id === 'email' && missing.value.trim()
      ? 'Please enter a valid email so we can send your poster.'
      : 'Please add your name and email so we can make your poster.';
    error.hidden = false;
    missing.focus();
    return;
  }
  error.hidden = true;

  const attributes = questions.map(([key, label]) => ({ key: label, value: get(key) }));
  if (data.get('selfie')) attributes.push({ key: 'Photo', value: 'Customer will email a photo' });
  const item = { custom: true, title: `Custom poster for ${get('name')}`, attributes };

  try {
    const picks = JSON.parse(localStorage.getItem('califrames-picks') || '[]');
    localStorage.setItem('califrames-picks', JSON.stringify([...(Array.isArray(picks) ? picks : []), item]));
  } catch {
    error.textContent = 'Your browser blocked saving the cart. Please email your answers to hello@califrames.com.';
    error.hidden = false;
    return;
  }
  location.href = '/?cart';
});
