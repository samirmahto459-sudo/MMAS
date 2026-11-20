(function () {
  'use strict';
  var WA = '919334626924';
  var $ = function (id) { return document.getElementById(id); };
  var gpsLink = '';

  // Fade in each segment as it scrolls into view
  var segs = document.querySelectorAll('.hero, .strip, main > section, footer');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !calm) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    segs.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
    document.documentElement.classList.add('fx');
  }

  // Themed cursor ring (mouse devices only)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mx = 0, my = 0, rx = 0, ry = 0, raf = 0;
    var draw = function () {
      rx += (mx - rx) * (still ? 1 : 0.2);
      ry += (my - ry) * (still ? 1 : 0.2);
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      raf = (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) ? requestAnimationFrame(draw) : 0;
    };
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      ring.classList.add('on');
      ring.classList.toggle('hot', !!e.target.closest('a,button,label'));
      if (!raf) raf = requestAnimationFrame(draw);
    });
    document.documentElement.addEventListener('mouseleave', function () { ring.classList.remove('on'); });
  }

  $('y').textContent = new Date().getFullYear();

  // "Select & request" on fleet cards pre-selects the type and jumps to the form
  document.querySelectorAll('.pick').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var radio = document.querySelector('input[name="t"][value="' + btn.dataset.type + '"]');
      if (radio) radio.checked = true;
      $('book').scrollIntoView({ behavior: 'smooth' });
      setTimeout(function () { $('p').focus({ preventScroll: true }); }, 500);
    });
  });

  // Use GPS: adds a Google Maps pin to the request
  var gps = $('gps');
  gps.addEventListener('click', function () {
    var err = $('e');
    if (!navigator.geolocation) {
      err.textContent = 'GPS is not available on this device. Type the pickup address instead.';
      return;
    }
    gps.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(function (pos) {
      var c = pos.coords.latitude.toFixed(6) + ',' + pos.coords.longitude.toFixed(6);
      gpsLink = 'https://www.google.com/maps?q=' + c;
      gps.classList.add('ok');
      gps.textContent = 'GPS added';
      err.textContent = '';
      if (!$('a').value.trim()) $('a').value = 'Pin shared (GPS)';
    }, function () {
      gps.textContent = 'Use GPS';
      err.textContent = 'Could not get your location. Allow location access or type the pickup address.';
    }, { enableHighAccuracy: true, timeout: 10000 });
  });

  // Form → WhatsApp
  $('f').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var v = function (id) { return $(id).value.trim(); };
    var err = $('e');
    if (!v('p') || !v('a')) {
      err.textContent = 'Please enter your phone number and pickup location.';
      return;
    }
    if (v('p').replace(/\D/g, '').length < 10) {
      err.textContent = 'Enter a phone number with at least 10 digits.';
      return;
    }
    err.textContent = '';
    var type = document.querySelector('input[name="t"]:checked').value;
    var lines = ['Ambulance request (MMAS)', 'Type: ' + type, 'Phone: ' + v('p'), 'Pickup: ' + v('a')];
    if (gpsLink) lines.push('GPS pin: ' + gpsLink);
    if (v('n')) lines.push('Name: ' + v('n'));
    if (v('d')) lines.push('Drop: ' + v('d'));
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });
})();
