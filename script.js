/**
 * Michael Omale Digital Studio Website
 * Main JavaScript File
 * 
 * Features:
 * - Smooth navigation with active states
 * - Theme toggle with localStorage persistence
 * - Form validation (real-time and on submit)
 * - Service interest modal system
 * - Skill bar animations on scroll
 * - Mobile navigation toggle
 * - Success toast notifications
 * - Contact form handling
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function to limit rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Check if element is partially visible in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if element is partially visible
 */
function isPartiallyVisible(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    return vertInView;
}

// ============================================
// NAVIGATION
// ============================================

class Navigation {
    constructor() {
        this.nav = document.getElementById('mainNav');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav__link');

        this.init();
    }

    init() {
        // Handle scroll behavior
        window.addEventListener('scroll', debounce(() => {
            this.handleScroll();
        }, 10));

        // Mobile toggle
        this.navToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Smooth scroll for nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavClick(e, link);
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.nav.contains(e.target) && this.navMenu.classList.contains('active')) {
                this.toggleMobileMenu();
            }
        });

        // Update active nav on scroll
        this.updateActiveNavOnScroll();
    }

    handleScroll() {
        if (window.scrollY > 50) {
            this.nav.classList.add('scrolled');
        } else {
            this.nav.classList.remove('scrolled');
        }
    }

    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        this.navToggle.classList.toggle('active');

        // Prevent body scroll when menu is open
        if (this.navMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    handleNavClick(e, link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        const target = document.querySelector(href);

        if (target) {
            const offsetTop = target.offsetTop - 80; // Account for fixed nav height
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            if (this.navMenu.classList.contains('active')) {
                this.toggleMobileMenu();
            }

            // Update active state
            this.setActiveLink(link);
        }
    }

    setActiveLink(activeLink) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    updateActiveNavOnScroll() {
        const sections = document.querySelectorAll('.section');

        window.addEventListener('scroll', debounce(() => {
            let current = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop - 100;
                const sectionHeight = section.clientHeight;

                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }, 100));
    }
}

// ============================================
// THEME TOGGLE
// ============================================

class ThemeToggle {
    constructor() {
        this.toggle = document.getElementById('themeToggle');
        this.currentTheme = localStorage.getItem('theme') || 'light';

        this.init();
    }

    init() {
        // Apply saved theme
        document.documentElement.setAttribute('data-theme', this.currentTheme);

        // Toggle button click
        this.toggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.currentTheme = newTheme;
    }
}

// ============================================
// FORM VALIDATION
// ============================================

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;

        this.fields = {
            name: this.form.querySelector('#name, #modalName'),
            email: this.form.querySelector('#email, #modalEmail'),
            service: this.form.querySelector('#service'),
            message: this.form.querySelector('#message, #modalDetails')
        };

        this.init();
    }

    init() {
        // Real-time validation
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            if (field) {
                field.addEventListener('blur', () => {
                    this.validateField(fieldName);
                });

                field.addEventListener('input', () => {
                    // Clear error on input
                    this.clearError(fieldName);
                });
            }
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            this.handleSubmit(e);
        });
    }

    validateField(fieldName) {
        const field = this.fields[fieldName];
        if (!field) return true;

        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'name':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters';
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;

            case 'service':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Please select a service';
                }
                break;

            case 'message':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Message must be at least 10 characters';
                }
                break;
        }

        if (!isValid) {
            this.showError(fieldName, errorMessage);
        } else {
            this.clearError(fieldName);
        }

        return isValid;
    }

    showError(fieldName, message) {
        const field = this.fields[fieldName];
        const errorId = fieldName + 'Error';
        const errorElement = document.getElementById(errorId);

        if (field) {
            field.classList.add('error');
        }

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('active');
        }
    }

    clearError(fieldName) {
        const field = this.fields[fieldName];
        const errorId = fieldName + 'Error';
        const errorElement = document.getElementById(errorId);

        if (field) {
            field.classList.remove('error');
        }

        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('active');
        }
    }

    validateAll() {
        let isFormValid = true;

        Object.keys(this.fields).forEach(fieldName => {
            if (this.fields[fieldName] && !this.validateField(fieldName)) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    handleSubmit(e) {
        e.preventDefault();

        if (this.validateAll()) {
            // Simulate form submission
            this.submitForm();
        }
    }

    submitForm() {
        // In production, this would send data to a server
        // For now, we'll simulate success

        // Disable submit button
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            // Reset form
            this.form.reset();

            // Re-enable button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

            // Show success message
            showToast('Message sent successfully! I\'ll get back to you soon.');

            // Close modal if this is in a modal
            if (this.form.closest('.modal')) {
                closeServiceModal();
            }
        }, 1500);
    }
}

