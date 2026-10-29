document.addEventListener('DOMContentLoaded', () => {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const header = document.querySelector('.global-header');
    if (mobileBtn && header) {
        mobileBtn.addEventListener('click', () => {
            header.classList.toggle('menu-open');
        });
        header.querySelectorAll('.mobile-nav a').forEach((link) => {
            link.addEventListener('click', () => {
                header.classList.remove('menu-open');
            });
        });
    }
});
