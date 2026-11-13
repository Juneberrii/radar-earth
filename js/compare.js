// Before/after slider + "image missing" helper
document.querySelectorAll('[data-compare]').forEach((box) => {
  const after = box.querySelector('.after');
  const handle = box.querySelector('.handle');
  const input = document.querySelector(`input[data-for="${box.id}"]`);
  if (!input) return;
  const update = () => {
    const v = input.value;
    after.style.clipPath = `inset(0 0 0 ${v}%)`;
    handle.style.left = v + '%';
  };
  input.addEventListener('input', update);
  update();
});

// Shows a friendly note if an image file is missing
document.querySelectorAll('img[data-file]').forEach((img) => {
  img.addEventListener('error', () => {
    const note = img.parentElement.querySelector('.missing');
    if (note) {
      note.style.display = 'flex';
      note.textContent = 'Image not found: website/images/' + img.dataset.file + ' – run scripts/prepare_images.py';
    }
    img.style.visibility = 'hidden';
  });
});
