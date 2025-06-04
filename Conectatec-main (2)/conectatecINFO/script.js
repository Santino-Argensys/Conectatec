document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
            // For mobile menu: close menu on link click
            const navUl = document.querySelector('nav ul');
            if (navUl.classList.contains('active')) {
                navUl.classList.remove('active');
            }
        });
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const navUl = document.querySelector('nav ul');

    if (menuToggle && navUl) {
        menuToggle.addEventListener('click', () => {
            navUl.classList.toggle('active');
        });
    }
    
    // Intersection Observer for animations on scroll
    const sections = document.querySelectorAll('.content-section');
    const observerOptions = {
        root: null, // relative to document viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of item is visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Optional: stop observing once visible
            }
        });
    };

    const sectionObserver = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Active nav link highlighting on scroll
    const allNavLinks = document.querySelectorAll('header nav ul li a');
    const allSections = document.querySelectorAll('main section');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        allSections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        allNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentSectionId) {
                link.classList.add('active');
            }
        });
        // Ensure "Inicio" is active when at the very top
        if (window.pageYOffset < window.innerHeight / 2 && currentSectionId === 'hero' ) {
             allNavLinks.forEach(link => link.classList.remove('active'));
             document.querySelector('nav a[href="#hero"]').classList.add('active');
        } else if (!currentSectionId && window.pageYOffset < 200){ // If no section is active (e.g. top of page), highlight Home
            allNavLinks.forEach(link => link.classList.remove('active'));
            const homeLink = document.querySelector('nav a[href="#hero"]');
            if(homeLink) homeLink.classList.add('active');
        }
    });

});