// ============================================
// SERVICE MODAL
// ============================================

const serviceDescriptions = {
    'react-development': 'Looking to build a modern React application? Let\'s discuss your project requirements and how we can help bring your vision to life with scalable, high-performance code.',
    'fullstack': 'Need complete end-to-end development? Tell us about your project and we\'ll architect a robust solution that handles both frontend and backend seamlessly.',
    'product-design': 'Want to create exceptional user experiences? Share your product vision and we\'ll help design interfaces that users love and business goals align with.'
};

function openServiceModal(serviceId) {
    const modal = document.getElementById('serviceModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');

    // Set content based on service
    const serviceName = serviceId.replace('-', ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    modalTitle.textContent = `${serviceName}`;
    modalDescription.textContent = serviceDescriptions[serviceId] || '';

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Reset form
    const form = document.getElementById('serviceForm');
    if (form) {
        form.reset();
    }
}

// Service card click handlers
function initServiceCards() {
    const serviceButtons = document.querySelectorAll('.service-card__btn');

    serviceButtons.forEach(button => {
        button.addEventListener('click', () => {
            const serviceId = button.getAttribute('data-service-id');
            openServiceModal(serviceId);
        });
    });

    // Modal close handlers
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');

    if (modalClose) {
        modalClose.addEventListener('click', closeServiceModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeServiceModal);
    }

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeServiceModal();
        }
    });
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, duration = 3000) {
    const toast = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.add('active');

    setTimeout(() => {
        toast.classList.remove('active');
    }, duration);
}

// ============================================
// SKILL BARS ANIMATION
// ============================================

class SkillBarsAnimation {
    constructor() {
        this.skillBars = document.querySelectorAll('.skill-bar');
        this.animated = false;

        this.init();
    }

    init() {
        window.addEventListener('scroll', debounce(() => {
            this.checkAndAnimate();
        }, 100));

        // Check on load
        this.checkAndAnimate();
    }

    checkAndAnimate() {
        if (this.animated) return;

        const firstSkillBar = this.skillBars[0];
        if (firstSkillBar && isPartiallyVisible(firstSkillBar)) {
            this.animateSkillBars();
            this.animated = true;
        }
    }

    animateSkillBars() {
        this.skillBars.forEach((bar, index) => {
            setTimeout(() => {
                const fill = bar.querySelector('.skill-bar__fill');
                const percentage = fill.getAttribute('data-percentage');

                bar.classList.add('animate');
                fill.style.setProperty('--percentage', percentage + '%');
            }, index * 150); // Stagger animation
        });
    }
}

// ============================================
// SMOOTH SCROLL POLYFILL
// ============================================

function smoothScrollPolyfill() {
    // Check if smooth scroll is supported
    if (!('scrollBehavior' in document.documentElement.style)) {
        // Add polyfill for older browsers
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offsetTop = target.offsetTop - 80;

                    window.scroll({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections (already have fadeInUp animation in CSS)
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        observer.observe(section);
    });
}

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================

function initAccessibility() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#home';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--color-accent);
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 10000;
    `;

    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
    });

    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    // Keyboard navigation for modal
    const modal = document.getElementById('serviceModal');
    if (modal) {
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                trapFocus(modal, e);
            }
        });
    }
}

function trapFocus(element, event) {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            event.preventDefault();
        }
    } else {
        if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            event.preventDefault();
        }
    }
}

// ============================================
// PERFORMANCE MONITORING
// ============================================

function logPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`Page load time: ${pageLoadTime}ms`);

                // Check if under 3 second target
                if (pageLoadTime > 3000) {
                    console.warn('Page load time exceeds 3 second target');
                } else {
                    console.log('✓ Page load time meets performance target');
                }
            }, 0);
        });
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new Navigation();
    new ThemeToggle();

    // Initialize forms
    new FormValidator('contactForm');
    new FormValidator('serviceForm');

    // Initialize other features
    initServiceCards();
    smoothScrollPolyfill();
    initScrollAnimations();
    initAccessibility();
    logPerformance();

    console.log('Gridline Studio - Development Agency - Website initialized');
    console.log('All systems operational ✓');
});

// ============================================
// EXPORT FOR TESTING (if needed)
// ============================================

// Expose utilities for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        debounce,
        isInViewport,
        isPartiallyVisible,
        showToast
    };
}