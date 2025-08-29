// ============================================
// INTEGRATED SCRIPT.JS WITH EMAIL FUNCTIONALITY
// ============================================

// Configuration
const API_BASE_URL = 'https://aasai-tech-api.onrender.com/aasaitech/email'; // Replace with your EC2 server URL
// For local testing: const API_BASE_URL = 'http://localhost:3000';

// Utility functions for email integration
function showLoadingState(button, originalText = 'Submit') {
    button.disabled = true;
    const loadingHTML = `
        <span style="display: inline-flex; align-items: center; gap: 8px;">
            <svg style="animation: spin 1s linear infinite; width: 16px; height: 16px;" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.3"/>
                <path fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"/>
            </svg>
            Sending...
        </span>
    `;
    button.innerHTML = loadingHTML;
}

function resetButtonState(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
}

function showPopup(message, isSuccess = true) {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.textContent = message;
        popup.className = `popup ${isSuccess ? 'success' : 'error'}`;
        popup.classList.add('show');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            popup.classList.remove('show');
        }, 5000);
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

// API Functions
async function submitCareerForm(formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/career`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        console.log(result)
        if (!response.ok) {
            throw new Error(result.message || 'Network error occurred');
        }
        
        return result;
    } catch (error) {
        console.error('Career form submission error:', error);
        throw error;
    }
}

async function submitContactForm(formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        console.log(result)
        if (!response.ok) {
            throw new Error(result.message || 'Network error occurred');
        }
        
        return result;
    } catch (error) {
        console.error('Contact form submission error:', error);
        throw error;
    }
}

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const nav = document.getElementById('nav');
    
    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            if (mobileToggle.querySelector('i')) {
                mobileToggle.querySelector('i').classList.toggle('fa-bars');
                mobileToggle.querySelector('i').classList.toggle('fa-times');
            }
        });
    }

    // Close mobile menu when clicking a link
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            if (mobileToggle.querySelector('i')) {
                mobileToggle.querySelector('i').classList.add('fa-bars');
                mobileToggle.querySelector('i').classList.remove('fa-times');
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideNav = nav.contains(event.target);
        const isClickOnToggle = mobileToggle.contains(event.target);
        
        if (nav.classList.contains('active') && !isClickInsideNav && !isClickOnToggle) {
            nav.classList.remove('active');
            if (mobileToggle.querySelector('i')) {
                mobileToggle.querySelector('i').classList.add('fa-bars');
                mobileToggle.querySelector('i').classList.remove('fa-times');
            }
        }
    });

    // Fix for iOS 100vh issue
    function setVH() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setVH();
    window.addEventListener('resize', setVH);

    // Enhanced Career Form Submission with Email Integration
    const careerForm = document.getElementById('career-form');
    const popup = document.getElementById('popup');

    if (careerForm && popup) {
        careerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = careerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            try {
                // Get form data
                const formData = new FormData(careerForm);
                const data = {
                    name: formData.get('name')?.trim(),
                    email: formData.get('email')?.trim(),
                    phone: formData.get('phone')?.trim(),
                    position: formData.get('position'),
                    message: formData.get('message')?.trim()
                };
                
                // Client-side validation
                const errors = [];
                
                if (!data.name || data.name.length < 2) {
                    errors.push('Name must be at least 2 characters long');
                }
                
                if (!data.email || !validateEmail(data.email)) {
                    errors.push('Please enter a valid email address');
                }
                
                if (!data.phone || !validatePhone(data.phone)) {
                    errors.push('Please enter a valid phone number');
                }
                
                if (!data.position || data.position === '') {
                    errors.push('Please select a position');
                }
                
                if (!data.message || data.message.length < 10) {
                    errors.push('Cover letter must be at least 10 characters long');
                }
                
                if (errors.length > 0) {
                    showPopup(`Please fix the following:\n• ${errors.join('\n• ')}`, false);
                    return;
                }
                
                // Show loading state
                showLoadingState(submitBtn, originalText);
                
                // Submit to backend
                const result = await submitCareerForm(data);
                
                if (result.success) {
                    showPopup(result.message, true);
                    careerForm.reset();
                    
                    // Scroll to top of form to show success
                    careerForm.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                } else {
                    throw new Error(result.message || 'Submission failed');
                }
                
            } catch (error) {
                console.error('Career form error:', error);
                
                let errorMessage = 'Sorry, there was an error submitting your application. ';
                
                if (error.message.includes('rate limit')) {
                    errorMessage += 'Please wait a few minutes before trying again.';
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage += 'Please check your internet connection and try again.';
                } else {
                    errorMessage += 'Please try again or contact us directly at arun93.akt@gmail.com';
                }
                
                showPopup(errorMessage, false);
            } finally {
                resetButtonState(submitBtn, originalText);
            }
        });
    }

    // Enhanced Contact Form Submission with Email Integration
    const contactForm = document.getElementById('contact-form');

    if (contactForm && popup) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            try {
                // Get form data
                const formData = new FormData(contactForm);
                const data = {
                    name: formData.get('name')?.trim(),
                    email: formData.get('email')?.trim(),
                    subject: formData.get('subject')?.trim(),
                    message: formData.get('message')?.trim()
                };
                
                // Client-side validation
                const errors = [];
                
                if (!data.name || data.name.length < 2) {
                    errors.push('Name must be at least 2 characters long');
                }
                
                if (!data.email || !validateEmail(data.email)) {
                    errors.push('Please enter a valid email address');
                }
                
                if (!data.subject || data.subject.length < 3) {
                    errors.push('Subject must be at least 3 characters long');
                }
                
                if (!data.message || data.message.length < 10) {
                    errors.push('Message must be at least 10 characters long');
                }
                
                if (errors.length > 0) {
                    showPopup(`Please fix the following:\n• ${errors.join('\n• ')}`, false);
                    return;
                }
                
                // Show loading state
                showLoadingState(submitBtn, originalText);
                
                // Submit to backend
                const result = await submitContactForm(data);
                
                if (result.success) {
                    showPopup(result.message, true);
                    contactForm.reset();
                    
                    // Scroll to top of form to show success
                    contactForm.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                } else {
                    throw new Error(result.message || 'Submission failed');
                }
                
            } catch (error) {
                console.error('Contact form error:', error);
                
                let errorMessage = 'Sorry, there was an error sending your message. ';
                
                if (error.message.includes('rate limit')) {
                    errorMessage += 'Please wait a few minutes before trying again.';
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage += 'Please check your internet connection and try again.';
                } else {
                    errorMessage += 'Please try again or contact us directly at arun93.akt@gmail.com';
                }
                
                showPopup(errorMessage, false);
            } finally {
                resetButtonState(submitBtn, originalText);
            }
        });
    }

    // Smooth scrolling for navigation with mobile fallbacks
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Check if smooth scrolling is supported
                if ('scrollBehavior' in document.documentElement.style) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                } else {
                    // Fallback for browsers that don't support smooth scrolling
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    window.scrollTo({
                        top: targetPosition - 80, // Adjust for header height
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Header scroll effect
    function handleHeaderScroll() {
        const header = document.querySelector('header');
        if (window.scrollY > 50) {
            header.style.padding = '5px 0';
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.padding = '15px 0';
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    }
    
    window.addEventListener('scroll', handleHeaderScroll);
    handleHeaderScroll(); // Initial call

    // Animations on scroll using Intersection Observer
    if ('IntersectionObserver' in window) {
        const animateElements = document.querySelectorAll('.animate-fade-up, .animate-fade-in');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        animateElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for browsers that don't support Intersection Observer
        const animateElements = document.querySelectorAll('.animate-fade-up, .animate-fade-in');
        animateElements.forEach(element => {
            element.classList.add('animate-active');
        });
    }
    
    // Fix for iOS form focus issues
    const formInputs = document.querySelectorAll('input, textarea, select');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            // Add a small timeout to ensure the keyboard is fully visible
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });

    // Enhanced popup styles (inject if not present)
    const popupStyles = `
        .popup {
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 400px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            transform: translateX(120%);
            transition: transform 0.3s ease, opacity 0.3s ease;
            z-index: 10000;
            opacity: 0;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .popup.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .popup.success {
            background: linear-gradient(135deg, #22c55e, #16a34a);
        }
        
        .popup.error {
            background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
        
        @media (max-width: 768px) {
            .popup {
                top: 10px;
                right: 10px;
                left: 10px;
                transform: translateY(-120%);
                max-width: none;
                font-size: 13px;
            }
            
            .popup.show {
                transform: translateY(0);
            }
        }
    `;
    
    // Inject enhanced popup styles if not present
    if (!document.querySelector('#popup-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'popup-styles';
        styleSheet.textContent = popupStyles;
        document.head.appendChild(styleSheet);
    }

    // Test API connection on page load (optional - uncomment to enable)
    async function testAPIConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/health`);
            if (response.ok) {
                console.log('✅ Email service is connected and ready');
            } else {
                console.warn('⚠️ Email service is not responding properly');
            }
        } catch (error) {
            console.warn('⚠️ Could not connect to email service:', error.message);
        }
    }
    
    // Uncomment the line below to test API connection on page load
    // testAPIConnection();
});