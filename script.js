function pad2(n) {
  n = String(n);
  return n.length < 2 ? '0' + n : n;
}

function toArray(list) {
  var out = [];
  for (var i = 0; i < list.length; i++) out.push(list[i]);
  return out;
}

var openBtn = document.getElementById('openBtn');
var body = document.body;
var guestNameNode = document.querySelector('.guest-name');
var guestParam = null;
try {
  var params = new URLSearchParams(window.location.search);
  guestParam = params.get('to') || params.get('nama') || params.get('guest');
} catch (err) {
  guestParam = null;
}

if (guestNameNode) {
  var guestName = guestParam ? decodeURIComponent(guestParam).replace(/\+/g, ' ').replace(/^\s+|\s+$/g, '') : 'Tamu Undangan';
  guestNameNode.textContent = guestName;
}

function resetCoverState() {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  body.classList.remove('opened');
  body.classList.add('locked');
  body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';
}

resetCoverState();
window.addEventListener('pageshow', resetCoverState);

if (openBtn) {
  openBtn.addEventListener('click', function () {
    body.classList.add('opened');
    body.classList.remove('locked');
    body.style.overflow = '';
    document.documentElement.style.overflow = '';
    var heroEl = document.getElementById('hero');
    if (heroEl) heroEl.scrollIntoView({ behavior: 'smooth' });
    if (bgMusic) {
      bgMusic.play().catch(function () {});
    }
  });
}

var bgMusic = document.getElementById('bgMusic');
var musicToggle = document.getElementById('musicToggle');
var musicIcon = document.getElementById('musicIcon');

function updateMusicIcon() {
  if (!bgMusic || !musicIcon || !musicToggle) return;
  if (bgMusic.paused) {
    musicIcon.textContent = '♪';
    musicToggle.classList.remove('is-playing');
    musicToggle.setAttribute('aria-label', 'Putar musik');
  } else {
    musicIcon.textContent = '❚❚';
    musicToggle.classList.add('is-playing');
    musicToggle.setAttribute('aria-label', 'Matikan musik');
  }
}

if (musicToggle && bgMusic) {
  musicToggle.addEventListener('click', function () {
    if (bgMusic.paused) {
      bgMusic.play().catch(function () {});
    } else {
      bgMusic.pause();
    }
  });
  bgMusic.addEventListener('play', updateMusicIcon);
  bgMusic.addEventListener('pause', updateMusicIcon);
}

var galleryGrid = document.getElementById('galleryGrid');
var galleryItems = galleryGrid ? toArray(galleryGrid.querySelectorAll('.gallery-item')) : [];

if (galleryItems.length) {
  var modal = document.getElementById('galleryModal');
  var modalImg = document.getElementById('galleryPreview');
  if (modal) document.body.appendChild(modal); // agar selalu di atas semua elemen (termasuk tombol musik)
  var galleryTotal = galleryItems.length;
  var activeIndex = 0;

  function getImageSrc(item) {
    var match = item.style.backgroundImage.match(/url\(["']?(.*?)["']?\)/i);
    return match ? match[1] : '';
  }

  function showPhoto(index) {
    activeIndex = (index + galleryTotal) % galleryTotal;
    if (modalImg) modalImg.src = getImageSrc(galleryItems[activeIndex]);
  }

  function openModal(index) {
    if (!modal) return;
    showPhoto(index);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function makeOpenHandler(index) {
    return function () { openModal(index); };
  }

  for (var g = 0; g < galleryItems.length; g++) {
    galleryItems[g].addEventListener('click', makeOpenHandler(g));
  }

  // Geser kiri/kanan = ganti foto. Tap di luar foto = tutup.
  var startX = 0, startY = 0, swiped = false;

  if (modal) {
    modal.addEventListener('pointerdown', function (event) {
      startX = event.clientX;
      startY = event.clientY;
      swiped = false;
    });

    modal.addEventListener('pointerup', function (event) {
      var dx = event.clientX - startX;
      var dy = event.clientY - startY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        swiped = true;
        showPhoto(activeIndex + (dx < 0 ? 1 : -1));
      }
    });

    modal.addEventListener('click', function (event) {
      if (swiped) { swiped = false; return; }
      if (event.target !== modalImg) closeModal();
    });
  }
  document.addEventListener('keydown', function (event) {
    if (!modal || !modal.classList.contains('is-open')) return;
    if (event.key === 'ArrowRight') showPhoto(activeIndex + 1);
    if (event.key === 'ArrowLeft') showPhoto(activeIndex - 1);
    if (event.key === 'Escape') closeModal();
  });
}

var giftCopyButtons = toArray(document.querySelectorAll('.gift-copy'));
for (var gc = 0; gc < giftCopyButtons.length; gc++) {
  (function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-copy-target');
      var target = document.getElementById(targetId);
      if (!target) return;

      var text = target.textContent.replace(/^\s+|\s+$/g, '');
      var finish = function () {
        var originalLabel = btn.textContent;
        btn.textContent = 'Tersalin!';
        btn.classList.add('is-copied');
        setTimeout(function () {
          btn.textContent = originalLabel;
          btn.classList.remove('is-copied');
        }, 1600);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(finish).catch(finish);
      } else {
        var temp = document.createElement('textarea');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        finish();
      }
    });
  })(giftCopyButtons[gc]);
}


