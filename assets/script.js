/* Minimal enhancement: mobile nav, dynamic project rendering, year */
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Mobile nav (disabled - nav always visible on mobile)
  const toggle = $('.nav__toggle');
  const navList = $('#nav-list');
  // No longer needed since nav is always visible on mobile

  // Smooth scrolling for navigation links
  const navLinks = $$('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      
      const target = $(href);
      if (target) {
        e.preventDefault();
        // Account for fixed header and keep About from revealing Contact
        const headerHeight = 56; // mirrors body padding-top in CSS
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        // Special-case About: cap the scroll so the Contact section isn't visible
        if (href === '#about') {
          const contact = $('#contact');
          if (contact) {
            const contactTop = contact.getBoundingClientRect().top + window.scrollY;
            const maxScroll = contactTop - window.innerHeight + 1;
            const finalY = Math.min(targetTop, maxScroll);
            window.scrollTo({ top: Math.max(0, finalY), behavior: 'smooth' });
            return;
          }
        }
        window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
        
        // Mobile nav is always visible now, no need to close
      }
    });
  });

  // Year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Render projects into carousel
  const track = $('#project-track');
  const carousel = track ? track.closest('.carousel') : null;
  if (track && carousel) {
    fetch('assets/projects.json', { cache: 'no-cache' })
      .then(r => r.json())
      .then(projects => {
        if (!Array.isArray(projects) || projects.length === 0) return;
        const frag = document.createDocumentFragment();
        projects.forEach(project => {
          const slide = document.createElement('article');
          slide.className = 'carousel__slide';
          slide.setAttribute('role', 'listitem');

          const container = document.createElement('div');
          container.className = 'container';

          const card = document.createElement('div');
          card.className = 'card';

          // We'll only create a link for the Smart card
          let link = null;

          const media = document.createElement('div');
          media.className = 'card__media';
          if (project.coverImage) {
            // Add gradient background for bara svg.svg
            if (project.coverImage === './bara svg.svg') {
              media.style.background = `url("${project.coverImage}"), linear-gradient(135deg, #191411, #302d29)`;
              media.style.backgroundSize = 'contain, cover';
              media.style.backgroundPosition = 'center, center';
              media.style.backgroundRepeat = 'no-repeat, no-repeat';
            } else if (project.coverImage === './try 2.svg') {
              media.style.background = `url("${project.coverImage}"), #232222`;
              media.style.backgroundSize = 'contain, cover';
              media.style.backgroundPosition = 'center, center';
              media.style.backgroundRepeat = 'no-repeat, no-repeat';
            } else {
              media.style.backgroundImage = `url("${project.coverImage}")`;
              media.style.backgroundSize = 'contain';
              media.style.backgroundPosition = 'center';
              media.style.backgroundRepeat = 'no-repeat';
            }
          }

          const body = document.createElement('div');
          body.className = 'card__body';

          const h3 = document.createElement('h3');
          h3.className = 'card__title';
          h3.textContent = project.title || 'Untitled case study';

          const p = document.createElement('p');
          p.className = 'card__summary';
          p.textContent = project.summary || '';

          const tags = document.createElement('ul');
          tags.className = 'tags';
          (project.tags || []).slice(0, 6).forEach(tag => {
            const li = document.createElement('li');
            li.textContent = tag;
            tags.appendChild(li);
          });

          body.append(h3, p, tags);
          // For "Smart", only make the body clickable (media remains non-clickable)
          if ((project.title || '').toLowerCase() === 'smart') {
            // Append media directly to card
            card.appendChild(media);
            // Create a separate link wrapping only the body
            link = document.createElement('a');
            link.className = 'card__link';
            link.href = project.caseStudyUrl || '#';
            link.target = project.caseStudyUrl?.startsWith('http') ? '_blank' : '_self';
            link.rel = link.target === '_blank' ? 'noreferrer noopener' : '';
            link.appendChild(body);
            card.appendChild(link);
          } else {
            // No link for other projects for now
            card.append(media, body);
          }
          container.appendChild(card);
          slide.appendChild(container);
          frag.appendChild(slide);
        });
        track.innerHTML = '';
        track.appendChild(frag);

        const prev = $('.carousel__btn.prev');
        const next = $('.carousel__btn.next');
        let index = 0;
        const slides = Array.from(track.children);
        const slideCount = slides.length;
        let isDragging = false;
        let dragMoved = false; // differentiate a real drag vs. a simple click
        let startX = 0;
        let currentX = 0;
        let initialTransform = 0;

        function center(indexToCenter) {
          const viewportWidth = carousel.getBoundingClientRect().width;
          const slide = slides[indexToCenter];
          const slideRect = slide.getBoundingClientRect();
          const trackRect = track.getBoundingClientRect();
          const slideLeftInTrack = slideRect.left - trackRect.left;
          const target = slideLeftInTrack + (slideRect.width / 2) - (viewportWidth / 2);
          track.style.transform = `translateX(${-target}px)`;
          if (prev) prev.disabled = indexToCenter === 0;
          if (next) next.disabled = indexToCenter === slideCount - 1;
        }

        function go(to) {
          index = Math.max(0, Math.min(slideCount - 1, to));
          center(index);
        }

        // Drag functionality
        function handleStart(e) {
          const startTarget = e.target;
          const onMedia = !!startTarget.closest('.card__media');
          // Only allow drag when starting on the image/media area
          if (!onMedia) return;

          isDragging = true;
          dragMoved = false;
          track.style.transition = 'none';
          startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
          initialTransform = parseInt(track.style.transform.replace('translateX(', '').replace('px)', '')) || 0;
          track.style.cursor = 'grabbing';
          
          // Prevent link hover effects during drag
          const links = track.querySelectorAll('a');
          links.forEach(link => {
            link.style.pointerEvents = 'none';
          });
        }

        function handleMove(e) {
          if (!isDragging) return;
          e.preventDefault();
          currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
          const diffX = currentX - startX;
          if (Math.abs(diffX) > 3) dragMoved = true;
          track.style.transform = `translateX(${initialTransform + diffX}px)`;
        }

        function handleEnd() {
          if (!isDragging) return;
          isDragging = false;
          track.style.transition = 'transform .35s ease';
          track.style.cursor = 'grab';
          
          // Re-enable link interactions
          const links = track.querySelectorAll('a');
          links.forEach(link => {
            link.style.pointerEvents = 'auto';
          });
          
          const diffX = currentX - startX;
          const threshold = 50;
          
          if (Math.abs(diffX) > threshold) {
            if (diffX > 0 && index > 0) {
              go(index - 1);
            } else if (diffX < 0 && index < slideCount - 1) {
              go(index + 1);
            } else {
              center(index);
            }
          } else {
            center(index);
          }
          // Important: reset drag state after click event has had a chance to fire
          // so future clicks on non-media areas are not blocked by stale state
          setTimeout(() => { dragMoved = false; }, 0);
        }

        // Prevent link clicks when dragging
        track.addEventListener('click', (e) => {
          if (dragMoved) {
            e.preventDefault();
            e.stopPropagation();
          }
        }, true);

        // Allow link clicks when there was no real drag movement
        track.addEventListener('click', (e) => {
          const anchor = e.target.closest('a');
          if (!anchor) return;
          if (dragMoved) {
            e.preventDefault();
            e.stopPropagation();
          }
        });

        // Cursor feedback: show pointer over actual links when not dragging
        track.addEventListener('mouseover', (e) => {
          const anchor = e.target.closest('a');
          const media = e.target.closest('.card__media');
          if (anchor && !isDragging) track.style.cursor = 'pointer';
          else if (media && !isDragging) track.style.cursor = 'grab';
          else if (!isDragging) track.style.cursor = 'auto';
        });
        track.addEventListener('mouseout', (e) => {
          if (!isDragging) track.style.cursor = 'auto';
        });

        // Event listeners
        track.addEventListener('mousedown', handleStart);
        track.addEventListener('touchstart', handleStart, { passive: false });
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchend', handleEnd);

        const onResize = () => center(index);
        window.addEventListener('resize', onResize);
        prev && prev.addEventListener('click', () => go(index - 1));
        next && next.addEventListener('click', () => go(index + 1));

        window.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight') go(index + 1);
          if (e.key === 'ArrowLeft') go(index - 1);
        });

        // initial center after layout - start on middle slide
        requestAnimationFrame(() => {
          const middleIndex = Math.floor(slideCount / 2);
          index = middleIndex;
          center(middleIndex);
        });
      })
      .catch(() => { /* no-op */ });
  }
})();

