/**
 * script.js — Dynoo Website
 * Handles: SPA navigation, carousel logic, lightbox, mobile menu
 */

/* ================================================================
   1. SPA PAGE NAVIGATION
   ================================================================ */

/**
 * Show the specified page and update nav active states.
 * @param {string} pageId - 'home' | 'pinpri' | 'arisan'
 */
function showPage(pageId) {
  // Hide all pages by removing 'active' class
  document.querySelectorAll('.page').forEach(function(page) {
    page.classList.remove('active');
  });

  // Show the target page
  var targetPage = document.getElementById('page-' + pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    // Scroll to top of the page smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update nav link active state
  document.querySelectorAll('.nav-link').forEach(function(link) {
    link.classList.remove('active');
    link.removeAttribute('aria-current');
  });

  var activeNavLink = document.getElementById('navlink-' + pageId);
  if (activeNavLink) {
    activeNavLink.classList.add('active');
    activeNavLink.setAttribute('aria-current', 'page');
  }

  // Update document title for each page
  var titles = {
    home:   'Dynoo Official',
    pinpri: 'Pinpri | Dynoo Official',
    arisan: 'Arisan | Dynoo Official'
  };
  document.title = titles[pageId] || titles.home;

  // Re-initialize carousels when switching pages to ensure correct state
  if (pageId === 'pinpri') {
    initCarousel('pinpri', 7);
  } else if (pageId === 'arisan') {
    initCarousel('arisan', 8);
  }
}


/* ================================================================
   2. MOBILE NAVIGATION MENU
   ================================================================ */

/**
 * Toggle the mobile hamburger menu open/closed.
 */
function toggleMobileMenu() {
  var menu = document.getElementById('mobile-menu');
  var btn   = document.getElementById('hamburger-btn');

  if (menu) {
    menu.classList.toggle('open');
    // Update aria-label for accessibility
    var isOpen = menu.classList.contains('open');
    btn.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
}

// Close mobile menu when clicking outside of it
document.addEventListener('click', function(event) {
  var menu = document.getElementById('mobile-menu');
  var btn   = document.getElementById('hamburger-btn');
  var nav   = document.getElementById('global-nav');

  if (menu && menu.classList.contains('open')) {
    if (!nav.contains(event.target)) {
      menu.classList.remove('open');
      btn.setAttribute('aria-label', 'Buka menu');
      btn.setAttribute('aria-expanded', 'false');
    }
  }
});


/* ================================================================
   3. CAROUSEL / SLIDER LOGIC
   ================================================================ */

// State object for each carousel instance
var carouselStates = {};

/**
 * Initialize a carousel instance.
 * @param {string} id    - 'pinpri' or 'arisan'
 * @param {number} total - total number of slides
 */
function initCarousel(id, total) {
  // Initialize or reset state
  carouselStates[id] = {
    current: 0,
    total:   total
  };

  // Render dots
  renderDots(id, total);

  // Set initial position
  goToSlide(id, 0);

  // Set up touch/swipe support
  setupSwipe(id);
}

/**
 * Create dot indicators for a carousel.
 * @param {string} id    - carousel id
 * @param {number} total - total slides
 */
function renderDots(id, total) {
  var dotsEl = document.getElementById(id + '-dots');
  if (!dotsEl) return;

  dotsEl.innerHTML = '';
  // Add arisan class to arisan dots container for styling
  if (id === 'arisan') {
    dotsEl.classList.add('arisan-carousel-wrapper');
  }

  for (var i = 0; i < total; i++) {
    var dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Slide ' + (i + 1));
    dot.setAttribute('role', 'button');
    dot.setAttribute('tabindex', '0');
    // Closure to capture the index
    (function(index) {
      dot.onclick = function() { goToSlide(id, index); };
      dot.onkeydown = function(e) {
        if (e.key === 'Enter' || e.key === ' ') goToSlide(id, index);
      };
    })(i);

    dotsEl.appendChild(dot);
  }
}

/**
 * Navigate to a specific slide.
 * @param {string} id    - carousel id
 * @param {number} index - 0-based slide index
 */
function goToSlide(id, index) {
  var state = carouselStates[id];
  if (!state) return;

  var track = document.getElementById(id + '-track');
  if (!track) return;

  // Clamp index within bounds
  state.current = Math.max(0, Math.min(index, state.total - 1));

  // Move the track
  track.style.transform = 'translateX(-' + (state.current * 100) + '%)';

  // Update dots active state
  var dots = document.querySelectorAll('#' + id + '-dots .dot');
  dots.forEach(function(dot, i) {
    dot.classList.toggle('active', i === state.current);
  });
}

/**
 * Navigate to the previous slide.
 * @param {string} id - carousel id
 */
function carouselPrev(id) {
  var state = carouselStates[id];
  if (!state) return;
  // Loop around to last slide if at beginning
  var nextIndex = (state.current - 1 + state.total) % state.total;
  goToSlide(id, nextIndex);
}

/**
 * Navigate to the next slide.
 * @param {string} id - carousel id
 */
function carouselNext(id) {
  var state = carouselStates[id];
  if (!state) return;
  // Loop around to first slide if at end
  var nextIndex = (state.current + 1) % state.total;
  goToSlide(id, nextIndex);
}

/**
 * Set up touch swipe gestures for a carousel.
 * @param {string} id - carousel id
 */
function setupSwipe(id) {
  var wrapper = document.getElementById(id + '-carousel-wrapper');
  if (!wrapper) return;

  var startX = 0;
  var isDragging = false;
  var threshold = 50; // minimum px to consider a swipe

  wrapper.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    isDragging = true;
  }, { passive: true });

  wrapper.addEventListener('touchend', function(e) {
    if (!isDragging) return;
    isDragging = false;
    var diffX = startX - e.changedTouches[0].clientX;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        carouselNext(id);   // swiped left → next
      } else {
        carouselPrev(id);   // swiped right → prev
      }
    }
  }, { passive: true });

  // Mouse drag support for desktop
  var mouseStartX = 0;
  var mouseDown = false;

  wrapper.addEventListener('mousedown', function(e) {
    mouseStartX = e.clientX;
    mouseDown = true;
    e.preventDefault();
  });

  document.addEventListener('mouseup', function(e) {
    if (!mouseDown) return;
    mouseDown = false;
    var diffX = mouseStartX - e.clientX;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        carouselNext(id);
      } else {
        carouselPrev(id);
      }
    }
  });
}

