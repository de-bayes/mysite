(function() {
    const SCROLL_THRESHOLD = 60;
    let ticking = false;

    function updateScrollState() {
        const scrolled = window.scrollY > SCROLL_THRESHOLD;
        document.body.classList.toggle('scrolled', scrolled);
        if (scrolled) {
            document.querySelector('.nav-links')?.classList.remove('mobile-open');
            document.querySelector('.hamburger')?.classList.remove('active');
        }
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateScrollState);
            ticking = true;
        }
    }, { passive: true });

    updateScrollState();
})();
