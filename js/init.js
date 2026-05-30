'use strict';

document.addEventListener('DOMContentLoaded', function () {

   /* ============================================================
      1. Mobile Navigation Toggle (accesible)
   ============================================================ */
   var navToggle = document.getElementById('nav-toggle');
   var navWrap   = document.getElementById('nav-wrap');

   if (navToggle && navWrap) {
      navToggle.addEventListener('click', function () {
         var expanded = this.getAttribute('aria-expanded') === 'true';
         this.setAttribute('aria-expanded', String(!expanded));
         navWrap.classList.toggle('nav-open');
         this.setAttribute('aria-label',
            expanded ? 'Abrir navegación' : 'Cerrar navegación');
      });

      document.querySelectorAll('#nav a.smoothscroll').forEach(function (link) {
         link.addEventListener('click', function () {
            navWrap.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Abrir navegación');
         });
      });

      document.addEventListener('keydown', function (e) {
         if (e.key === 'Escape' && navWrap.classList.contains('nav-open')) {
            navWrap.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Abrir navegación');
            navToggle.focus();
         }
      });
   }


   /* ============================================================
      2. Smooth Scrolling
   ============================================================ */
   document.querySelectorAll('a.smoothscroll').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
         e.preventDefault();
         var targetId = this.getAttribute('href');
         var target   = document.querySelector(targetId);
         if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            history.pushState(null, '', targetId);
         }
      });
   });


   /* ============================================================
      3. Header height = viewport height
   ============================================================ */
   var headerEl = document.querySelector('header');

   function setHeaderHeight() {
      if (headerEl) headerEl.style.height = window.innerHeight + 'px';
   }
   setHeaderHeight();
   window.addEventListener('resize', setHeaderHeight);


   /* ============================================================
      4. Nav: fade on scroll + clase opaque
   ============================================================ */
   var nav = document.getElementById('nav-wrap');

   window.addEventListener('scroll', function () {
      if (!headerEl || !nav) return;
      var h = headerEl.offsetHeight;
      var y = window.scrollY;

      if (y > h * 0.20 && y < h && window.innerWidth > 768) {
         nav.style.opacity       = '0';
         nav.style.pointerEvents = 'none';
      } else {
         nav.style.opacity       = '1';
         nav.style.pointerEvents = '';
         nav.classList.toggle('opaque', y >= h * 0.20);
      }
   });


   /* ============================================================
      5. Resaltar sección activa en nav (IntersectionObserver)
   ============================================================ */
   var sections = document.querySelectorAll('section[id]');
   var navLinks = document.querySelectorAll('#nav-wrap a[href^="#"]');

   if ('IntersectionObserver' in window && sections.length) {
      var sectionObserver = new IntersectionObserver(function (entries) {
         entries.forEach(function (entry) {
            if (entry.isIntersecting) {
               navLinks.forEach(function (l) {
                  l.parentElement.classList.remove('current');
               });
               var active = document.querySelector(
                  '#nav-wrap a[href="#' + entry.target.id + '"]');
               if (active) active.parentElement.classList.add('current');
            }
         });
      }, { threshold: 0.35 });

      sections.forEach(function (s) { sectionObserver.observe(s); });
   }


   /* ============================================================
      6. Portfolio Modals (sin jQuery / sin Magnific Popup)
   ============================================================ */
   var modalBg        = document.getElementById('modal-bg');
   var lastFocusedEl  = null;

   function openModal(modalId) {
      var modal = document.querySelector(modalId);
      if (!modal) return;
      lastFocusedEl = document.activeElement;
      modal.classList.remove('mfp-hide');
      modal.classList.add('mfp-show');
      modal.setAttribute('aria-hidden', 'false');
      if (modalBg) modalBg.classList.add('active');
      document.body.style.overflow = 'hidden';
      var first = modal.querySelector('a[href], button');
      if (first) first.focus();
   }

   function closeModal() {
      document.querySelectorAll('.popup-modal.mfp-show').forEach(function (m) {
         m.classList.remove('mfp-show');
         m.classList.add('mfp-hide');
         m.setAttribute('aria-hidden', 'true');
      });
      if (modalBg) modalBg.classList.remove('active');
      document.body.style.overflow = '';
      if (lastFocusedEl) lastFocusedEl.focus();
   }

   document.querySelectorAll('.item-wrap a').forEach(function (link) {
      link.addEventListener('click', function (e) {
         e.preventDefault();
         openModal(this.getAttribute('href'));
      });
   });

   document.querySelectorAll('.popup-modal-dismiss').forEach(function (btn) {
      btn.addEventListener('click', closeModal);
   });

   if (modalBg) {
      modalBg.addEventListener('click', closeModal);
   }

   document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
   });


   /* ============================================================
      7. Skill bars — animar al entrar en viewport
   ============================================================ */
   var skillBars = document.querySelectorAll('.bar-expand');

   if (skillBars.length && 'IntersectionObserver' in window) {
      skillBars.forEach(function (bar) {
         bar.style.animationPlayState = 'paused';
      });

      var barObserver = new IntersectionObserver(function (entries) {
         entries.forEach(function (entry) {
            if (entry.isIntersecting) {
               entry.target.style.animationPlayState = 'running';
               barObserver.unobserve(entry.target);
            }
         });
      }, { threshold: 0.3 });

      skillBars.forEach(function (bar) { barObserver.observe(bar); });
   }


   /* ============================================================
      8. Formulario de contacto — fetch en lugar de $.ajax
   ============================================================ */
   var contactForm = document.getElementById('contactForm');

   if (contactForm) {
      contactForm.querySelector('button.submit').addEventListener('click', function (e) {
         e.preventDefault();

         var loader  = document.getElementById('image-loader');
         var warning = document.getElementById('message-warning');
         var success = document.getElementById('message-success');

         if (loader)  loader.style.display  = 'inline';
         if (warning) warning.style.display = 'none';

         var params = new URLSearchParams({
            contactName:    document.getElementById('contactName').value,
            contactEmail:   document.getElementById('contactEmail').value,
            contactSubject: document.getElementById('contactSubject').value,
            contactMessage: document.getElementById('contactMessage').value
         });

         fetch('inc/sendEmail.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body:    params.toString()
         })
         .then(function (r) { return r.text(); })
         .then(function (msg) {
            if (loader) loader.style.display = 'none';
            if (msg.trim() === 'OK') {
               contactForm.style.display = 'none';
               if (success) success.style.display = 'block';
            } else {
               if (warning) { warning.textContent = msg; warning.style.display = 'block'; }
            }
         })
         .catch(function () {
            if (loader) loader.style.display = 'none';
            if (warning) {
               warning.textContent = 'Error de conexión. Por favor inténtalo de nuevo.';
               warning.style.display = 'block';
            }
         });
      });
   }

});