/* Auto-play carousels every 5 seconds */
var autoplayTimers = {};

/**
 * Start autoplay for a carousel.
 * @param {string} id - carousel id
 */
function startAutoplay(id) {
  clearInterval(autoplayTimers[id]);
  autoplayTimers[id] = setInterval(function() {
    carouselNext(id);
  }, 5000);
}

/**
 * Stop autoplay on user interaction.
 * @param {string} id - carousel id
 */
function stopAutoplay(id) {
  clearInterval(autoplayTimers[id]);
}


/* ================================================================
   4. LIGHTBOX (Image Zoom Overlay)
   ================================================================ */

/**
 * Open the lightbox with a given image src and alt text.
 * @param {string} src - image source URL
 * @param {string} alt - image alt text (used as caption)
 */
function openLightbox(src, alt) {
  var overlay   = document.getElementById('lightbox-overlay');
  var img       = document.getElementById('lightbox-img');
  var caption   = document.getElementById('lightbox-caption');

  if (!overlay || !img) return;

  img.src = src;
  img.alt = alt || '';
  if (caption) caption.textContent = alt || '';

  overlay.classList.add('open');
  // Prevent body scroll while lightbox is open
  document.body.style.overflow = 'hidden';

  // Focus the close button for accessibility
  var closeBtn = overlay.querySelector('.lightbox-close');
  if (closeBtn) closeBtn.focus();
}

