document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const page = body.dataset.page;

  if (page === 'chapter') {
    body.classList.add('page-enter');
    requestAnimationFrame(() => {
      body.classList.remove('page-enter');
    });
  }

  if (page !== 'threshold') return;

  const cta = document.querySelector('.threshold__cta');
  const disclaimer = document.querySelector('.threshold__disclaimer');
  const wordmark = document.querySelector('.threshold__wordmark');
  const blackout = document.querySelector('.threshold__blackout');

  if (!cta || !disclaimer || !wordmark || !blackout) return;

  let isTransitioning = false;

  const commitCurrentVisualState = (el) => {
    // Preserve the actual rendered end state of CSS animations
    const animations = el.getAnimations ? el.getAnimations() : [];

    if (animations.length) {
      animations.forEach((animation) => {
        try {
          animation.commitStyles();
        } catch (_) {
          // ignore if commitStyles is unavailable for this animation
        }
        animation.cancel();
      });
    }

    const computed = window.getComputedStyle(el);
    el.style.opacity = computed.opacity;
    el.style.filter = computed.filter;
    el.style.transform = computed.transform === 'none' ? 'none' : computed.transform;
    el.style.animation = 'none';
    el.style.transition = 'none';
  };

  const animateOut = (el, keyframes, options) => {
    return el.animate(keyframes, {
      fill: 'forwards',
      easing: options.easing || 'ease',
      duration: options.duration || 1000
    });
  };

  cta.addEventListener('click', () => {
    if (isTransitioning) return;
    isTransitioning = true;
    cta.disabled = true;

    const destination = cta.dataset.destination || 'chapters/thesis.html';

    // Lock everything exactly as currently rendered before the exit starts.
    [cta, disclaimer, wordmark].forEach(commitCurrentVisualState);
    blackout.style.opacity = '0';

    // 1) Wait 1.5s, then fade the CTA
    setTimeout(() => {
      animateOut(
        cta,
        [
          { opacity: getComputedStyle(cta).opacity, filter: getComputedStyle(cta).filter, transform: getComputedStyle(cta).transform === 'none' ? 'translateY(0)' : getComputedStyle(cta).transform },
          { opacity: 0, filter: 'blur(14px)', transform: 'translateY(2px)' }
        ],
        { duration: 1800, easing: 'ease' }
      );
      cta.style.setProperty('--cta-underline-opacity', '0');
      cta.style.setProperty('--cta-underline-scale', '0');
    }, 1500);

    // 2) 0.5s later, fade the confidentiality disclaimer
    setTimeout(() => {
      const currentOpacity = getComputedStyle(disclaimer).opacity;
      const currentFilter = getComputedStyle(disclaimer).filter;

      disclaimer.animate(
        [
          { opacity: currentOpacity },
          { opacity: 0 }
        ],
        {
          fill: 'forwards',
          duration: 1800,
          easing: 'ease'
        }
      );

      setTimeout(() => {
        disclaimer.animate(
          [
            { filter: currentFilter },
            { filter: 'blur(14px)' }
          ],
          {
            fill: 'forwards',
            duration: 1300,
            easing: 'ease'
          }
        );
      }, 500);
    }, 2000);

    // 3) Then, after an extra 1s, slowly fade the background to pitch black
    setTimeout(() => {
      blackout.animate(
        [
          { opacity: 0 },
          { opacity: 1 }
        ],
        {
          fill: 'forwards',
          duration: 2600,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
        }
      );
    }, 3000);

    // 4) After the background has fully gone black, wait 2s, then fade the wordmark
    setTimeout(() => {
      animateOut(
        wordmark,
        [
          { opacity: getComputedStyle(wordmark).opacity, filter: getComputedStyle(wordmark).filter },
          { opacity: 0, filter: 'blur(18px)' }
        ],
        { duration: 2400, easing: 'ease-in' }
      );
    }, 7600);

    // 5) Navigate after the wordmark has substantially faded
    setTimeout(() => {
      window.location.href = destination;
    }, 10350);
  });
});


