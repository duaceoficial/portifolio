  // Mobile menu toggle
    document.addEventListener('DOMContentLoaded', function() {
      // Page load animation sequence
      function initPageAnimations() {
        const navbar = document.getElementById('navbar');
        const heroContent = document.querySelector('.hero-content');
        const scrollProgress = document.querySelector('.scroll-progress');
        
        // Add page loaded class to trigger animations
        setTimeout(() => {
          if (navbar) navbar.classList.add('page-loaded');
          if (heroContent) heroContent.classList.add('page-loaded');
          if (scrollProgress) scrollProgress.classList.add('page-loaded');
        }, 100);
      }

      // Initialize page animations
      initPageAnimations();

      const menuToggle = document.querySelector('.menu-toggle');
      const navUl = document.querySelector('nav ul');
      const navLinks = document.querySelectorAll('nav ul li a');

      if (menuToggle && navUl) {
        menuToggle.addEventListener('click', function() {
          navUl.classList.toggle('active');
          const icon = this.querySelector('i');
          icon.classList.toggle('fa-bars');
          icon.classList.toggle('fa-times');
        });

        // Close menu when clicking on links
        navLinks.forEach(link => {
          link.addEventListener('click', function() {
            navUl.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
          });
        });
      }

      // Smooth scrolling
      navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          const href = this.getAttribute('href');
          if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
              const offsetTop = targetElement.offsetTop - 70;
              window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
              });
            }
          }
        });
      });

      // Enhanced scroll effects with fade
      let ticking = false;
      function updateScrollEffects() {
        const navbar = document.getElementById('navbar');
        const scrollPercent = Math.min((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100, 100);
        
        // Update CSS custom property for scroll percentage
        document.documentElement.style.setProperty('--scroll-percent', scrollPercent);
        
        // Navbar background change
        if (window.scrollY > 50) {
          navbar.style.background = 'rgba(0, 0, 0, 0.98)';
        } else {
          navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        }
        
        ticking = false;
      }

      window.addEventListener('scroll', function() {
        if (!ticking) {
          requestAnimationFrame(updateScrollEffects);
          ticking = true;
        }
      });

      // Enhanced form submission with validation and feedback
      const form = document.getElementById('contactForm');
      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const submitBtn = this.querySelector('.submit-btn');
          const btnText = submitBtn.querySelector('.btn-text');
          const btnLoading = submitBtn.querySelector('.btn-loading');
          
          // Show loading state
          btnText.style.display = 'none';
          btnLoading.style.display = 'inline-flex';
          submitBtn.disabled = true;
          
          // Simple form validation
          const inputs = form.querySelectorAll('input[required], textarea[required]');
          let valid = true;
          let errors = [];
          
          inputs.forEach(input => {
            if (!input.value.trim()) {
              valid = false;
              input.style.borderColor = '#ff4444';
              errors.push(`The ${input.previousElementSibling.textContent} field is required`);
            } else {
              input.style.borderColor = 'var(--border-color)';
            }
          });
          
          // Email validation
          const emailInput = form.querySelector('#email');
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailInput.value && !emailRegex.test(emailInput.value)) {
            valid = false;
            emailInput.style.borderColor = '#ff4444';
            errors.push('Please enter a valid email address');
          }
          
          // Simulate form submission
          setTimeout(() => {
            if (valid) {
              // Simulate successful submission
              showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
              form.reset();
              // Reset all border colors
              inputs.forEach(input => {
                input.style.borderColor = 'var(--border-color)';
              });
              
              // Track successful form submission
              trackEvent('Contact', 'Form Submit', 'Success');
            } else {
              showNotification(errors[0], 'error');
              trackEvent('Contact', 'Form Submit', 'Validation Error');
            }
            
            // Reset button state
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
          }, 2000);
        });
      }

      // Enhanced notification system
      function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
          position: fixed;
          top: 100px;
          right: 20px;
          padding: 1.2rem 1.8rem;
          border-radius: 12px;
          color: white;
          font-weight: 500;
          z-index: 10000;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          max-width: 400px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;
        
        if (type === 'success') {
          notification.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
        } else if (type === 'error') {
          notification.style.background = 'linear-gradient(45deg, #dc3545, #e74c3c)';
        } else {
          notification.style.background = 'linear-gradient(45deg, var(--primary-color), var(--primary-dark))';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
          notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Hide notification
        setTimeout(() => {
          notification.style.transform = 'translateX(100%)';
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification);
            }
          }, 300);
        }, 6000);
      }

      // Enhanced animation system for page elements with different animation types
      const animationObserverOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
      };

      const animationObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Define different animation delays and types based on element
            let delay = 0;
            let animationType = 'animate-in';

            if (entry.target.classList.contains('section-header')) {
              delay = 0;
            } else if (entry.target.classList.contains('award-logo')) {
              delay = index * 150;
            } else if (entry.target.classList.contains('team-member')) {
              delay = index * 200;
            } else if (entry.target.classList.contains('service-item')) {
              delay = index * 200;
            } else if (entry.target.classList.contains('playlist-item')) {
              delay = index * 250;
            } else if (entry.target.classList.contains('release-item')) {
              delay = index * 180;
            } else if (entry.target.classList.contains('testimonial')) {
              delay = index * 220;
            } else if (entry.target.classList.contains('process-step')) {
              delay = index * 350;
            } else if (entry.target.classList.contains('contact-form') || entry.target.classList.contains('contact-info')) {
              delay = 200;
            } else {
              delay = 100;
            }
            
            setTimeout(() => {
              entry.target.classList.add(animationType);
            }, delay);
            
            // Stop observing once animated
            animationObserver.unobserve(entry.target);
          }
        });
      }, animationObserverOptions);

      // Observe all animatable elements with specific classes
      const animatableElements = document.querySelectorAll(`
        .section-header, .award-logo, .team-member, .service-item, 
        .playlist-item, .release-item, .testimonial, .process-step,
        .trailer-wrapper, .contact-form, .contact-info, footer
      `);

      animatableElements.forEach(element => {
        animationObserver.observe(element);
      });

      // Enhanced staggered animation for grid items
      const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const gridItems = entry.target.querySelectorAll('.award-logo, .service-item, .team-member, .playlist-item, .release-item, .testimonial, .process-step');
            
            gridItems.forEach((item, index) => {
              setTimeout(() => {
                item.classList.add('animate-in');
              }, index * 100);
            });
            
            staggerObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      // Observe grid containers
      const gridContainers = document.querySelectorAll('.awards-grid, .services-grid, .team-grid, .playlists-grid, .releases-grid, .testimonials-grid, .process-grid');
      gridContainers.forEach(container => {
        staggerObserver.observe(container);
      });

      // Special animation for elements that enter from different directions
      const leftAnimElements = document.querySelectorAll('.contact-form');
      const rightAnimElements = document.querySelectorAll('.contact-info');
      
      leftAnimElements.forEach(el => el.classList.add('scroll-animate-left'));
      rightAnimElements.forEach(el => el.classList.add('scroll-animate-right'));

      // Observe directional animation elements
      const directionalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            directionalObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });

      [...leftAnimElements, ...rightAnimElements].forEach(el => {
        directionalObserver.observe(el);
      });

      // Enhanced scroll progress with element counter
      let totalElements = animatableElements.length;
      let animatedElements = 0;

      const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            animatedElements++;
            
            // Update progress
            const progressPercent = (animatedElements / totalElements) * 100;
            console.log(`Animation progress: ${progressPercent.toFixed(1)}%`);
            
            progressObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      animatableElements.forEach(el => {
        progressObserver.observe(el);
      });

      // Enhanced lazy loading for iframes
      const iframes = document.querySelectorAll('iframe[loading="lazy"]');
      const iframeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            if (iframe.dataset.src) {
              iframe.src = iframe.dataset.src;
              iframe.removeAttribute('data-src');
            }
            iframe.parentElement.classList.remove('loading');
            iframeObserver.unobserve(iframe);
          }
        });
      }, { rootMargin: '50px' });

      iframes.forEach(iframe => {
        iframe.parentElement.classList.add('loading');
        iframeObserver.observe(iframe);
      });

      // Enhanced ripple effect for buttons
      const buttons = document.querySelectorAll('.cta-button, .submit-btn');
      buttons.forEach(button => {
        button.addEventListener('click', function(e) {
          const ripple = document.createElement('span');
          const rect = this.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;
          
          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = x + 'px';
          ripple.style.top = y + 'px';
          ripple.classList.add('ripple');
          
          this.appendChild(ripple);
          
          setTimeout(() => {
            if (ripple.parentNode) {
              ripple.remove();
            }
          }, 600);
        });
      });

      // Enhanced parallax effect with performance optimization
      function updateParallax() {
        const scrolled = window.pageYOffset;
        const hero = document.getElementById('showcase');
        if (hero && scrolled < window.innerHeight) {
          hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
      }

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      });

      // Typing effect for hero title with cursor
      const heroTitle = document.querySelector('.hero-content h1');
      if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        
        const typeWriter = () => {
          if (i < text.length) {
            heroTitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 150);
          } else {
            // Add blinking cursor effect
            const cursor = document.createElement('span');
            cursor.textContent = '|';
            cursor.style.animation = 'blink 1s infinite';
            cursor.style.marginLeft = '2px';
            cursor.style.color = 'var(--primary-color)';
            heroTitle.appendChild(cursor);
            
            // Remove cursor after 3 seconds
            setTimeout(() => {
              if (cursor.parentNode) {
                cursor.remove();
              }
            }, 3000);
          }
        };
        
        // Start typing effect after page load animations
        setTimeout(typeWriter, 1200);
      }

      // Add hover effects with improved performance
      const hoverElements = document.querySelectorAll('.team-member, .release-item, .cta-button, .service-item, .playlist-item, .award-logo');
      hoverElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
          this.classList.add('hovered');
        });
        
        element.addEventListener('mouseleave', function() {
          this.classList.remove('hovered');
        });
      });

      // Analytics tracking (placeholder - replace with actual analytics)
      function trackEvent(category, action, label) {
        console.log(`Analytics: ${category} - ${action} - ${label}`);
        // Replace with actual analytics code
        // gtag('event', action, { 'event_category': category, 'event_label': label });
      }

      // Track button clicks
      document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('click', () => {
          trackEvent('User Interaction', 'CTA Click', 'Hero Button');
        });
      });

      // Track social media clicks
      document.querySelectorAll('.social-links a').forEach(link => {
        link.addEventListener('click', (e) => {
          const platform = e.target.closest('a').getAttribute('aria-label');
          trackEvent('Social Media', 'Click', platform);
        });
      });

      // Track section views
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionName = entry.target.id || 'Unknown Section';
            trackEvent('Page View', 'Section View', sectionName);
          }
        });
      }, { threshold: 0.5 });

      document.querySelectorAll('section[id]').forEach(section => {
        sectionObserver.observe(section);
      });

      // Performance monitoring
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          const loadTime = Math.round(perfData.loadEventEnd - perfData.loadEventStart);
          console.log(`Page load time: ${loadTime}ms`);
          
          // Track load time if using analytics
          trackEvent('Performance', 'Page Load Time', loadTime.toString());
          
          // Start floating elements animation after page load
          const floatingElements = document.querySelector('.floating-elements');
          if (floatingElements) {
            floatingElements.classList.add('page-loaded');
          }
        }, 0);
      });

      // Add keyboard navigation support
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          // Close mobile menu if open
          if (navUl && navUl.classList.contains('active')) {
            navUl.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
          }
        }
      });
    });