document.addEventListener('DOMContentLoaded', () => {
  // === CUSTOM TRAILING CURSOR ===
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let isHovered = false;

  // Track mouse coordinates
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediately position the inner dot
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }
  });

  // Smoothly interpolate the outer ring (physics lag effect)
  function animateRing() {
    if (cursorRing) {
      // Lerp formula: current = current + (target - current) * ease
      const ease = 0.15;
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;
      
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
    }
    requestAnimationFrame(animateRing);
  }
  
  // Start the animation loop
  animateRing();

  // Handle cursor transformations on click / mouse down
  document.addEventListener('mousedown', () => {
    if (cursorDot && cursorRing) {
      cursorDot.style.transform = 'translate(-50%, -50%) scale(0.6)';
      cursorRing.style.transform = 'translate(-50%, -50%) scale(1.3)';
      cursorRing.style.borderColor = 'var(--accent-secondary)';
    }
  });

  document.addEventListener('mouseup', () => {
    if (cursorDot && cursorRing) {
      cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorRing.style.transform = isHovered ? 'translate(-50%, -50%) scale(1.5)' : 'translate(-50%, -50%) scale(1)';
      cursorRing.style.borderColor = isHovered ? 'var(--accent-hover)' : 'rgba(255, 255, 255, 0.2)';
    }
  });

  // Attach hover states for all clickable elements
  const updateClickablesHover = () => {
    const clickables = document.querySelectorAll('a, button, .card, .social-btn, input, textarea, select');
    clickables.forEach(el => {
      // Prevent attaching duplicate listeners if re-ran
      el.removeEventListener('mouseenter', onMouseEnter);
      el.removeEventListener('mouseleave', onMouseLeave);
      
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
    });
  };

  function onMouseEnter() {
    isHovered = true;
    if (cursorDot && cursorRing) {
      cursorDot.style.transform = 'translate(-50%, -50%) scale(1.2)';
      cursorDot.style.backgroundColor = 'var(--accent-hover)';
      cursorRing.style.transform = 'translate(-50%, -50%) scale(1.5)';
      cursorRing.style.backgroundColor = 'rgba(99, 102, 241, 0.08)';
      cursorRing.style.borderColor = 'var(--accent-hover)';
    }
  }

  function onMouseLeave() {
    isHovered = false;
    if (cursorDot && cursorRing) {
      cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorDot.style.backgroundColor = 'var(--text-heading)';
      cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
      cursorRing.style.backgroundColor = 'transparent';
      cursorRing.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }
  }

  updateClickablesHover();

  // === CARD MOUSE-SPOTLIGHT EFFECT ===
  const updateCardSpotlight = () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  };
  
  updateCardSpotlight();

  // === FLOATING HEADER SCROLLED STATE ===
  const navbar = document.getElementById('navbar');
  const handleNavbarScroll = () => {
    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  };
  window.addEventListener('scroll', handleNavbarScroll);
  handleNavbarScroll();

  // === MOBILE NAVIGATION TOGGLE ===
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      navLinks.classList.toggle('mobile-active');
      
      if (isExpanded) {
        menuIcon.style.display = 'block';
        closeIcon.style.display = 'none';
      } else {
        menuIcon.style.display = 'none';
        closeIcon.style.display = 'block';
      }
    });

    // Close menu when a link is clicked (on mobile)
    const links = navLinks.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        if (navLinks.classList.contains('mobile-active')) {
          menuToggle.setAttribute('aria-expanded', 'false');
          navLinks.classList.remove('mobile-active');
          menuIcon.style.display = 'block';
          closeIcon.style.display = 'none';
        }
      });
    });
  }

  // === ACTIVE NAV LINK HIGHLIGHTING ON SCROLL (SCROLLSPY) ===
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    let current = '';
    const scrollPos = window.scrollY + 120; // offset for floating pill navbar

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', onScroll);
  onScroll(); // initial check

  // === CONTACT FORM VALIDATION & MODAL ===
  const contactForm = document.getElementById('contact-form');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close');

  if (contactForm && modalOverlay && modalCloseBtn) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const messageInput = document.getElementById('form-message');
      
      let isValid = true;

      [nameInput, emailInput, messageInput].forEach(input => {
        if (input) input.style.borderColor = '';
      });

      if (!nameInput || !nameInput.value.trim()) {
        if (nameInput) nameInput.style.borderColor = 'var(--accent-secondary)';
        isValid = false;
      }

      if (!emailInput || !emailInput.value.trim() || !validateEmail(emailInput.value)) {
        if (emailInput) emailInput.style.borderColor = 'var(--accent-secondary)';
        isValid = false;
      }

      if (!messageInput || !messageInput.value.trim()) {
        if (messageInput) messageInput.style.borderColor = 'var(--accent-secondary)';
        isValid = false;
      }

      if (isValid) {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
        contactForm.reset();
        
        // Reset custom cursor hover state context
        onMouseLeave();
      }
    });

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
      onMouseLeave();
    };

    modalCloseBtn.addEventListener('click', closeModal);
    
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
      }
    });
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }
});