document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  if (body.dataset.page !== 'project-index') return;

  const header = document.querySelector('.project-index__header');
  const cardsWrap = document.querySelector('.project-index__cards');
  const cards = Array.from(document.querySelectorAll('.project-card'));
  const footer = document.querySelector('.project-index__footer');
  const atmosphere = document.querySelector('.project-index__atmosphere');
  const radial = document.querySelector('.project-index__radial');
  const radialLabel = document.querySelector('.project-index__radial-label');
  const radialShell = document.querySelector('.project-index__radial-shell');
  const radialCenter = document.querySelector('.project-index__radial-center');
  const radialItems = Array.from(document.querySelectorAll('.project-index__radial-item'));
  const stage = document.querySelector('.project-index__stage');

  if (!header || !cardsWrap || !cards.length || !footer || !atmosphere || !radial || !radialLabel || !radialShell || !radialCenter || !stage) return;

  const radialContent = {
    'The House': ['Doctrine', 'Identity', 'Origins', 'Method'],
    'Lotto I': ['Product', 'Material', 'Packaging', 'Launch'],
    'The Investment Case': ['Model', 'Market', 'Roadmap', 'Capital']
  };

  let activeCard = null;
  let isAnimating = false;

  const positionShellFromCard = (card) => {
    const stageRect = stage.getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    radial.style.setProperty('--shell-x', `${rect.left - stageRect.left}px`);
    radial.style.setProperty('--shell-y', `${rect.top - stageRect.top}px`);
    radial.style.setProperty('--shell-width', `${rect.width}px`);
    radial.style.setProperty('--shell-height', `${rect.height}px`);
    radial.style.setProperty('--shell-radius', `${window.getComputedStyle(card).borderRadius}`);
  };

  const getRadialTargetSize = () => {
    const rem = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;

    if (window.innerWidth <= 560) {
      return 10.2 * rem;
    }
    if (window.innerWidth <= 820) {
      return 11.75 * rem;
    }
    const ideal = window.innerWidth * 0.24;
    return Math.min(Math.max(13 * rem, ideal), 17 * rem);
  };

  const positionShellAtCenter = () => {
    const stageRect = stage.getBoundingClientRect();
    const size = getRadialTargetSize();
    const x = Math.max(0, (stageRect.width - size) / 2);
    const y = Math.max(0, (stageRect.height - size) / 2);
    radial.style.setProperty('--shell-x', `${x}px`);
    radial.style.setProperty('--shell-y', `${y}px`);
    radial.style.setProperty('--shell-width', `${size}px`);
    radial.style.setProperty('--shell-height', `${size}px`);
    radial.style.setProperty('--shell-radius', `${size / 2}px`);
  };

  const setRadialText = (card) => {
    const title = card.querySelector('.project-card__title')?.textContent?.trim() || '';
    radialLabel.textContent = title;
    const labels = radialContent[title] || ['Subcategory I', 'Subcategory II', 'Subcategory III', 'Subcategory IV'];
    radialItems.forEach((item, index) => {
      item.textContent = labels[index] || `Subcategory ${index + 1}`;
    });
  };

  const withdrawOtherCards = (origin) => {
    cards.forEach((card) => {
      card.classList.remove('is-withdrawing', 'is-origin-hidden');
      if (card === origin) return;
      card.classList.add('is-withdrawing');
    });
  };

  const restoreCards = () => {
    cards.forEach((card) => {
      card.classList.remove('is-withdrawing', 'is-origin-hidden');
    });
    cardsWrap.classList.remove('is-menu-open');
  };

  const openRadial = (card) => {
    if (isAnimating || activeCard) return;
    isAnimating = true;
    activeCard = card;
    cardsWrap.classList.add('is-menu-open');
    setRadialText(card);
    positionShellFromCard(card);
    radial.classList.add('is-active');
    withdrawOtherCards(card);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        positionShellAtCenter();
        activeCard.classList.add('is-origin-hidden');
        radial.classList.add('is-expanded');
      });
    });

    window.setTimeout(() => {
      isAnimating = false;
    }, 1040);
  };

  const closeRadial = () => {
    if (!activeCard) return;
    if (isAnimating) {
      window.setTimeout(closeRadial, 120);
      return;
    }
    isAnimating = true;
    radialCenter.disabled = true;
    radial.classList.remove('is-expanded');
    activeCard.classList.remove('is-origin-hidden');
    positionShellFromCard(activeCard);
    cards.forEach((card) => card.classList.remove('is-withdrawing'));

    window.setTimeout(() => {
      radial.classList.remove('is-active');
      restoreCards();
      activeCard = null;
      radialCenter.disabled = false;
      isAnimating = false;
    }, 980);
  };

  setTimeout(() => {
    header.classList.add('is-visible');
  }, 220);

  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('is-visible');
    }, 1280 + index * 360);

    card.addEventListener('click', () => openRadial(card));
  });

  radialCenter.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeRadial();
  });
  radialCenter.addEventListener('pointerup', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeRadial();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeRadial();
  });

  window.addEventListener('resize', () => {
    if (!activeCard) return;
    if (radial.classList.contains('is-expanded')) {
      positionShellAtCenter();
    } else {
      positionShellFromCard(activeCard);
    }
  });

  setTimeout(() => {
    footer.classList.add('is-visible');
  }, 2720);

  setTimeout(() => {
    atmosphere.classList.add('is-visible');
  }, 3460);
});