/**
 * Close the lightbox overlay.
 */
function closeLightbox() {
  var overlay = document.getElementById('lightbox-overlay');
  if (!overlay) return;

  overlay.classList.remove('open');
  document.body.style.overflow = '';

  // Clear src to stop any ongoing load
  var img = document.getElementById('lightbox-img');
  if (img) {
    setTimeout(function() { img.src = ''; }, 300);
  }
}

// Close lightbox with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeLightbox();
    toggleMobileMenu();  // also close mobile menu if open
  }
});


/* ================================================================
   5. INITIALIZATION — Run on DOM Ready
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {

  // Initialize home page as active
  showPage('home');

  // Initialize carousels with slide counts
  // Pinpri: 7 slides, Arisan: 8 slides
  initCarousel('pinpri', 7);
  initCarousel('arisan', 8);

  // Start autoplay
  startAutoplay('pinpri');
  startAutoplay('arisan');

  // Pause autoplay on hover/focus of carousel
  ['pinpri', 'arisan'].forEach(function(id) {
    var wrapper = document.getElementById(id + '-carousel-wrapper');
    if (wrapper) {
      wrapper.addEventListener('mouseenter', function() { stopAutoplay(id); });
      wrapper.addEventListener('mouseleave', function() { startAutoplay(id); });
      wrapper.addEventListener('focusin',    function() { stopAutoplay(id); });
      wrapper.addEventListener('focusout',   function() { startAutoplay(id); });
    }
  });

  // Keyboard navigation for carousels
  document.addEventListener('keydown', function(e) {
    // Find which carousel is currently visible
    var activePage = document.querySelector('.page.active');
    if (!activePage) return;

    var pageId = activePage.id.replace('page-', '');
    if (pageId !== 'pinpri' && pageId !== 'arisan') return;

    if (e.key === 'ArrowLeft') {
      carouselPrev(pageId);
      stopAutoplay(pageId);
    } else if (e.key === 'ArrowRight') {
      carouselNext(pageId);
      stopAutoplay(pageId);
    }
  });

  // Animate elements on scroll (Intersection Observer)
  var observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Add initial hidden state and observe animatable elements
  var animatableElements = document.querySelectorAll(
    '.service-card, .info-card, .testi-card, .why-item, .how-step, .arisan-type-card'
  );

  animatableElements.forEach(function(el, index) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease ' + (index * 0.08) + 's, transform 0.5s ease ' + (index * 0.08) + 's';
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });

  // Add 'visible' class style
  var styleSheet = document.styleSheets[0];
  try {
    styleSheet.insertRule(
      '.animate-on-scroll.visible { opacity: 1 !important; transform: translateY(0) !important; }',
      styleSheet.cssRules.length
    );
  } catch(e) {
    // Fallback: just show elements if rule insertion fails
    animatableElements.forEach(function(el) {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }

  // --- Profit Calculator Logic ---
  var amountInput = document.getElementById('calc-amount');
  var durationBtns = document.querySelectorAll('.duration-btn');
  var customDaysGroup = document.getElementById('custom-days-group');
  var customDaysInput = document.getElementById('calc-custom-days');
  
  var btnCalculate = document.getElementById('btn-calc-calculate');
  var btnReset = document.getElementById('btn-calc-reset');
  
  var amountError = document.getElementById('amount-validation-error');
  var daysError = document.getElementById('days-validation-error');
  
  var resultPlaceholder = document.getElementById('calc-result-placeholder');
  var resultDetails = document.getElementById('calc-result-details');
  
  var resAmount = document.getElementById('res-amount');
  var resRate = document.getElementById('res-rate');
  var resProfit = document.getElementById('res-profit');
  var resTotal = document.getElementById('res-total');

  var activeDurationMode = '1'; // '1' | '2' | '3' | 'more'

  // Format dynamic Rupiah input on typing
  if (amountInput) {
    amountInput.addEventListener('input', function(e) {
      var value = e.target.value;
      var clean = value.replace(/\D/g, '');
      if (clean) {
        var formatted = clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        e.target.value = formatted;
      } else {
        e.target.value = '';
      }
      clearErrors();
    });
  }

  // Handle duration choice buttons
  durationBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      durationBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      
      var daysValue = btn.getAttribute('data-days');
      activeDurationMode = daysValue;
      
      if (daysValue === 'more') {
        customDaysGroup.style.display = 'flex';
      } else {
        customDaysGroup.style.display = 'none';
        clearErrors();
      }
    });
  });

  if (customDaysInput) {
    customDaysInput.addEventListener('input', function() {
      clearErrors();
    });
  }

  function clearErrors() {
    if (amountError) amountError.textContent = '';
    if (daysError) daysError.textContent = '';
  }

  function parseRupiah(str) {
    if (!str) return 0;
    return parseInt(str.replace(/\./g, ''), 10) || 0;
  }

  function formatRupiahOutput(num) {
    return 'Rp' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  if (btnCalculate) {
    btnCalculate.addEventListener('click', function() {
      clearErrors();
      
      var amountStr = amountInput.value.trim();
      var amount = parseRupiah(amountStr);
      var hasError = false;

      // Validation
      if (!amountStr) {
        amountError.textContent = 'Nominal tidak boleh kosong.';
        hasError = true;
      } else if (amount <= 0) {
        amountError.textContent = 'Nominal harus berupa angka positif.';
        hasError = true;
      }

      var days = 1;
      var rate = 30; // default 30%

      if (activeDurationMode === 'more') {
        var customDaysVal = customDaysInput.value.trim();
        var customDays = parseInt(customDaysVal, 10);
        
        if (!customDaysVal) {
          daysError.textContent = 'Jumlah hari tidak boleh kosong.';
          hasError = true;
        } else if (isNaN(customDays) || customDays <= 3) {
          daysError.textContent = 'Jumlah hari harus lebih dari 3.';
          hasError = true;
        } else {
          days = customDays;
          rate = 60 + (days - 3) * 10;
        }
      } else {
        days = parseInt(activeDurationMode, 10);
        if (days === 1) rate = 30;
        else if (days === 2) rate = 50;
        else if (days === 3) rate = 60;
      }

      if (hasError) {
        resultPlaceholder.style.display = 'flex';
        resultDetails.style.display = 'none';
        return;
      }

      // Calculation
      var profit = Math.floor(amount * (rate / 100));
      var total = amount + profit;

      // Display results
      resAmount.textContent = formatRupiahOutput(amount);
      resRate.textContent = rate + '%';
      resProfit.textContent = formatRupiahOutput(profit);
      resTotal.textContent = formatRupiahOutput(total);

      resultPlaceholder.style.display = 'none';
      resultDetails.style.display = 'flex';
      
      // Trigger animation
      resultDetails.style.animation = 'none';
      resultDetails.offsetHeight; /* trigger reflow */
      resultDetails.style.animation = null;
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', function() {
      clearErrors();
      if (amountInput) amountInput.value = '';
      if (customDaysInput) customDaysInput.value = '4';
      
      durationBtns.forEach(function(b) {
        if (b.getAttribute('data-days') === '1') b.classList.add('active');
        else b.classList.remove('active');
      });
      activeDurationMode = '1';
      customDaysGroup.style.display = 'none';
      
      resultPlaceholder.style.display = 'flex';
      resultDetails.style.display = 'none';
    });
  }

  console.log('%c🦖 Dynoo Website Loaded!', 'color:#2e7d52;font-size:1.2em;font-weight:bold;');
  console.log('%cGanti "nomor-wa-anda" di link WhatsApp dengan nomor aktif Anda.', 'color:#5a6e4a;');
});
