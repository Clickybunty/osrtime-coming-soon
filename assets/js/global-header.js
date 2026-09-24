document.addEventListener('DOMContentLoaded', () => {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const header = document.querySelector('.global-header');
    if (mobileBtn && header) {
        mobileBtn.addEventListener('click', () => {
            header.classList.toggle('menu-open');
        });
    }
});
