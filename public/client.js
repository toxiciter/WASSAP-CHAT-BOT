const socket = io();

const qrWrap = document.getElementById('qr-wrap');
const qrText = document.getElementById('qr-text');
const statusText = document.getElementById('status-text');
const loadingEl = document.getElementById('loading');
const restartBtn = document.getElementById('restart');

socket.on('connect', () => {
  console.log('connected to socket');
});

socket.on('qr', (data) => {
  // data.src is dataURL for image
  qrWrap.innerHTML = `<img src="${data.src}" alt="QR code" />`;
  qrText.textContent = data.text || '--';
  statusText.textContent = 'QR RECEIVED (scan to login)';
});

socket.on('status', (d) => {
  if (d.state === 'ready') statusText.textContent = 'READY';
  else if (d.state === 'authenticated') statusText.textContent = 'AUTHENTICATED';
  else if (d.state === 'auth_failure') statusText.textContent = 'AUTH_FAILURE: ' + (d.message || '');
});

socket.on('loading', (d) => {
  loadingEl.textContent = `Loading: ${d.percent}% - ${d.message}`;
});

socket.on('toast', (t) => {
  console.log('toast', t);
  // small ephemeral message - could be extended
});

restartBtn.addEventListener('click', () => {
  socket.emit('request-restart');
});