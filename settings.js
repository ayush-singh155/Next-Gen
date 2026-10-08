const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('backdrop');
const navLinks = document.querySelectorAll('.nav-link');

function openSidebar() {
  sidebar?.classList.add('is-open');
  backdrop?.classList.add('is-visible');
}

function closeSidebar() {
  sidebar?.classList.remove('is-open');
  backdrop?.classList.remove('is-visible');
}

menuBtn?.addEventListener('click', () => {
  if (sidebar?.classList.contains('is-open')) {
    closeSidebar();
  } else {
    openSidebar();
  }
});

backdrop?.addEventListener('click', closeSidebar);

navLinks.forEach((link) => {
  const href = link.getAttribute('href');

  if (href && window.location.pathname.endsWith(href)) {
    link.classList.add('active');
  }

  link.addEventListener('click', () => {
    navLinks.forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
    closeSidebar();
  });
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 860) {
    closeSidebar();
  }
});
