

// ============================================
// UTILITY FUNCTIONS
// ============================================

const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

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
            }, 800);
        });
    }

    hide() {
        this.preloader.classList.add('hidden');
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
        window.addEventListener('scroll', debounce(() => {
            this.button.classList.toggle('visible', window.scrollY > 300);
        }, 100));

        this.button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        if (!target) return;

        window.scrollTo({
            top: target.offsetTop - 80,
            behavior: 'smooth'
        });

        if (this.navMenu.classList.contains('active')) {
            this.toggleMobileMenu();
        }

        this.setActiveLink(link);
    }

    setActiveLink(activeLink) {
        this.navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    updateActiveNav() {
        let current = '';
        this.sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 100) {
                current = section.id;
            }
        });

        this.navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
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
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.toggle.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }
}

// ============================================
// TOAST
// ============================================

const showToast = (message, duration = 3000) => {
    const toast = document.getElementById('successToast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), duration);
};

// ============================================
// FORM VALIDATION + SERVERLESS SUBMIT
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
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            if (!field) return;

            field.addEventListener('blur', () => this.validateField(fieldName));
            field.addEventListener('input', () => this.clearError(fieldName));
        });

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    validateField(fieldName) {
        const field = this.fields[fieldName];
        if (!field) return true;

        const value = field.value.trim();
        let error = '';

        if (fieldName === 'name' && value.length < 2) error = 'Name must be at least 2 characters';
        if (fieldName === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email';
        if (fieldName === 'service' && !value) error = 'Please select a service';
        if (fieldName === 'message' && value.length < 10) error = 'Message too short';

        error ? this.showError(fieldName, error) : this.clearError(fieldName);
        return !error;
    }

    validateAll() {
        return Object.keys(this.fields).every(f => this.validateField(f));
    }

    showError(fieldName, msg) {
        const field = this.fields[fieldName];
        const errorEl = document.getElementById(`${fieldName}Error`);
        field?.classList.add('error');
        if (errorEl) {
            errorEl.textContent = msg;
            errorEl.classList.add('active');
        }
    }

    clearError(fieldName) {
        const field = this.fields[fieldName];
        const errorEl = document.getElementById(`${fieldName}Error`);
        field?.classList.remove('error');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.classList.remove('active');
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        if (this.validateAll()) this.submitForm();
    }

    async submitForm() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        const formData = new FormData(this.form);

        try {
            const res = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (res.ok) {
                this.form.reset();
                showToast('Message sent successfully! I’ll get back to you soon.');

                // Close modal if this is in a modal
                if (this.form.closest('.modal')) {
                    closeServiceModal();
                }
            } else {
                showToast('Failed to send message. Please try again.', 4000);
            }
        } catch (error) {
            showToast('Failed to send message. Please try again.', 4000);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

}

// ============================================
// SERVICE MODAL + INIT
// ============================================

const serviceDescriptions = {
    'react-development': 'Looking to build a modern React application?',
    'fullstack': 'Need end-to-end development?',
    'product-design': 'Design experiences users love.'
};

function openServiceModal(serviceId) {
    const modal = document.getElementById('serviceModal');
    document.getElementById('modalTitle').textContent = serviceId.replace('-', ' ');
    document.getElementById('modalDescription').textContent = serviceDescriptions[serviceId] || '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
    document.getElementById('serviceModal')?.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    new Preloader();
    new Navigation();
    new ThemeToggle();
    new ScrollToTop();
    new FormValidator('contactForm');
    new FormValidator('serviceForm');
    console.log('✓ Gridline Studio initialized');
});
