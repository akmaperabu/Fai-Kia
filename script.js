// ============================================================
    // BUKA UNDANGAN
    // ============================================================
    const openBtn = document.getElementById('openBtn');
    const body = document.body;
    const guestNameNode = document.querySelector('.guest-name');
    const params = new URLSearchParams(window.location.search);
    const guestParam = params.get('to') || params.get('nama') || params.get('guest');

    if (guestNameNode) {
      const guestName = guestParam ? decodeURIComponent(guestParam).replace(/\+/g, ' ').trim() : 'Tamu Undangan';
      guestNameNode.textContent = guestName;
    }

    function resetCoverState() {
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      body.classList.remove('opened');
      body.classList.add('locked');
      body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    resetCoverState();
    window.addEventListener('pageshow', resetCoverState);

    openBtn.addEventListener('click', () => {
      body.classList.add('opened');
      body.classList.remove('locked');
      body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.getElementById('hero').scrollIntoView({ behavior:'smooth' });
      bgMusic.play().catch(function(){});
    });

    // ============================================================
    // MUSIK LATAR
    // ============================================================
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    const musicIcon = document.getElementById('musicIcon');

    function updateMusicIcon(){
      if (bgMusic.paused){
        musicIcon.textContent = '♪';
        musicToggle.classList.remove('is-playing');
        musicToggle.setAttribute('aria-label', 'Putar musik');
      } else {
        musicIcon.textContent = '❚❚';
        musicToggle.classList.add('is-playing');
        musicToggle.setAttribute('aria-label', 'Matikan musik');
      }
    }

    musicToggle.addEventListener('click', () => {
      if (bgMusic.paused){
        bgMusic.play().catch(function(){});
      } else {
        bgMusic.pause();
      }
    });

    bgMusic.addEventListener('play', updateMusicIcon);
    bgMusic.addEventListener('pause', updateMusicIcon);

    // ============================================================
    // GALERI FOTO — tumpukan foto berserakan (scattered pile) + modal swipe
    // ============================================================
    const galleryStageEl = document.getElementById('galleryStage');
    const galleryDotsWrap = document.getElementById('galleryDots');
    const galleryItems = galleryStageEl ? Array.from(galleryStageEl.children) : [];

    if (galleryItems.length && galleryStageEl) {
      const modal = document.getElementById('galleryModal');
      const modalImg = document.getElementById('galleryPreview');
      const closeModalBtn = document.querySelector('.gallery-modal-close');
      const prevModalBtn = document.querySelector('.gallery-modal-prev');
      const nextModalBtn = document.querySelector('.gallery-modal-next');
      const prevArrow = document.querySelector('.gallery-arrow-prev');
      const nextArrow = document.querySelector('.gallery-arrow-next');

      const total = galleryItems.length;
      const offsetClasses = ['is-front', 'is-off-1', 'is-off-2', 'is-off-3', 'is-off-n1', 'is-off-n2', 'is-off-n3', 'is-hidden'];
      let activeIndex = 0;
      let isDragging = false;
      let didDrag = false;
      let dragStartX = 0;
      let autoplayTimer = null;

      function getImageSrc(item) {
        const match = item.style.backgroundImage.match(/url\(["']?(.*?)['"]?\)/i);
        return match ? match[1] : '';
      }

      function updateDots() {
        if (!galleryDotsWrap) return;
        Array.from(galleryDotsWrap.children).forEach((dot, i) => {
          dot.classList.toggle('is-active', i === activeIndex);
        });
      }

      function layoutStage() {
        galleryItems.forEach((item, index) => {
          const offset = (index - activeIndex + total) % total;
          const normalized = offset > total / 2 ? offset - total : offset;

          item.classList.remove(...offsetClasses);
          if (normalized === 0) item.classList.add('is-front');
          else if (normalized === 1) item.classList.add('is-off-1');
          else if (normalized === 2) item.classList.add('is-off-2');
          else if (normalized === 3) item.classList.add('is-off-3');
          else if (normalized === -1) item.classList.add('is-off-n1');
          else if (normalized === -2) item.classList.add('is-off-n2');
          else if (normalized === -3) item.classList.add('is-off-n3');
          else item.classList.add('is-hidden');
        });
        updateDots();
      }

      function goTo(index) {
        activeIndex = (index + total) % total;
        layoutStage();
      }

      function restartAutoplay() {
        if (autoplayTimer) clearInterval(autoplayTimer);
        autoplayTimer = setInterval(() => goTo(activeIndex + 1), 2000);
      }

      function pauseAutoplay() {
        if (autoplayTimer) clearInterval(autoplayTimer);
      }

      // Buat titik indikator
      if (galleryDotsWrap) {
        galleryItems.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'gallery-dot';
          dot.setAttribute('aria-label', `Ke foto ${i + 1}`);
          dot.addEventListener('click', () => {
            goTo(i);
            restartAutoplay();
          });
          galleryDotsWrap.appendChild(dot);
        });
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

      galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
          if (didDrag) { didDrag = false; return; }
          openModal(index);
        });
        item.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openModal(index);
          }
        });
      });

      prevArrow?.addEventListener('click', () => { goTo(activeIndex - 1); restartAutoplay(); });
      nextArrow?.addEventListener('click', () => { goTo(activeIndex + 1); restartAutoplay(); });
      closeModalBtn?.addEventListener('click', closeModal);
      prevModalBtn?.addEventListener('click', () => showModalStep(-1));
      nextModalBtn?.addEventListener('click', () => showModalStep(1));

      modal?.addEventListener('click', (event) => {
        if (event.target.matches('[data-close="true"]')) closeModal();
      });

      document.addEventListener('keydown', (event) => {
        if (!modal || !modal.classList.contains('is-open')) return;
        if (event.key === 'ArrowRight') showModalStep(1);
        if (event.key === 'ArrowLeft') showModalStep(-1);
        if (event.key === 'Escape') closeModal();
      });

      // Swipe / drag manual di foto depan
      galleryStageEl.addEventListener('pointerdown', (event) => {
        isDragging = true;
        didDrag = false;
        dragStartX = event.clientX;
        pauseAutoplay();
      });
      galleryStageEl.addEventListener('pointermove', (event) => {
        if (!isDragging) return;
        if (Math.abs(event.clientX - dragStartX) > 6) didDrag = true;
      });
      galleryStageEl.addEventListener('pointerup', (event) => {
        if (!isDragging) return;
        isDragging = false;
        const dx = event.clientX - dragStartX;
        if (Math.abs(dx) > 40) {
          goTo(activeIndex + (dx < 0 ? 1 : -1));
        }
        restartAutoplay();
      });
      galleryStageEl.addEventListener('pointerleave', () => {
        if (!isDragging) return;
        isDragging = false;
        restartAutoplay();
      });

      // Swipe di dalam modal (kayak Tinder / IG story)
      const modalContent = document.querySelector('.gallery-modal-content');
      let modalDragStartX = 0;
      let modalDragging = false;

      modalContent?.addEventListener('pointerdown', (event) => {
        modalDragStartX = event.clientX;
        modalDragging = true;
      });
      modalContent?.addEventListener('pointerup', (event) => {
        if (!modalDragging) return;
        const deltaX = event.clientX - modalDragStartX;
        if (Math.abs(deltaX) > 40) {
          showModalStep(deltaX < 0 ? 1 : -1);
        }
        modalDragging = false;
      });
      modalContent?.addEventListener('pointerleave', () => {
        modalDragging = false;
      });

      goTo(0);
      restartAutoplay();
    }

    // ============================================================
    // HADIAH — salin nomor rekening / e-wallet
    // ============================================================
    document.querySelectorAll('.gift-copy').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-copy-target');
        const target = document.getElementById(targetId);
        if (!target) return;

        const text = target.textContent.trim();
        const finish = () => {
          const originalLabel = btn.textContent;
          btn.textContent = 'Tersalin!';
          btn.classList.add('is-copied');
          setTimeout(() => {
            btn.textContent = originalLabel;
            btn.classList.remove('is-copied');
          }, 1600);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(finish).catch(finish);
        } else {
          const temp = document.createElement('textarea');
          temp.value = text;
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
          finish();
        }
      });
    });

    // ============================================================
    // COUNTDOWN — menuju 09 Oktober 2026, 08:00 WITA (akad)
    // Ubah targetDate bila jadwal berubah.
    // ============================================================
    const targetDate = new Date('2026-10-09T08:00:00+08:00').getTime();

    function updateCountdown(){
      const now = Date.now();
      const diff = targetDate - now;
      if (diff <= 0){
        document.getElementById('cd-days').textContent = '00';
        document.getElementById('cd-hours').textContent = '00';
        document.getElementById('cd-mins').textContent = '00';
        document.getElementById('cd-secs').textContent = '00';
        return;
      }
      const days = Math.floor(diff / (1000*60*60*24));
      const hours = Math.floor((diff / (1000*60*60)) % 24);
      const mins = Math.floor((diff / (1000*60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      document.getElementById('cd-days').textContent = String(days).padStart(2,'0');
      document.getElementById('cd-hours').textContent = String(hours).padStart(2,'0');
      document.getElementById('cd-mins').textContent = String(mins).padStart(2,'0');
      document.getElementById('cd-secs').textContent = String(secs).padStart(2,'0');
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);

    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpNote = document.getElementById('rsvpNote');
    const rsvpList = document.getElementById('rsvpList');
    const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbypoFFyb8I7jJEK7-_0uwVx-1IiwrRXjkEq9QH50F_XehdU-45ordVFawEW9tgFfFxR/exec";

    function loadUcapan() {
      if (!rsvpList) return;

      fetch(SHEET_API_URL)
        .then(function(res) { return res.json(); })
        .then(function(data) {
          console.log('Data ucapan diterima:', data);
          rsvpList.innerHTML = '';
          data.forEach(function(item) {
            const wrap = document.createElement('div');
            wrap.className = 'rsvp-item';

            const nameEl = document.createElement('p');
            nameEl.className = 'rsvp-item-name';
            nameEl.textContent = item.nama;

            const textEl = document.createElement('p');
            textEl.className = 'rsvp-item-text';
            textEl.textContent = item.ucapan;

            wrap.appendChild(nameEl);
            wrap.appendChild(textEl);
            rsvpList.appendChild(wrap);
          });
        })
        .catch(function(err) {
          console.error('Gagal memuat ucapan:', err);
        });
    }

    if (rsvpForm) {
      rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nama = document.getElementById('rsvpNama').value.trim();
        const ucapan = document.getElementById('rsvpUcapan').value.trim();

        if (!nama || !ucapan) return;

        fetch(SHEET_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ nama: nama, ucapan: ucapan })
        }).then(function() {
          rsvpForm.reset();
          if (rsvpNote) {
            rsvpNote.style.display = 'block';
            rsvpNote.classList.add('is-visible');
          }
          loadUcapan();
        }).catch(function() {
          alert('Gagal mengirim ucapan, coba lagi.');
        });
      });
    }

    if (rsvpList) {
      loadUcapan();
    }