// Custom poster form: no backend, so answers go out as a prefilled email.
const form = document.getElementById('custom-form');
const sent = document.getElementById('custom-sent');
const error = document.getElementById('form-error');
const selfie = document.getElementById('selfie');
const selfieNote = document.getElementById('selfie-note');

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

selfie.addEventListener('change', () => {
  const file = selfie.files[0];
  selfieNote.hidden = !file;
  if (file) selfieNote.textContent = `Selected: ${file.name}. Attach it to the email before sending.`;
});

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

  const file = selfie.files[0];
  const lines = questions.map(([key, label]) => `${label}: ${get(key) || '—'}`);
  lines.push(`Selfie photo: ${file ? `attached (${file.name})` : 'none'}`);
  const body = `Hi Maya! I’d love a custom poster ($50).\n\n${lines.join('\n')}\n\nPlease send next steps.`;
  const subject = `Custom poster for ${get('name')}`;

  window.location.href = `mailto:hello@califrames.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  document.getElementById('sent-photo').hidden = !file;
  form.hidden = true;
  sent.hidden = false;
  sent.focus();
});

document.getElementById('edit-answers').addEventListener('click', () => {
  sent.hidden = true;
  form.hidden = false;
  form.querySelector('input').focus();
});
