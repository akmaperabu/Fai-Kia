// ============================================================
// Helper kecil
// ============================================================
function pad2(n) {
  n = String(n);
  return n.length < 2 ? '0' + n : n;
}

function toArray(list) {
  var out = [];
  for (var i = 0; i < list.length; i++) out.push(list[i]);
  return out;
}

// ============================================================
// BUKA UNDANGAN
// ============================================================
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

// ============================================================
// MUSIK LATAR
// ============================================================
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

// ============================================================
// GALERI FOTO — tumpukan foto berserakan (scattered pile) + modal swipe
// ============================================================
var galleryStageEl = document.getElementById('galleryStage');
var galleryDotsWrap = document.getElementById('galleryDots');
var galleryItems = galleryStageEl ? toArray(galleryStageEl.children) : [];

if (galleryItems.length && galleryStageEl) {
  var modal = document.getElementById('galleryModal');
  var modalImg = document.getElementById('galleryPreview');
  var closeModalBtn = document.querySelector('.gallery-modal-close');
  var prevModalBtn = document.querySelector('.gallery-modal-prev');
  var nextModalBtn = document.querySelector('.gallery-modal-next');
  var prevArrow = document.querySelector('.gallery-arrow-prev');
  var nextArrow = document.querySelector('.gallery-arrow-next');
  var modalContent = document.querySelector('.gallery-modal-content');

  var total = galleryItems.length;
  var offsetClasses = ['is-front', 'is-off-1', 'is-off-2', 'is-off-3', 'is-off-n1', 'is-off-n2', 'is-off-n3', 'is-hidden'];
  var activeIndex = 0;
  var isDragging = false;
  var didDrag = false;
  var dragStartX = 0;
  var autoplayTimer = null;
  var modalDragStartX = 0;
  var modalDragging = false;

  function getImageSrc(item) {
    var match = item.style.backgroundImage.match(/url\(["']?(.*?)['"]?\)/i);
    return match ? match[1] : '';
  }

  function removeOffsetClasses(item) {
    for (var i = 0; i < offsetClasses.length; i++) {
      item.classList.remove(offsetClasses[i]);
    }
  }

  function updateDots() {
    if (!galleryDotsWrap) return;
    var dots = toArray(galleryDotsWrap.children);
    for (var i = 0; i < dots.length; i++) {
      if (i === activeIndex) dots[i].classList.add('is-active');
      else dots[i].classList.remove('is-active');
    }
  }

  function layoutStage() {
    for (var index = 0; index < galleryItems.length; index++) {
      var item = galleryItems[index];
      var offset = (index - activeIndex + total) % total;
      var normalized = offset > total / 2 ? offset - total : offset;

      removeOffsetClasses(item);
      if (normalized === 0) item.classList.add('is-front');
      else if (normalized === 1) item.classList.add('is-off-1');
      else if (normalized === 2) item.classList.add('is-off-2');
      else if (normalized === 3) item.classList.add('is-off-3');
      else if (normalized === -1) item.classList.add('is-off-n1');
      else if (normalized === -2) item.classList.add('is-off-n2');
      else if (normalized === -3) item.classList.add('is-off-n3');
      else item.classList.add('is-hidden');
    }
    updateDots();
  }

  function goTo(index) {
    activeIndex = (index + total) % total;
    layoutStage();
  }

  function restartAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(function () {
      goTo(activeIndex + 1);
    }, 2000);
  }

  function pauseAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  function makeDotClickHandler(index) {
    return function () {
      goTo(index);
      restartAutoplay();
    };
  }

  if (galleryDotsWrap) {
    for (var d = 0; d < galleryItems.length; d++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery-dot';
      dot.setAttribute('aria-label', 'Ke foto ' + (d + 1));
      dot.addEventListener('click', makeDotClickHandler(d));
      galleryDotsWrap.appendChild(dot);
    }
  }

  function openModal(index) {
    goTo(index);
    if (!modal || !modalImg) return;
    pauseAutoplay();
    modalImg.src = getImageSrc(galleryItems[activeIndex]);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function showModalStep(direction) {
    goTo(activeIndex + direction);
    if (modalImg) modalImg.src = getImageSrc(galleryItems[activeIndex]);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    restartAutoplay();
  }

  function makeItemClickHandler(index) {
    return function () {
      if (didDrag) { didDrag = false; return; }
      openModal(index);
    };
  }

  function makeItemKeyHandler(index) {
    return function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal(index);
      }
    };
  }

  for (var g = 0; g < galleryItems.length; g++) {
    galleryItems[g].addEventListener('click', makeItemClickHandler(g));
    galleryItems[g].addEventListener('keydown', makeItemKeyHandler(g));
  }

  if (prevArrow) prevArrow.addEventListener('click', function () { goTo(activeIndex - 1); restartAutoplay(); });
  if (nextArrow) nextArrow.addEventListener('click', function () { goTo(activeIndex + 1); restartAutoplay(); });
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (prevModalBtn) prevModalBtn.addEventListener('click', function () { showModalStep(-1); });
  if (nextModalBtn) nextModalBtn.addEventListener('click', function () { showModalStep(1); });

  if (modal) {
    modal.addEventListener('click', function (event) {
      if (event.target.getAttribute('data-close') === 'true') closeModal();
    });
  }

  document.addEventListener('keydown', function (event) {
    if (!modal || !modal.classList.contains('is-open')) return;
    if (event.key === 'ArrowRight') showModalStep(1);
    if (event.key === 'ArrowLeft') showModalStep(-1);
    if (event.key === 'Escape') closeModal();
  });

  // Swipe / drag manual di foto depan
  galleryStageEl.addEventListener('pointerdown', function (event) {
    isDragging = true;
    didDrag = false;
    dragStartX = event.clientX;
    pauseAutoplay();
  });
  galleryStageEl.addEventListener('pointermove', function (event) {
    if (!isDragging) return;
    if (Math.abs(event.clientX - dragStartX) > 6) didDrag = true;
  });
  galleryStageEl.addEventListener('pointerup', function (event) {
    if (!isDragging) return;
    isDragging = false;
    var dx = event.clientX - dragStartX;
    if (Math.abs(dx) > 40) {
      goTo(activeIndex + (dx < 0 ? 1 : -1));
    }
    restartAutoplay();
  });
  galleryStageEl.addEventListener('pointerleave', function () {
    if (!isDragging) return;
    isDragging = false;
    restartAutoplay();
  });

  // Swipe di dalam modal (kayak Tinder / IG story)
  if (modalContent) {
    modalContent.addEventListener('pointerdown', function (event) {
      modalDragStartX = event.clientX;
      modalDragging = true;
    });
    modalContent.addEventListener('pointerup', function (event) {
      if (!modalDragging) return;
      var deltaX = event.clientX - modalDragStartX;
      if (Math.abs(deltaX) > 40) {
        showModalStep(deltaX < 0 ? 1 : -1);
      }
      modalDragging = false;
    });
    modalContent.addEventListener('pointerleave', function () {
      modalDragging = false;
    });
  }

  goTo(0);
  restartAutoplay();
}

// ============================================================
// HADIAH — salin nomor rekening / e-wallet
// ============================================================
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

// ============================================================
// COUNTDOWN — menuju 09 Oktober 2026, 08:00 WITA (akad)
// Ubah targetDate bila jadwal berubah.
// ============================================================
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

// ============================================================
// UCAPAN — kirim & tampilkan dari Google Sheets
// ============================================================
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
