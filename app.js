(() => {
  const WHATSAPP_NUMBER = '5555991595652';

  const header = document.querySelector('.site-header');
  const menuToggle = document.getElementById('menuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const filterTabs = document.querySelectorAll('.tab-btn');
  const serviceCards = document.querySelectorAll('.service-card');
  const selectionBar = document.getElementById('selectionBar');
  const selectionCountText = document.getElementById('selectionCountText');
  const bookingForm = document.getElementById('bookingForm');
  const bookingChipsContainer = document.getElementById('bookingChips');
  const clientNameInput = document.getElementById('clientName');
  const preferredPeriodInput = document.getElementById('preferredPeriod');
  const preferredDateInput = document.getElementById('preferredDate');
  const clientNotesInput = document.getElementById('clientNotes');
  const messagePreviewText = document.getElementById('messagePreviewText');
  const copyMsgBtn = document.getElementById('copyMsgBtn');
  const copyAddressBtn = document.getElementById('copyAddressBtn');
  const toastEl = document.getElementById('toast');
  const currentYearEl = document.getElementById('currentYear');

  if (currentYearEl) {
    currentYearEl.textContent = String(new Date().getFullYear());
  }

  let toastTimer = null;
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 2800);
  }

  async function copyToClipboard(text, successMessage) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage);
    } catch {
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.setAttribute('readonly', '');
      temp.style.position = 'absolute';
      temp.style.left = '-9999px';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      showToast(successMessage);
    }
  }

  // Header scroll shadow, progress hairline & subtle editorial parallax
  const scrollProgressEl = document.getElementById('scrollProgress');
  const heroSectionEl = document.querySelector('.hero');
  const heroArchImg = document.querySelector('.hero-arch-frame img');
  const gallerySectionEl = document.querySelector('.gallery-section');
  const galleryOffsetWrap = document.querySelector('.gallery-card--offset .gallery-img-wrap');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let scrollTicking = false;
  function updateScrollEffects() {
    scrollTicking = false;
    const scrollY = window.scrollY;

    if (header) {
      header.classList.toggle('is-scrolled', scrollY > 12);
    }

    if (scrollProgressEl) {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? Math.min(1, Math.max(0, scrollY / scrollableHeight)) : 0;
      scrollProgressEl.style.setProperty('--scroll-progress', progress.toFixed(4));
    }

    if (prefersReducedMotion) return;

    if (heroSectionEl && heroArchImg) {
      const heroRect = heroSectionEl.getBoundingClientRect();
      if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
        const shift = Math.max(-22, Math.min(26, scrollY * 0.065));
        heroArchImg.style.setProperty('--hero-parallax', `${shift.toFixed(1)}px`);
      }
    }

    if (gallerySectionEl && galleryOffsetWrap && window.innerWidth > 820) {
      const gRect = gallerySectionEl.getBoundingClientRect();
      if (gRect.bottom > 0 && gRect.top < window.innerHeight) {
        const centerProgress = (window.innerHeight * 0.5 - (gRect.top + gRect.height * 0.5)) / window.innerHeight;
        const offsetShift = Math.max(-18, Math.min(18, centerProgress * 28));
        galleryOffsetWrap.style.setProperty('--gallery-offset-y', `${offsetShift.toFixed(1)}px`);
      }
    }
  }

  function requestScrollTick() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollEffects);
  }

  window.addEventListener('scroll', requestScrollTick, { passive: true });
  window.addEventListener('resize', requestScrollTick, { passive: true });
  updateScrollEffects();

  // Mobile menu drawer
  function setDrawerOpen(open) {
    if (!menuToggle || !mobileDrawer) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    mobileDrawer.hidden = !open;
  }

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      setDrawerOpen(!isExpanded);
    });

    mobileDrawer.querySelectorAll('[data-close-drawer]').forEach((link) => {
      link.addEventListener('click', () => setDrawerOpen(false));
    });
  }

  // Service category filter with staggered entrance
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const category = tab.dataset.filter;
      filterTabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });

      let visibleIndex = 0;
      serviceCards.forEach((card) => {
        const matches = category === 'todos' || card.dataset.category === category;
        card.classList.remove('is-entering');
        card.classList.toggle('is-hidden', !matches);
        if (matches) {
          card.style.setProperty('--card-index', String(visibleIndex));
          void card.offsetWidth;
          card.classList.add('is-entering');
          card.classList.add('is-visible');
          visibleIndex += 1;
        }
      });
    });
  });

  // Bi-directional service selection sync between cards and booking chips
  function getChipCheckboxes() {
    if (!bookingChipsContainer) return [];
    return Array.from(bookingChipsContainer.querySelectorAll('input[type="checkbox"]'));
  }

  function getSelectedServices() {
    return getChipCheckboxes()
      .filter((input) => input.checked)
      .map((input) => input.value);
  }

  function syncCardStates() {
    const selected = new Set(getSelectedServices());

    serviceCards.forEach((card) => {
      const name = card.dataset.service;
      const isSelected = selected.has(name);
      card.classList.toggle('is-selected', isSelected);
      const btn = card.querySelector('.select-service-btn');
      if (btn) {
        btn.textContent = isSelected ? '✓ Selecionado' : '+ Selecionar';
        btn.setAttribute('aria-pressed', String(isSelected));
      }
    });

    if (selectionBar && selectionCountText) {
      const count = selected.size;
      const wasHidden = selectionBar.hidden;
      selectionBar.hidden = count === 0;
      selectionCountText.textContent =
        count === 1 ? '1 serviço selecionado' : `${count} serviços selecionados`;

      if (count > 0 && !wasHidden) {
        selectionBar.classList.remove('is-bumping');
        void selectionBar.offsetWidth;
        selectionBar.classList.add('is-bumping');
      }
    }

    updateMessagePreview();
  }

  function toggleService(serviceName) {
    const chip = getChipCheckboxes().find((input) => input.value === serviceName);
    if (!chip) return;
    chip.checked = !chip.checked;
    syncCardStates();
  }

  serviceCards.forEach((card) => {
    const btn = card.querySelector('.select-service-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      toggleService(btn.dataset.select);
    });
  });

  getChipCheckboxes().forEach((input) => {
    input.addEventListener('change', syncCardStates);
  });

  // Compose WhatsApp booking message
  function buildWhatsAppMessage() {
    const name = (clientNameInput?.value || '').trim();
    const services = getSelectedServices();
    const period = preferredPeriodInput?.value || 'Tarde';
    const dateOrOccasion = (preferredDateInput?.value || '').trim();
    const notes = (clientNotesInput?.value || '').trim();

    const lines = [
      name
        ? `Olá! Me chamo ${name} e gostaria de agendar um horário no Espaço Luciana Cristina.`
        : 'Olá! Gostaria de consultar horários disponíveis no Espaço Luciana Cristina.'
    ];

    if (services.length > 0) {
      lines.push(`Serviços de interesse: ${services.join(', ')}.`);
    }

    lines.push(`Preferência de turno: ${period}.`);

    if (dateOrOccasion) {
      lines.push(`Data / ocasião: ${dateOrOccasion}.`);
    }

    if (notes) {
      lines.push(`Observações: ${notes}`);
    }

    return lines.join('\n');
  }

  function updateMessagePreview() {
    if (!messagePreviewText) return;
    messagePreviewText.textContent = buildWhatsAppMessage();
  }

  [clientNameInput, preferredPeriodInput, preferredDateInput, clientNotesInput].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', updateMessagePreview);
    el.addEventListener('change', updateMessagePreview);
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const message = buildWhatsAppMessage();
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  if (copyMsgBtn) {
    copyMsgBtn.addEventListener('click', () => {
      copyToClipboard(buildWhatsAppMessage(), 'Mensagem de agendamento copiada!');
    });
  }

  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', () => {
      const address = copyAddressBtn.dataset.copy || '';
      copyToClipboard(address, 'Endereço copiado para a área de transferência!');
    });
  }

  syncCardStates();

  // Scroll reveal observer
  const revealNodes = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const delay = Number(entry.target.dataset.delay || 0);
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, delay);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );

    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add('is-visible'));
  }
})();
