// Script for login interactions: show password, submit loading, google sim
document.addEventListener('DOMContentLoaded', () => {
  const showBtn = document.querySelector('.show-pass');
  const passwordInput = document.getElementById('password');
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const googleBtn = document.getElementById('googleBtn');

  // Toggle password visibility
  showBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    showBtn.classList.toggle('active');
    showBtn.setAttribute('aria-pressed', showBtn.classList.contains('active'));
  });

  // Simulate login with loading animation
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!loginForm.checkValidity()) {
      loginForm.reportValidity();
      return;
    }
    loginBtn.classList.add('loading');
    loginBtn.setAttribute('aria-busy', 'true');
    const text = loginBtn.querySelector('.btn-text');
    text.textContent = 'Signing in...';

    // Simulate network delay then show success (for demo)
    setTimeout(() => {
      loginBtn.classList.remove('loading');
      loginBtn.removeAttribute('aria-busy');
      text.textContent = 'Welcome';
      // show a subtle success pulse
      loginBtn.animate([{boxShadow: '0 8px 30px rgba(0,200,150,0.12)'}, {boxShadow: '0 12px 40px rgba(0,200,150,0.22)'}], {duration:600, easing:'ease-out'});
    }, 1800);
  });

  // Google sign-in simulation
  googleBtn.addEventListener('click', () => {
    googleBtn.classList.add('loading');
    googleBtn.setAttribute('aria-busy', 'true');
    const original = googleBtn.querySelector('span:last-child').textContent;
    googleBtn.querySelector('span:last-child').textContent = 'Opening Google...';
    setTimeout(() => {
      googleBtn.classList.remove('loading');
      googleBtn.removeAttribute('aria-busy');
      googleBtn.querySelector('span:last-child').textContent = original;
    }, 1200);
  });

  // Improve keyboard accessibility for show-pass button
  showBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showBtn.click();
    }
  });
});
