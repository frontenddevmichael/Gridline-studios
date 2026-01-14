/**
 * Gridline Studio Development Agency Website
 * Main JavaScript File
 * 
 * Features:
 * - Preloader animation
 * - Smooth navigation with active states
 * - Theme toggle with localStorage persistence
 * - Form validation (real-time and on submit)
 * - Service inquiry modal system
 * - Scroll to top button
 * - Mobile navigation toggle
 * - Toast notifications
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function to limit rate of function calls
 */
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

/**
 * Check if element is partially visible in viewport
 */
const isPartiallyVisible = (element) => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
};

// ============================================
// PRELOADER
// ============================================

class Preloader {
    constructor() {
        this.preloader = document.getElementById('preloader');
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hide();
            }, 800); // Show loader for at least 800ms for smooth experience
        });
    }

    hide() {
        this.preloader.classList.add('hidden');
        // Remove from DOM after transition
        setTimeout(() => {
            this.preloader.style.display = 'none';
        }, 500);
    }
}

// ============================================
// SCROLL TO TOP
// ============================================

class ScrollToTop {
    constructor() {
        this.button = document.getElementById('scrollTopBtn');
        this.init();
    }

    init() {
        // Show/hide button on scroll
        window.addEventListener('scroll', debounce(() => {
            if (window.scrollY > 300) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        }, 100));

        // Scroll to top on click
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
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
        this.sections = document.querySelectorAll('.section');
        
        this.init();
    }

    init() {
        this.handleScroll();
        window.addEventListener('scroll', debounce(() => this.handleScroll(), 10));
        
        this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
        
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e, link));
        });

        document.addEventListener('click', (e) => {
            if (!this.nav.contains(e.target) && this.navMenu.classList.contains('active')) {
                this.toggleMobileMenu();
            }
        });

        window.addEventListener('scroll', debounce(() => this.updateActiveNav(), 100));
    }

    handleScroll() {
        this.nav.classList.toggle('scrolled', window.scrollY > 50);
    }

    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        this.navToggle.classList.toggle('active');
        document.body.style.overflow = this.navMenu.classList.contains('active') ? 'hidden' : '';
    }

    handleNavClick(e, link) {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));

        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });

            if (this.navMenu.classList.contains('active')) {
                this.toggleMobileMenu();
            }

            this.setActiveLink(link);
        }
    }

    setActiveLink(activeLink) {
        this.navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    updateActiveNav() {
        let current = '';
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
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
// TOAST NOTIFICATIONS
// ============================================

const showToast = (message, duration = 3000) => {
    const toast = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, duration);
};

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
// ACCESSIBILITY ENHANCEMENTS
// ============================================

const initAccessibility = () => {
    // Handle modal focus trapping
    const modal = document.getElementById('serviceModal');
    if (modal) {
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                const firstFocusable = focusableElements[0];
                const lastFocusable = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        });
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize core components
    new Preloader();
    new Navigation();
    new ThemeToggle();
    new ScrollToTop();
    
    // Initialize forms
    new FormValidator('contactForm');
    new FormValidator('serviceForm');
    
    // Initialize features
    initServiceCards();
    initAccessibility();
    
    console.log('✓ Gridline Studio initialized');
});