document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'admin.html';
  const navLinks = document.querySelectorAll('.nav a[href]');

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute('href').split('/').pop().split('?')[0];
    const isCurrentPage = linkPage === currentPage;
    const listItem = link.closest('li');

    listItem?.classList.toggle('active', isCurrentPage);

    if (isCurrentPage) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }

    link.addEventListener('click', () => {
      navLinks.forEach((item) => {
        item.closest('li')?.classList.remove('active');
        item.removeAttribute('aria-current');
      });
      listItem?.classList.add('active');
      link.setAttribute('aria-current', 'page');
    });
  });
});
