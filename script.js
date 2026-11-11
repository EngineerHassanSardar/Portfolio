/* ============================================================
   HASSAN SARDAR UMARZAI — PORTFOLIO INTERACTIONS
   Vanilla JavaScript · No dependencies · ES5-safe
   ============================================================ */

(function (window, document) {
  'use strict';

  /* ---------- UTILITIES ---------- */
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call(
      (scope || document).querySelectorAll(selector)
    );
  }

  function isTouchDevice() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    );
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function rafThrottle(fn) {
    var scheduled = false;
    return function () {
      if (scheduled) return;
      scheduled = true;
      var args = arguments;
      var ctx = this;
      window.requestAnimationFrame(function () {
        fn.apply(ctx, args);
        scheduled = false;
      });
    };
  }

  function debounce(fn, wait) {
    var timer;
    return function () {
      var args = arguments;
      var ctx = this;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        fn.apply(ctx, args);
      }, wait);
    };
  }

  /* ---------- NAVBAR ---------- */
  var Navbar = (function () {
    var navbar = $('#navbar');
    if (!navbar) return { init: function () {} };

    function update() {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }

    return {
      init: function () {
        update();
        window.addEventListener('scroll', rafThrottle(update), { passive: true });
      }
    };
  })();

  /* ---------- SCROLL PROGRESS ---------- */
  var ScrollProgress = (function () {
    var bar = $('#scrollProgress');
    if (!bar) return { init: function () {} };

    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (percent < 0) percent = 0;
      if (percent > 100) percent = 100;
      bar.style.width = percent.toFixed(2) + '%';
    }

    return {
      init: function () {
        update();
        window.addEventListener('scroll', rafThrottle(update), { passive: true });
        window.addEventListener('resize', debounce(update, 120));
      }
    };
  })();

  /* ---------- MOBILE NAV ---------- */
  var MobileNav = (function () {
    var hamburger = $('#hamburger');
    var navMenu = $('#navMenu');
    if (!hamburger || !navMenu) return { init: function () {}, close: function () {} };

    function close() {
      hamburger.classList.remove('open');
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }

    function open() {
      hamburger.classList.add('open');
      navMenu.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
    }

    function toggle() {
      if (navMenu.classList.contains('open')) close();
      else open();
    }

    return {
      init: function () {
        hamburger.addEventListener('click', function (e) {
          e.stopPropagation();
          toggle();
        });

        $$('a', navMenu).forEach(function (link) {
          link.addEventListener('click', close);
        });

        document.addEventListener('click', function (e) {
          if (!navMenu.classList.contains('open')) return;
          if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) close();
        });

        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape' && navMenu.classList.contains('open')) {
            close();
            hamburger.focus();
          }
        });

        window.addEventListener('resize', debounce(function () {
          if (window.innerWidth > 768) close();
        }, 150));
      },
      close: close
    };
  })();

  /* ---------- ACTIVE NAV LINK ---------- */
  var ActiveNav = (function () {
    function normalize(path) {
      if (!path) return '';
      var cleaned = path.split('#')[0].split('?')[0].replace(/\/+$/, '');
      var parts = cleaned.split('/');
      return parts[parts.length - 1] || 'index.html';
    }

    return {
      init: function () {
        var links = $$('.nav-menu .nav-link');
        if (!links.length) return;

        var current = normalize(window.location.pathname) || 'index.html';

        links.forEach(function (link) {
          var href = link.getAttribute('href');
          if (!href) return;
          if (normalize(href) === current) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
          }
        });
      }
    };
  })();

  /* ---------- SCROLL REVEAL ---------- */
  var ScrollReveal = (function () {
    var elements = $$('.reveal');
    if (!elements.length) return { init: function () {} };

    function revealAll() {
      elements.forEach(function (el) { el.classList.add('is-visible'); });
    }

    return {
      init: function () {
        if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
          revealAll();
          return;
        }

        var observer = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

        elements.forEach(function (el) { observer.observe(el); });
      }
    };
  })();

  /* ---------- 3D TILT CARDS ---------- */
  var TiltCards = (function () {
    var MAX_TILT = 4;
    var PERSPECTIVE = 900;

    function attach(card) {
      var rect = null;

      card.addEventListener('mouseenter', function () {
        rect = card.getBoundingClientRect();
        card.style.willChange = 'transform';
      });

      card.addEventListener('mousemove', function (e) {
        if (!rect) rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var px = (x - rect.width / 2) / (rect.width / 2);
        var py = (y - rect.height / 2) / (rect.height / 2);
        card.style.transform =
          'perspective(' + PERSPECTIVE + 'px) ' +
          'rotateX(' + (-py * MAX_TILT).toFixed(2) + 'deg) ' +
          'rotateY(' + (px * MAX_TILT).toFixed(2) + 'deg) ' +
          'translateY(-4px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.willChange = '';
        rect = null;
      });
    }

    return {
      init: function () {
        if (isTouchDevice() || prefersReducedMotion()) return;
        $$('[data-tilt]').forEach(attach);
      }
    };
  })();

  /* ---------- FLOATING TAG PARALLAX ---------- */
  var FloatingParallax = (function () {
    var wrapper = $('.photo-wrapper');
    if (!wrapper) return { init: function () {} };

    var tags = $$('.float-tag', wrapper);
    if (!tags.length) return { init: function () {} };

    return {
      init: function () {
        if (isTouchDevice() || prefersReducedMotion()) return;

        wrapper.addEventListener('mousemove', function (e) {
          var rect = wrapper.getBoundingClientRect();
          var nx = (e.clientX - rect.left) / rect.width - 0.5;
          var ny = (e.clientY - rect.top) / rect.height - 0.5;

          tags.forEach(function (tag, i) {
            var depth = (i + 1) * 6;
            tag.style.transform =
              'translate(' + (nx * depth).toFixed(1) + 'px, ' +
                             (ny * depth).toFixed(1) + 'px)';
          });
        });

        wrapper.addEventListener('mouseleave', function () {
          tags.forEach(function (tag) { tag.style.transform = ''; });
        });
      }
    };
  })();

  /* ---------- SMOOTH ANCHORS ---------- */
  var SmoothAnchors = (function () {
    return {
      init: function () {
        var navbar = $('#navbar');

        $$('a[href^="#"]').forEach(function (link) {
          link.addEventListener('click', function (e) {
            var href = link.getAttribute('href');
            if (!href || href === '#' || href.length < 2) return;

            var target = document.getElementById(href.slice(1));
            if (!target) return;

            e.preventDefault();
            var offset = navbar ? navbar.offsetHeight : 0;
            var top = target.getBoundingClientRect().top + window.scrollY - offset - 12;

            window.scrollTo({
              top: top,
              behavior: prefersReducedMotion() ? 'auto' : 'smooth'
            });

            if (history.replaceState) history.replaceState(null, '', href);
          });
        });
      }
    };
  })();

  /* ---------- CONTACT FORM ---------- */
  var ContactForm = (function () {
    var form = $('.contact-form');
    if (!form) return { init: function () {} };

    var EMAIL_TO = 'engrhassansardarumarzai@gmail.com';
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return {
      init: function () {
        form.addEventListener('submit', function (e) {
          var nameField = form.querySelector('[name="name"]');
          var emailField = form.querySelector('[name="email"]');
          var messageField = form.querySelector('[name="message"]');

          var name = nameField ? nameField.value.trim() : '';
          var email = emailField ? emailField.value.trim() : '';
          var message = messageField ? messageField.value.trim() : '';

          if (!name || !email || !message || !EMAIL_RE.test(email)) {
            e.preventDefault();
            alert('Please fill in all fields with a valid email.');
            return;
          }

          var subject = encodeURIComponent('Portfolio enquiry — ' + name);
          var body = encodeURIComponent(
            'Name: ' + name + '\n' +
            'Email: ' + email + '\n\n' +
            'Message:\n' + message
          );

          form.setAttribute(
            'action',
            'mailto:' + EMAIL_TO + '?subject=' + subject + '&body=' + body
          );
        });
      }
    };
  })();

  /* ---------- SERVICE CARD SPOTLIGHT ---------- */
  var CardSpotlight = (function () {
    return {
      init: function () {
        if (isTouchDevice() || prefersReducedMotion()) return;

        $$('.service-card').forEach(function (card) {
          card.addEventListener('mousemove', function (e) {
            var r = card.getBoundingClientRect();
            var x = ((e.clientX - r.left) / r.width) * 100;
            var y = ((e.clientY - r.top) / r.height) * 100;
            card.style.setProperty('--mx', x + '%');
            card.style.setProperty('--my', y + '%');
          });
        });
      }
    };
  })();

  /* ---------- EXTERNAL LINKS ---------- */
  var ExternalLinks = (function () {
    return {
      init: function () {
        $$('a[target="_blank"]').forEach(function (link) {
          var rel = link.getAttribute('rel') || '';
          if (rel.indexOf('noopener') === -1) {
            link.setAttribute('rel', (rel + ' noopener noreferrer').trim());
          }
        });
      }
    };
  })();

  /* ---------- BOOT ---------- */
  function boot() {
    Navbar.init();
    ScrollProgress.init();
    MobileNav.init();
    ActiveNav.init();
    ScrollReveal.init();
    TiltCards.init();
    FloatingParallax.init();
    SmoothAnchors.init();
    ContactForm.init();
    CardSpotlight.init();
    ExternalLinks.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.Portfolio = {
    closeMobileMenu: MobileNav.close,
    version: '1.0.0'
  };

})(window, document);
/* ============================================================
   MODULE: PROJECT COUNTER ANIMATION
   Counts up the numbers inside .pstat-num when visible.
   ============================================================ */
var ProjectStats = (function () {
  function animate(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;

    var duration = 1400;
    var start = performance.now();
    var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * easeOut(progress));
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  return {
    init: function () {
      var nodes = $$('.pstat-num');
      if (!nodes.length) return;

      if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
        nodes.forEach(function (n) { n.textContent = n.getAttribute('data-count'); });
        return;
      }

      var obs = new IntersectionObserver(function (entries, o) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animate(entry.target);
          o.unobserve(entry.target);
        });
      }, { threshold: 0.4 });

      nodes.forEach(function (n) { obs.observe(n); });
    }
  };
})();

/* ============================================================
   MODULE: PROJECT CARD GLOW
   Tracks cursor inside each .pcard and sets --mx / --my
   so the radial glow follows the pointer.
   ============================================================ */
var ProjectCardGlow = (function () {
  return {
    init: function () {
      if (isTouchDevice() || prefersReducedMotion()) return;

      $$('.pcard').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
          var r = card.getBoundingClientRect();
          var x = ((e.clientX - r.left) / r.width) * 100;
          var y = ((e.clientY - r.top) / r.height) * 100;
          card.style.setProperty('--mx', x + '%');
          card.style.setProperty('--my', y + '%');
        });
      });
    }
  };
})();