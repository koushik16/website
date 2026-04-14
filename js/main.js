// Mobile navigation toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when a link is clicked
    navMenu.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// Scroll reveal animation using IntersectionObserver
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.highlight-card, .skill-category, .timeline__item, .project-card, .cert-card, .contact-card'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    revealElements.forEach(el => observer.observe(el));
}

// Active nav link highlight on scroll
function initActiveNav() {
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav__link');

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle(
                            'nav__link--active',
                            link.getAttribute('href') === `#${id}`
                        );
                    });
                }
            });
        },
        { rootMargin: '-40% 0px -60% 0px' }
    );

    sections.forEach(section => observer.observe(section));
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initActiveNav();
});
