document.addEventListener('DOMContentLoaded', () => {
  // === CUSTOM TRAILING CURSOR ===
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let isHovered = false;
  let lastStarTrailAt = 0;
  const canUseCursorTrail = window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initialize Custom Cursor Display if Supported
  if (canUseCursorTrail && cursorDot && cursorRing) {
    document.body.classList.add('custom-cursor-active');
    cursorDot.style.display = 'block';
    cursorRing.style.display = 'block';
  }

  // Parallax variables and cached DOM elements
  let parallaxMouseX = 0, parallaxMouseY = 0;
  let currentParallaxX = 0, currentParallaxY = 0;
  const canUseParallax = canUseCursorTrail;
  const starsWrapper = document.querySelector('.stars-wrapper');
  const blob1 = document.querySelector('.blob-1');
  const blob2 = document.querySelector('.blob-2');
  const blob3 = document.querySelector('.blob-3');

  const createCursorStar = (x, y) => {
    const star = document.createElement('span');
    const size = Math.random() * 3 + 2;
    const driftX = (Math.random() - 0.5) * 34;
    const driftY = (Math.random() - 0.5) * 34;
    const angle = Math.random() * 80 - 40;

    star.className = 'cursor-star';
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.setProperty('--star-size', `${size}px`);
    star.style.setProperty('--star-drift-x', `${driftX}px`);
    star.style.setProperty('--star-drift-y', `${driftY}px`);
    star.style.setProperty('--star-angle', `${angle}deg`);

    document.body.appendChild(star);
    
    let isRemoved = false;
    const cleanup = () => {
      if (!isRemoved) {
        isRemoved = true;
        star.remove();
      }
    };
    star.addEventListener('animationend', cleanup, { once: true });
    setTimeout(cleanup, 1200); // safety fallback to prevent DOM node leaks
  };

  const createButtonMeteor = (x, y) => {
    const meteor = document.createElement('span');
    const size = Math.random() * 3 + 3;
    const distance = Math.random() * 80 + 44;
    const angle = Math.random() * Math.PI * 2;
    const driftX = Math.cos(angle) * distance;
    const driftY = Math.sin(angle) * distance;

    meteor.className = 'button-meteor';
    meteor.style.left = `${x}px`;
    meteor.style.top = `${y}px`;
    meteor.style.setProperty('--meteor-size', `${size}px`);
    meteor.style.setProperty('--meteor-x', `${driftX}px`);
    meteor.style.setProperty('--meteor-y', `${driftY}px`);
    meteor.style.setProperty('--meteor-angle', `${(angle * 180 / Math.PI) + 180}deg`);

    document.body.appendChild(meteor);
    
    let isRemoved = false;
    const cleanup = () => {
      if (!isRemoved) {
        isRemoved = true;
        meteor.remove();
      }
    };
    meteor.addEventListener('animationend', cleanup, { once: true });
    setTimeout(cleanup, 1200); // safety fallback to prevent DOM node leaks
  };

  const createMeteorBurst = (x, y) => {
    if (!canUseCursorTrail) return;
    const count = Math.floor(Math.random() * 5) + 8;
    for (let i = 0; i < count; i++) {
      window.setTimeout(() => createButtonMeteor(x, y), i * 18);
    }
  };

  // Track mouse coordinates
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Immediately position the inner dot
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }

    if (canUseCursorTrail) {
      const now = performance.now();
      if (now - lastStarTrailAt > 26) {
        createCursorStar(mouseX, mouseY);
        lastStarTrailAt = now;
      }

      // Parallax mouse position
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      parallaxMouseX = (e.clientX - centerX) / centerX;
      parallaxMouseY = (e.clientY - centerY) / centerY;
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

    // Update parallax values
    if (canUseParallax) {
      const pEase = 0.08;
      currentParallaxX += (parallaxMouseX - currentParallaxX) * pEase;
      currentParallaxY += (parallaxMouseY - currentParallaxY) * pEase;
      
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      if (starsWrapper) {
        starsWrapper.style.setProperty('--stars-parallax-x', `${currentParallaxX * -25}px`);
        starsWrapper.style.setProperty('--stars-parallax-y', `${currentParallaxY * -25}px`);
      }
      
      if (blob1) {
        blob1.style.setProperty('--blob-1-parallax-x', `${currentParallaxX * 30}px`);
        blob1.style.setProperty('--blob-1-parallax-y', `${currentParallaxY * 30 + scrollTop * 0.08}px`);
      }

      if (blob2) {
        blob2.style.setProperty('--blob-2-parallax-x', `${currentParallaxX * -40}px`);
        blob2.style.setProperty('--blob-2-parallax-y', `${currentParallaxY * -40 + scrollTop * -0.06}px`);
      }

      if (blob3) {
        blob3.style.setProperty('--blob-3-parallax-x', `${currentParallaxX * 20}px`);
        blob3.style.setProperty('--blob-3-parallax-y', `${currentParallaxY * 20 + scrollTop * 0.04}px`);
      }
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

  document.querySelectorAll('.btn, .social-btn, .card-arrow-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      createMeteorBurst(e.clientX, e.clientY);
    });
  });

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

  // === SCROLL REVEAL — INTERSECTION OBSERVER ===
  const revealEls = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale'
  );
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(el => revealObserver.observe(el));
  }

  // === FULLPAGE SECTION SNAP ===
  const snapSections = Array.from(document.querySelectorAll('main > section'));
  let snapCurrentIdx = 0;
  let snapAnimating = false;
  const SNAP_COOLDOWN = 950;

  const getSnapIdx = () => {
    const ref = window.scrollY + window.innerHeight * 0.35;
    let idx = 0;
    snapSections.forEach((sec, i) => {
      if (sec.offsetTop <= ref) idx = i;
    });
    return idx;
  };

  const getSectionScrollTarget = (sec) => {
    const secTop = sec.offsetTop;
    const secHeight = sec.offsetHeight;
    const viewHeight = window.innerHeight;
    const navOffset = 95; // height of navbar + margin breathing room

    if (['home', 'about', 'skills', 'projects', 'contact'].includes(sec.id)) {
      return secTop;
    }

    const centeredTarget = secTop - (viewHeight - secHeight) / 2;
    const minTarget = secTop - navOffset;

    return Math.min(centeredTarget, minTarget);
  };

  const snapGoTo = (direction) => {
    if (snapAnimating) return;
    snapAnimating = true;

    if (direction > 0) {
      // --- Scrolling DOWN ---
      const nextIdx = snapCurrentIdx + 1;
      if (nextIdx < snapSections.length) {
        snapCurrentIdx = nextIdx;
        const target = getSectionScrollTarget(snapSections[nextIdx]);
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
    } else {
      // --- Scrolling UP ---
      const prevIdx = snapCurrentIdx - 1;
      if (prevIdx >= 0) {
        snapCurrentIdx = prevIdx;
        let target = getSectionScrollTarget(snapSections[prevIdx]);
        
        // Premium touch: if snapping UP to projects, target the bottom of the projects section
        if (snapSections[prevIdx].id === 'projects') {
          const viewHeight = window.innerHeight;
          target = snapSections[prevIdx].offsetTop + snapSections[prevIdx].offsetHeight - viewHeight;
        }
        
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
    }

    setTimeout(() => { snapAnimating = false; }, SNAP_COOLDOWN);
  };

  // Wheel: scroll direction
  window.addEventListener('wheel', (e) => {
    // Don't intercept inside modals or form elements
    if (e.target.closest('.modal-overlay')) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const viewportBottom = scrollTop + viewportHeight;

    const projectsSec = document.getElementById('projects');
    if (projectsSec) {
      const projectsTop = projectsSec.offsetTop;
      const projectsBottom = projectsTop + projectsSec.offsetHeight;

      // Check if viewport is within the projects section boundaries
      // We add a tiny buffer (15px) to prevent subpixel issues
      const isInsideProjects = (scrollTop >= projectsTop - 15 && scrollTop <= projectsBottom - viewportHeight + 15);
      
      if (isInsideProjects) {
        if (e.deltaY > 0) {
          // Scrolling down: only snap to next if we've reached the bottom of projects
          if (viewportBottom >= projectsBottom - 15) {
            e.preventDefault();
            if (snapAnimating) return;
            snapCurrentIdx = getSnapIdx();
            snapGoTo(1);
          } else {
            // Let native scroll scroll down inside projects
            return;
          }
        } else if (e.deltaY < 0) {
          // Scrolling up: only snap to prev if we've reached the top of projects
          if (scrollTop <= projectsTop + 15) {
            e.preventDefault();
            if (snapAnimating) return;
            snapCurrentIdx = getSnapIdx();
            snapGoTo(-1);
          } else {
            // Let native scroll scroll up inside projects
            return;
          }
        }
        return;
      }
    }

    e.preventDefault();
    if (snapAnimating) return;
    snapCurrentIdx = getSnapIdx();
    if (e.deltaY > 0) snapGoTo(1);
    else if (e.deltaY < 0) snapGoTo(-1);
  }, { passive: false });

  // Touch: swipe up/down
  let touchStartY = 0;
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    if (snapAnimating) return;
    const delta = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) < 60) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const viewportBottom = scrollTop + viewportHeight;

    const projectsSec = document.getElementById('projects');
    if (projectsSec) {
      const projectsTop = projectsSec.offsetTop;
      const projectsBottom = projectsTop + projectsSec.offsetHeight;
      const isInsideProjects = (scrollTop >= projectsTop - 15 && scrollTop <= projectsBottom - viewportHeight + 15);

      if (isInsideProjects) {
        if (delta > 0) {
          // Swipe up (scrolls down): only snap if we've reached the bottom
          if (viewportBottom < projectsBottom - 20) {
            return; // Let native swipe scroll down inside projects
          }
        } else {
          // Swipe down (scrolls up): only snap if we've reached the top
          if (scrollTop > projectsTop + 20) {
            return; // Let native swipe scroll up inside projects
          }
        }
      }
    }

    snapCurrentIdx = getSnapIdx();
    if (delta > 0) snapGoTo(1);
    else if (delta < 0) snapGoTo(-1);
  }, { passive: true });

  // Keyboard: arrow/page keys
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight;
      const viewportBottom = scrollTop + viewportHeight;

      const projectsSec = document.getElementById('projects');
      if (projectsSec) {
        const projectsTop = projectsSec.offsetTop;
        const projectsBottom = projectsTop + projectsSec.offsetHeight;
        const isInsideProjects = (scrollTop >= projectsTop - 15 && scrollTop <= projectsBottom - viewportHeight + 15);

        if (isInsideProjects) {
          if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            if (viewportBottom < projectsBottom - 20) {
              // Let native scrolling handle it
              return;
            }
          } else {
            if (scrollTop > projectsTop + 20) {
              // Let native scrolling handle it
              return;
            }
          }
        }
      }

      e.preventDefault();
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        snapGoTo(1);
      } else {
        snapGoTo(-1);
      }
    }
  });

  // Intercept nav link clicks for custom centered scroll
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    if (link.id === 'logo-link') return; // Handled separately by Feature 6 Easter Egg
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;
      const targetSec = document.querySelector(targetId);
      if (targetSec) {
        e.preventDefault();
        const targetScroll = getSectionScrollTarget(targetSec);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        
        const targetIdx = snapSections.indexOf(targetSec);
        if (targetIdx !== -1) {
          snapCurrentIdx = targetIdx;
        }
      }
    });
  });

  // === ROCKET SCROLL INDICATOR ===
  const rocketIndicator = document.getElementById('rocket-scroll-indicator');
  const rocketFill = document.querySelector('.rocket-scroll-fill');
  const rocketShip = document.querySelector('.rocket-scroll-ship');

  if (rocketIndicator && rocketFill && rocketShip) {
    const updateRocketScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (docHeight <= 0) return;

      const scrollPercent = (scrollTop / docHeight) * 100;

      // Update progress fill height
      rocketFill.style.height = `${scrollPercent}%`;

      // Update rocket position along the track
      rocketShip.style.top = `${scrollPercent}%`;

      // Show indicator only when scrolled past 50px
      if (scrollTop > 50) {
        rocketIndicator.classList.add('is-visible');
      } else {
        rocketIndicator.classList.remove('is-visible');
      }
    };

    window.addEventListener('scroll', updateRocketScroll);
    updateRocketScroll(); // Initial call

    // Click rocket to scroll back to top smoothly
    rocketShip.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // === FEATURE 6: EASTER EGG BLACK HOLE ===
  const logoLink = document.getElementById('logo-link');
  let blackHoleActive = false; // Guard flag — prevents re-trigger on misclick

  if (logoLink) {
    let logoClicks = 0;
    let clickTimeout;

    logoLink.addEventListener('click', (e) => {
      e.preventDefault();    // Prevent default anchor scroll
      e.stopPropagation();   // Stop other listeners from capturing this click

      // While black hole is animating, ignore all further clicks entirely
      if (blackHoleActive) return;

      logoClicks++;
      
      clearTimeout(clickTimeout);

      if (logoClicks >= 3) {
        logoClicks = 0;
        clearTimeout(clickTimeout); // Cancel any pending interactions
        triggerBlackHole();
      } else {
        clickTimeout = setTimeout(() => {
          if (logoClicks === 1) {
            // Click 1: Spin logo + launch rocket
            triggerLogoRocketOrbit();
            
            // Also scroll to home on single click IF the user is already on the home section
            if (snapCurrentIdx === 0) {
              const targetId = logoLink.getAttribute('href'); // "#home"
              const targetSec = document.querySelector(targetId);
              if (targetSec) {
                const targetScroll = getSectionScrollTarget(targetSec);
                window.scrollTo({ top: targetScroll, behavior: 'smooth' });
                snapCurrentIdx = 0;
              }
            }
          } else if (logoClicks === 2) {
            // Click 2: Supernova flash + warp speed background
            triggerLogoSupernovaWarp();
          }
          logoClicks = 0;
        }, 350); // 350ms window — enough time to register double/triple click
      }
    });

    function triggerBlackHole() {
      // Guard: Don't trigger if already active
      if (blackHoleActive) return;
      blackHoleActive = true;
      snapAnimating = true; // Lock snap scroll so the page stays put during animation
      // Create or select wrapper with Gargantua-style sub-elements
      let bhWrapper = document.querySelector('.black-hole-wrapper');
      if (!bhWrapper) {
        bhWrapper = document.createElement('div');
        bhWrapper.className = 'black-hole-wrapper';
        bhWrapper.innerHTML = `
          <div class="gargantua-lensing-ring"></div>
          <div class="gargantua-back-disk"></div>
          <div class="gargantua-horizontal-disk"></div>
          <div class="black-hole-core"></div>
        `;
        // Insert right after logo
        logoLink.parentNode.insertBefore(bhWrapper, logoLink.nextSibling);
      }

      // Calculate logo center relative to its parent (.nav-container)
      const logoRect = logoLink.getBoundingClientRect();
      const parentRect = logoLink.parentNode.getBoundingClientRect();
      const leftOffset = logoRect.left - parentRect.left + logoRect.width / 2;
      const topOffset = logoRect.top - parentRect.top + logoRect.height / 2;

      // Position black hole exactly at logo center
      bhWrapper.style.left = `${leftOffset}px`;
      bhWrapper.style.top = `${topOffset}px`;

      // Activate Black Hole
      bhWrapper.classList.add('active');

      // Warp background stars
      const starsWrapper = document.querySelector('.stars-wrapper');
      if (starsWrapper) {
        starsWrapper.classList.add('pull');
      }

      // Select all candidate elements across different sections (leaf-level only for independent spin)
      const candidates = document.querySelectorAll(
        'h1, h2, h3, h4, h5, h6, p, img, a, button, input, textarea, label, ' +
        '.card, .coming-soon-card, .skill-card, ' +
        '.status-badge, .section-label, .stat-box, .photo-frame-container, ' +
        '.contact-form-container, .contact-info, .contact-item, ' +
        '.social-btn, .rocket-scroll-indicator, .audio-toggle-btn'
      );
      
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Filter candidates to only those visible in the current viewport
      const visibleElements = Array.from(candidates).filter(el => {
        if (el.classList.contains('black-hole-wrapper') || el.closest('.black-hole-wrapper')) return false;
        
        const rect = el.getBoundingClientRect();
        return (
          rect.top < viewportHeight &&
          rect.bottom > 0 &&
          rect.left < viewportWidth &&
          rect.right > 0 &&
          rect.width > 0 &&
          rect.height > 0
        );
      });

      // Filter out elements that have an ancestor already included in the visible list.
      // This prevents nested parent-child double-transform/translation bugs!
      const filteredElements = [];
      visibleElements.forEach(el => {
        let hasAncestorInList = false;
        let parent = el.parentElement;
        while (parent) {
          if (visibleElements.includes(parent)) {
            hasAncestorInList = true;
            break;
          }
          parent = parent.parentElement;
        }
        if (!hasAncestorInList) {
          filteredElements.push(el);
        }
      });

      // Merge with navbar links (so the nav items are always pulled)
      const navLinks = document.querySelectorAll('.nav-link, .nav-logo, .menu-toggle');
      const allToPull = Array.from(new Set([...navLinks, ...filteredElements]));

      // Global center of gravity (black hole center coords in viewport)
      const bhCenterX = logoRect.left + logoRect.width / 2;
      const bhCenterY = logoRect.top + logoRect.height / 2;

      allToPull.forEach((el, index) => {
        // Exclude the wrapper itself
        if (el.classList.contains('black-hole-wrapper') || el.closest('.black-hole-wrapper')) return;

        // Snapshot current computed opacity & transform BEFORE disabling animation
        // This prevents heroFadeUp forwards fill-mode from resetting elements to opacity:0
        const computedStyle = window.getComputedStyle(el);
        const currentOpacity = computedStyle.opacity;
        const currentTransform = computedStyle.transform;

        // Freeze the element at its current painted state
        if (currentTransform && currentTransform !== 'none') {
          el.style.transform = currentTransform;
        }
        el.style.opacity = currentOpacity;

        // Now safely disable animations (won't reset to keyframe start since we locked the state)
        el.style.animation = 'none';

        // Custom transition for spiraling pull effect
        el.style.transition = 'transform 2.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 2.4s ease';

        // Force a browser reflow to ensure the transition is registered immediately
        void el.offsetHeight;

        if (el.id === 'logo-link') {
          // Logo spins rapidly and is sucked in immediately
          el.style.transform = 'scale(0) rotate(1440deg)';
          el.style.opacity = '0';
          return;
        }

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = bhCenterX - centerX;
        const deltaY = bhCenterY - centerY;

        // Stagger delays based on distance / index to create a flowing spiral line
        const delay = Math.min(index * 25, 500);

        setTimeout(() => {
          // Translate to center, scale to 0.01 (crushed), and rotate 1080deg (3 full spins!)
          el.style.transform = `translate3d(${deltaX * 0.96}px, ${deltaY * 0.96}px, 0) scale(0.01) rotate(1080deg)`;
          el.style.opacity = '0';
        }, delay);
      });

      // After 4.2s start imploding
      setTimeout(() => {
        bhWrapper.classList.add('collapsing');
      }, 4200);

      // After 5.0s collapse completely and restore all elements
      setTimeout(() => {
        bhWrapper.classList.remove('active', 'collapsing');
        
        if (starsWrapper) {
          starsWrapper.classList.remove('pull');
        }

        // Restore items with original styling/transitions/animations
        allToPull.forEach(el => {
          el.style.animation = '';
          el.style.transition = '';
          el.style.transform = '';
          el.style.opacity = '';
        });

        // Release all locks so the page returns to normal
        blackHoleActive = false;
        snapAnimating = false;
        logoClicks = 0;
      }, 5000);
    }
  }

  // === FEATURE 7: AUDIO TOGGLE AMBIENT SPACE ===
  const audioToggle = document.getElementById('audio-toggle');
  const ambientAudio = document.getElementById('ambient-audio');
  const iconMuted = document.getElementById('audio-icon-muted');
  const iconPlaying = document.getElementById('audio-icon-playing');

  if (audioToggle && ambientAudio && iconMuted && iconPlaying) {
    let fadeInterval;

    const fadeVolume = (targetVolume, durationMs, onComplete) => {
      clearInterval(fadeInterval);
      const startVolume = ambientAudio.volume;
      const volumeDiff = targetVolume - startVolume;
      const steps = 20;
      const stepTime = durationMs / steps;
      let currentStep = 0;

      fadeInterval = setInterval(() => {
        currentStep++;
        ambientAudio.volume = startVolume + (volumeDiff * (currentStep / steps));
        if (currentStep >= steps) {
          ambientAudio.volume = targetVolume;
          clearInterval(fadeInterval);
          if (onComplete) onComplete();
        }
      }, stepTime);
    };

    // Helper: update UI to playing state
    const setPlayingUI = () => {
      audioToggle.classList.add('playing');
      iconMuted.style.display = 'none';
      iconPlaying.style.display = 'block';
    };

    // Helper: update UI to muted state
    const setMutedUI = () => {
      audioToggle.classList.remove('playing');
      iconMuted.style.display = 'block';
      iconPlaying.style.display = 'none';
    };

    // Helper: start audio playback with fade-in
    const startAudio = () => {
      ambientAudio.volume = 0;
      ambientAudio.play().then(() => {
        setPlayingUI();
        fadeVolume(0.45, 1200);
      }).catch(() => {});
    };

    // --- AUTOPLAY ON PAGE LOAD ---
    // Try to play immediately. Most browsers allow this if user has previously
    // interacted with the site or the browser policy permits it.
    let autoStartPending = false; // Flag to prevent toggle from interfering with auto-start

    ambientAudio.volume = 0;
    ambientAudio.play().then(() => {
      setPlayingUI();
      fadeVolume(0.45, 1500); // Slow fade-in over 1.5s on first load
    }).catch(() => {
      // Browser blocked autoplay — wait for a non-click interaction to avoid
      // conflict with the toggle button click handler.
      autoStartPending = true;

      const onFirstInteraction = () => {
        if (autoStartPending) {
          autoStartPending = false;
          startAudio();
        }
        document.removeEventListener('scroll', onFirstInteraction);
        document.removeEventListener('keydown', onFirstInteraction);
        document.removeEventListener('touchstart', onFirstInteraction);
      };

      // NOTE: 'click' is intentionally NOT used here to avoid race condition
      // with the audio toggle button's own click handler.
      document.addEventListener('scroll', onFirstInteraction, { once: true });
      document.addEventListener('keydown', onFirstInteraction, { once: true });
      document.addEventListener('touchstart', onFirstInteraction, { once: true });
    });

    audioToggle.addEventListener('click', () => {
      // If autoplay is still waiting for first interaction, treat this click
      // as the trigger — start audio and mark as no longer pending.
      if (autoStartPending) {
        autoStartPending = false;
        startAudio();
        return; // Don't fall through to toggle logic (audio just started)
      }

      if (ambientAudio.paused) {
        // Play audio
        ambientAudio.volume = 0;
        ambientAudio.play().then(() => {
          setPlayingUI();
          fadeVolume(0.45, 800); // Fade to 45% volume in 800ms
        }).catch(err => {
          console.warn('Audio play failed:', err);
          playSynthFallback();
        });
      } else {
        // Pause audio with fade out
        fadeVolume(0, 600, () => {
          ambientAudio.pause();
          setMutedUI();
        });
      }
    });

    // Fallback synth in case ambient.mp3 is not loaded
    let synthCtx, synthGain, synthOsc1, synthOsc2;
    function playSynthFallback() {
      try {
        if (!synthCtx) {
          synthCtx = new (window.AudioContext || window.webkitAudioContext)();
          
          synthGain = synthCtx.createGain();
          synthGain.gain.setValueAtTime(0, synthCtx.currentTime);
          
          // low frequency osc for space rumble
          synthOsc1 = synthCtx.createOscillator();
          synthOsc1.type = 'sine';
          synthOsc1.frequency.setValueAtTime(80, synthCtx.currentTime); // 80Hz
          
          // chorused second osc
          synthOsc2 = synthCtx.createOscillator();
          synthOsc2.type = 'triangle';
          synthOsc2.frequency.setValueAtTime(80.5, synthCtx.currentTime); // slightly detuned
          
          const filter = synthCtx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(150, synthCtx.currentTime);
          
          synthOsc1.connect(filter);
          synthOsc2.connect(filter);
          filter.connect(synthGain);
          synthGain.connect(synthCtx.destination);
          
          synthOsc1.start();
          synthOsc2.start();
        }
        
        if (synthCtx.state === 'suspended') {
          synthCtx.resume();
        }
        
        // Trigger UI playing state
        audioToggle.classList.add('playing');
        iconMuted.style.display = 'none';
        iconPlaying.style.display = 'block';
        
        synthGain.gain.linearRampToValueAtTime(0.25, synthCtx.currentTime + 0.8);
      } catch (e) {
        console.error('Web Audio Synth Fallback failed:', e);
      }
    }

    // Intercept click if we are using the synth fallback
    audioToggle.addEventListener('click', () => {
      if (synthCtx && synthCtx.state === 'running' && ambientAudio.paused) {
        synthGain.gain.linearRampToValueAtTime(0, synthCtx.currentTime + 0.6);
        setTimeout(() => {
          synthCtx.suspend();
          audioToggle.classList.remove('playing');
          iconMuted.style.display = 'block';
          iconPlaying.style.display = 'none';
        }, 600);
      }
    });
  }

  // === PROJECTS PAGINATION ===
  const projectCards = document.querySelectorAll('.card-grid .card');
  const paginationBtns = document.querySelectorAll('.projects-pagination .page-num');
  const prevPageBtn = document.querySelector('.projects-pagination .prev-btn');
  const nextPageBtn = document.querySelector('.projects-pagination .next-btn');
  let currentProjectPage = 1;
  const totalProjectPages = 2;

  const showProjectPage = (page) => {
    currentProjectPage = page;
    
    // Toggle active state for page numbers
    paginationBtns.forEach(btn => {
      const btnPage = parseInt(btn.getAttribute('data-target-page'));
      if (btnPage === page) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Toggle disabled state for arrow buttons
    if (prevPageBtn) prevPageBtn.disabled = page === 1;
    if (nextPageBtn) nextPageBtn.disabled = page === totalProjectPages;

    // Show/Hide cards with immediate reveal visibility
    projectCards.forEach(card => {
      const cardPage = parseInt(card.getAttribute('data-page')) || 1;
      if (cardPage === page) {
        card.style.display = 'flex';
        card.classList.add('is-visible');
      } else {
        card.style.display = 'none';
      }
    });
  };

  // Add click listeners to page numbers
  paginationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.getAttribute('data-target-page'));
      showProjectPage(page);
    });
  });

  // Add click listeners to arrow buttons
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentProjectPage > 1) {
        showProjectPage(currentProjectPage - 1);
      }
    });
  }
  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      if (currentProjectPage < totalProjectPages) {
        showProjectPage(currentProjectPage + 1);
      }
    });
  }

  // Initialize page 1
  showProjectPage(1);

  function triggerLogoRocketOrbit() {
    // 1. Spin the logo
    logoLink.classList.add('spinning');
    setTimeout(() => logoLink.classList.remove('spinning'), 1000);

    // 2. Launch the rocket
    const rocket = document.createElement('span');
    rocket.className = 'logo-rocket';
    rocket.textContent = '🚀';
    
    // Position near logo
    const rect = logoLink.getBoundingClientRect();
    rocket.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
    rocket.style.top = `${rect.top + window.scrollY}px`;
    
    document.body.appendChild(rocket);

    // Star sparks following the rocket
    const particleInterval = setInterval(() => {
      const rRect = rocket.getBoundingClientRect();
      if (rRect.width > 0) {
        createCursorStar(rRect.left + rRect.width / 2, rRect.top + rRect.height / 2);
      }
    }, 45);

    setTimeout(() => {
      clearInterval(particleInterval);
      rocket.remove();
    }, 1800);
  }

  function triggerLogoSupernovaWarp() {
    // 1. Flash the logo
    logoLink.classList.add('supernova-flash');
    setTimeout(() => logoLink.classList.remove('supernova-flash'), 1200);

    // 2. Hyperspace Warp on background stars
    const starsWrapper = document.querySelector('.stars-wrapper');
    if (starsWrapper) {
      starsWrapper.classList.add('warp-active');
      document.body.classList.add('warp-body');
      
      setTimeout(() => {
        starsWrapper.classList.remove('warp-active');
        document.body.classList.remove('warp-body');
      }, 2200);
    }
  }
});