var targetDate = new Date('2026-10-09T08:00:00+08:00').getTime();

function updateCountdown() {
  var cdDays = document.getElementById('cd-days');
  var cdHours = document.getElementById('cd-hours');
  var cdMins = document.getElementById('cd-mins');
  var cdSecs = document.getElementById('cd-secs');
  if (!cdDays || !cdHours || !cdMins || !cdSecs) return;

  var now = Date.now();
  var diff = targetDate - now;
  if (diff <= 0) {
    cdDays.textContent = '00';
    cdHours.textContent = '00';
    cdMins.textContent = '00';
    cdSecs.textContent = '00';
    return;
  }
  var days = Math.floor(diff / (1000 * 60 * 60 * 24));
  var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  var mins = Math.floor((diff / (1000 * 60)) % 60);
  var secs = Math.floor((diff / 1000) % 60);

  cdDays.textContent = pad2(days);
  cdHours.textContent = pad2(hours);
  cdMins.textContent = pad2(mins);
  cdSecs.textContent = pad2(secs);
}
updateCountdown();
setInterval(updateCountdown, 1000);

var rsvpForm = document.getElementById('rsvpForm');
var rsvpNote = document.getElementById('rsvpNote');
var rsvpList = document.getElementById('rsvpList');
var SHEET_API_URL = "https://script.google.com/macros/s/AKfycbypoFFyb8I7jJEK7-_0uwVx-1IiwrRXjkEq9QH50F_XehdU-45ordVFawEW9tgFfFxR/exec";

function loadUcapan() {
  if (!rsvpList) return;
  if (typeof fetch === 'undefined') return;

  fetch(SHEET_API_URL)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      rsvpList.innerHTML = '';
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var wrap = document.createElement('div');
        wrap.className = 'rsvp-item';

        var nameEl = document.createElement('p');
        nameEl.className = 'rsvp-item-name';
        nameEl.textContent = item.nama;

        var textEl = document.createElement('p');
        textEl.className = 'rsvp-item-text';
        textEl.textContent = item.ucapan;

        wrap.appendChild(nameEl);
        wrap.appendChild(textEl);
        rsvpList.appendChild(wrap);
      }
    })
    .catch(function (err) {
      console.error('Gagal memuat ucapan:', err);
    });
}

if (rsvpForm) {
  rsvpForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var namaField = document.getElementById('rsvpNama');
    var ucapanField = document.getElementById('rsvpUcapan');
    var nama = namaField ? namaField.value.replace(/^\s+|\s+$/g, '') : '';
    var ucapan = ucapanField ? ucapanField.value.replace(/^\s+|\s+$/g, '') : '';

    if (!nama || !ucapan) return;
    if (typeof fetch === 'undefined') {
      alert('Browser ini tidak mendukung pengiriman ucapan. Coba pakai browser lain.');
      return;
    }

    fetch(SHEET_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ nama: nama, ucapan: ucapan })
    }).then(function () {
      rsvpForm.reset();
      if (rsvpNote) {
        rsvpNote.style.display = 'block';
        rsvpNote.classList.add('is-visible');
      }
      loadUcapan();
    }).catch(function () {
      alert('Gagal mengirim ucapan, coba lagi.');
    });
  });
}

if (rsvpList) {
  loadUcapan();
}

(function () {
  var photos = toArray(document.querySelectorAll('#bgSlideshow .bg-photo'));
  if (!photos.length) return;

  var rootStyle = getComputedStyle(document.documentElement);
  function seconds(name, fallback) {
    var v = parseFloat(rootStyle.getPropertyValue(name));
    return isNaN(v) ? fallback : v;
  }
  var interval = (seconds('--fade-duration', 1) + seconds('--hold-duration', 4)) * 1000;
  var current = 0;
  photos[0].classList.add('is-active');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (photos.length < 2 || reduceMotion) return;

  setInterval(function () {
    photos[current].classList.remove('is-active');
    current = (current + 1) % photos.length;
    photos[current].classList.add('is-active');
  }, interval);
})();
