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
  let activePdfTrigger = null;
  let activeTemplateTrigger = null;

  function ensurePdfModal() {
    let modal = $('#pdf-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'pdf-modal';
    modal.className = 'pdf-modal';
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
      <div class="pdf-modal__backdrop" data-close-modal="true"></div>
      <section
        class="pdf-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-modal-title"
      >
        <button class="pdf-modal__close" type="button" aria-label="Close portfolio viewer">×</button>
        <h3 id="pdf-modal-title" class="pdf-modal__title">Graphics Design Portfolio</h3>
        <div class="pdf-modal__viewer-wrap">
          <iframe
            id="pdf-modal-frame"
            class="pdf-modal__viewer"
            title="Graphics Design Portfolio PDF"
            loading="lazy"
            src=""
          ></iframe>
        </div>
      </section>
    `;

    const closeBtn = $('.pdf-modal__close', modal);
    const closeBackdrop = $('[data-close-modal="true"]', modal);
    const panel = $('.pdf-modal__panel', modal);

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('has-modal-open');
      if (activePdfTrigger) activePdfTrigger.focus();
      activePdfTrigger = null;
    }

    function openModal(pdfPath, title, triggerEl) {
      const frame = $('#pdf-modal-frame', modal);
      const titleEl = $('#pdf-modal-title', modal);
      if (titleEl && title) titleEl.textContent = title;
      if (frame) frame.src = `${pdfPath}#view=FitH`;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('has-modal-open');
      activePdfTrigger = triggerEl || null;
      closeBtn && closeBtn.focus();
    }

    closeBtn && closeBtn.addEventListener('click', closeModal);
    closeBackdrop && closeBackdrop.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (!panel.contains(e.target)) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    modal.openPdfModal = openModal;
    modal.closePdfModal = closeModal;
    document.body.appendChild(modal);
    return modal;
  }

  function ensureEqulTemplateModal() {
    let modal = $('#equl-template-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'equl-template-modal';
    modal.className = 'pdf-modal';
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
      <div class="pdf-modal__backdrop" data-close-template-modal="true"></div>
      <section
        class="pdf-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="equl-template-title"
      >
        <button class="pdf-modal__close" type="button" aria-label="Close Equl template">×</button>
        <h3 id="equl-template-title" class="pdf-modal__title">Equl Case Study</h3>
        <div class="template-modal__content template-modal__content--read-only">
          <article class="template-modal__article" aria-label="Equl project introduction">
            <p>This week, I begin the research of my next project - sustainable development goals. Initial thoughts is that the SDG4 for quality education immediately sticks out for me, especially the rebuilding education systems after COVID-19. This resonates with me a lot because I had to rebuild my own education after COVID, especially whenever my Computer Science teacher had left to join another school and our class did not have a teacher for our key A-Level year, so we essentially had to teach ourselves. We had substitute teachers from other subjects, but our class was really apprehensive about the whole A-Level process, and we did not know what to do that year, especially rebuilding after COVID, which was such a vital time to get education correct.</p>
            <p>The people that I saw were affected the most by education after COVID was people with learning disabilities. As my class was attempting to salvage our second year of A-Levels after a year of zoom call learning, I saw a friend in my class who was particularly struggling with the workload. He has ADHD and a helper in the class to assist him. Due to our classes going online, that support was no longer there for him. As a result, whenever we went into our final year of A-Levels, the workload got too much for him.</p>
            <p>I would like to create an app which would solve that problem for him, and so many other people. It is about making education equal for everyone - because from personal experience, I think some schools do not pay enough attention to students who have learning difficulties and they just expect all students to be on a level playing field and robotically excel through all of their subjects. My school gave out extra work for people who failed in-class tests and I can just feel that a person with learning difficulties would just get completely overwhelmed with the quantity and the difficulty of the work.</p>
            <p>I think I need to create a revision app which would be more catered to people with learning difficulties and it will break down complex subjects into a more fun, learning experience - with breaks in-between.</p>
            <figure class="template-modal__figure">
              <img class="template-modal__image" src="assets/sdg.png" alt="Sustainable Development Goals list with SDG 4 quality education highlighted." loading="lazy" decoding="async">
            </figure>
            <figure class="template-modal__figure">
              <img class="template-modal__image" src="assets/sdg2.jpg" alt="Writing down initial thoughts that come into my head for accessibility and how I would approach the app" loading="lazy" decoding="async">
              <figcaption class="template-modal__caption">Writing down initial thoughts that come into my head for accessibility and how I would approach the app</figcaption>
            </figure>
            <section class="template-modal__image-grid" aria-label="Research reference images">
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg3.jpg" alt="Research screenshot about SDG 4 quality education and COVID-19 context." loading="lazy" decoding="async">
              </figure>
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg4.jpg" alt="Research screenshot exploring neurodivergent color references." loading="lazy" decoding="async">
              </figure>
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg5.jpg" alt="Research screenshot identifying users who benefit from accessibility in education." loading="lazy" decoding="async">
              </figure>
            </section>
            <p class="template-modal__caption template-modal__caption--grid">Understanding and learning about the different disabilities and becoming more familiar with neurodivergence</p>
            <section class="template-modal__image-grid template-modal__image-grid--four" aria-label="Brand inspiration research images">
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg6.jpg" alt="Research image showing mortarboard references for graduation-themed branding." loading="lazy" decoding="async">
              </figure>
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg7.jpg" alt="Research image showing serif letter E references for education branding." loading="lazy" decoding="async">
              </figure>
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg8.jpg" alt="Research image showing color palette exploration for the brand direction." loading="lazy" decoding="async">
              </figure>
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg9.jpg" alt="Research image showing common subject emojis for potential app iconography." loading="lazy" decoding="async">
              </figure>
            </section>
            <p class="template-modal__caption template-modal__caption--grid">Finding initial inspiration for the logomark, looking at "E" serif, tapping into that education feel for the brand, creating a colour scheme for the brand, and finding out common emojis for different subjects and thinking about how I can portray them in the app.</p>
            <p>This week, I continue with idea generation for my SDG, which is rebuilding education systems after COVID-19. I have been sketching out possible ideas for my logomark, naming my brand, and creating a slogan for it. I have also sketched a sample user interface which would be for the initial onboarding process. I think one of the most important things for the onboarding process is understanding what disabilities the user has, and whether they have visual problems or hearing problems. I think the idea of using screen readers or large text is a really nice accessibility feature.</p>
            <p>The name I have settled on is "Equl", the slogan is "making education, equl", and the logomark will be a university cap to emphasise that it is education-focused (although it is not only used for university, it can be used universally from primary school to secondary school to university).</p>
            <section class="template-modal__image-grid template-modal__image-grid--two" aria-label="Brand and onboarding sketches">
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg10.jpg" alt="Sketch of an onboarding screen with fields and disability preference inputs." loading="lazy" decoding="async">
              </figure>
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg11.jpg" alt="Sketch of the Equl logomark concept using a university cap and slogan notes." loading="lazy" decoding="async">
              </figure>
            </section>
            <figure class="template-modal__figure">
              <img class="template-modal__image" src="assets/sdg12.png" alt="Slide snippet showing accessibility statistics from a Zoom lecture with David from Big Motive." loading="lazy" decoding="async">
              <figcaption class="template-modal__caption">A snippet from today’s zoom call with David from Big Motive</figcaption>
            </figure>
            <p>Today’s lecture was very relevant for me because my SDG is very focused on making education accessible for all, so this felt on point. I was stunned to hear that 94.8% of all websites are inaccessible, whether it is the inability for screen readers to read them, or that they do not meet the bare minimum of AA WCAG guidelines (nevermind AAA!). Something that David mentioned is that some clients of Big Motive in the past had pictures (JPEG for example) on their site with text inside them, thinking that it would pass accessibility. It may be shocking to some people that this would not pass accessibility because there is no alt text available for the screen reader to read for the visually impaired.</p>
            <p>Another thing which David mentioned is that frankly, a lot of people just do not take accessibility into account and see it as an afterthought. The positive that I can take from this is that we, as UX designers, can correct this big problem and hopefully make the web more accessible. That is the idea I am going for with my SDG app called "Equl". The lecture this week really inspired me to keep pursuing improvement on accessibility, and it is refreshing to know that other UX designers care.</p>
            <p>As we are approaching the end of the SDG project, it was time for me to take my sketches and digitise them. I looked into how academic caps were represented digitally. I wanted to keep some of the elements while bringing in my colour scheme which resonates with neurodivergent people - I found this colour scheme in Week 4, and it created a nice contrast. Below are my designs which I am preparing for the critique next week:</p>
            <figure class="template-modal__figure">
              <img class="template-modal__image" src="assets/sdg14.png" alt="Standalone digital brand exploration image." loading="lazy" decoding="async">
            </figure>
            <section class="template-modal__image-grid template-modal__image-grid--four" aria-label="First grid of digital design explorations">
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg15.png" alt="Digital design exploration image one." loading="lazy" decoding="async">
              </figure>
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg16.png" alt="Digital design exploration image two." loading="lazy" decoding="async">
              </figure>
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg17.png" alt="Digital design exploration image three." loading="lazy" decoding="async">
              </figure>
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg18.png" alt="Digital design exploration image four." loading="lazy" decoding="async">
              </figure>
            </section>
            <section class="template-modal__image-grid template-modal__image-grid--four" aria-label="Second grid of digital design explorations">
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg19.png" alt="Digital design exploration image five." loading="lazy" decoding="async">
              </figure>
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg20.png" alt="Digital design exploration image six." loading="lazy" decoding="async">
              </figure>
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg21.png" alt="Digital design exploration image seven." loading="lazy" decoding="async">
              </figure>
              <figure class="template-modal__figure template-modal__figure--grid">
                <img class="template-modal__image" src="assets/sdg22.png" alt="Digital design exploration image eight." loading="lazy" decoding="async">
              </figure>
            </section>
            <p>At the end of the lecture, we were able to show Kyle our designs. He gave me really valuable feedback, what I did right, and what I can improve upon for the critique next week. I quickly jotted them down below:</p>
            <figure class="template-modal__figure">
              <img class="template-modal__image" src="assets/sdg24.jpg" alt="Handwritten notes capturing critique feedback points from Kyle." loading="lazy" decoding="async">
            </figure>
            <p>Today’s class, week 9, was the critique for our SDGs. I got a lot of nice feedback from Kyle and the class. The new designs which I added this week were the "boss battle" learning experience.</p>
            <figure class="template-modal__figure">
              <img class="template-modal__image" src="assets/sdg25.png" alt="Screens showing the flow from start lesson into boss battle." loading="lazy" decoding="async">
              <figcaption class="template-modal__caption">Start Lesson &gt; Boss Battle</figcaption>
            </figure>
            <p>The core piece of feedback which resonates the most with me is that I was testing the user on a subject before giving them the flashcards. The way of going about things is giving the user the flashcards and learning resources and then testing the user. I was very caught up in the "test your knowledge" user interfaces. That was very valuable feedback because I know the next steps to take in order to improve my SDG app further.</p>
            <p>Other details that I wrote down during the critique were:</p>
            <ul class="template-modal__list">
              <li>No email</li>
              <li>Mars card section with swipe functionality</li>
              <li>Learning points - points equate to study time on a device</li>
              <li>Fix the icons with the dashes - go back to centre normal</li>
            </ul>
            <p>Whenever I talked to Erin, she told me that my education boss battle user interface reminded her of Street Fighter on the Nintendo Switch. That’s exactly what I am going for, especially the health bar and overall user experience. I want education to be more fun and gamified for people with learning difficulties rather than exhausting.</p>
            <figure class="template-modal__figure">
              <img class="template-modal__image" src="assets/sdg26.png" alt="Street Fighter reference image used as inspiration for the boss battle interface style." loading="lazy" decoding="async">
            </figure>
            <hr class="template-modal__divider" aria-hidden="true">
            <p class="template-modal__project-link">
              <img class="template-modal__project-icon" src="assets/figma icon.png" alt="" aria-hidden="true" loading="lazy" decoding="async">
              <span class="template-modal__project-label">SDG Project:</span>
              <a class="template-modal__project-anchor" href="https://www.figma.com/design/z8ozabesF4A98n7QOqGLLo/Equl---Revision-App?node-id=0-1&t=hL9X7v0CFXro7k9D-0" target="_blank" rel="noreferrer noopener">Equl - Revision App</a>
            </p>
            <p class="template-modal__project-link">
              <img class="template-modal__project-icon" src="assets/figma icon.png" alt="" aria-hidden="true" loading="lazy" decoding="async">
              <span class="template-modal__project-label">SDG Sample Prototype:</span>
              <a class="template-modal__project-anchor" href="https://www.figma.com/proto/etnGCvUKIFo10IDoRnVu73/Equl-Sample-Prototype?node-id=1-2&amp;p=f&amp;t=tdXQds3SmYSwjy65-0&amp;scaling=min-zoom&amp;content-scaling=fixed&amp;page-id=0%3A1" target="_blank" rel="noreferrer noopener">Equl - Sample Prototype</a>
            </p>
          </article>
        </div>
      </section>
    `;

    const closeBtn = $('.pdf-modal__close', modal);
    const closeBackdrop = $('[data-close-template-modal="true"]', modal);
    const panel = $('.pdf-modal__panel', modal);
    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('has-modal-open');
      if (activeTemplateTrigger) activeTemplateTrigger.focus();
      activeTemplateTrigger = null;
    }

    function openModal(triggerEl) {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('has-modal-open');
      activeTemplateTrigger = triggerEl || null;
      closeBtn && closeBtn.focus();
    }

    function ensureImageLightbox() {
      let lightbox = $('#image-lightbox');
      if (lightbox) return lightbox;

      lightbox = document.createElement('div');
      lightbox.id = 'image-lightbox';
      lightbox.className = 'image-lightbox';
      lightbox.setAttribute('aria-hidden', 'true');
      lightbox.innerHTML = `
        <div class="image-lightbox__backdrop" data-close-image-lightbox="true"></div>
        <figure class="image-lightbox__panel" role="dialog" aria-modal="true" aria-label="Expanded image preview">
          <button class="image-lightbox__close" type="button" aria-label="Close image preview">×</button>
          <img class="image-lightbox__img" src="" alt="">
        </figure>
      `;

      const lbPanel = $('.image-lightbox__panel', lightbox);
      const lbImg = $('.image-lightbox__img', lightbox);
      const lbClose = $('.image-lightbox__close', lightbox);

      function closeLightbox() {
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        if (lbImg) {
          lbImg.src = '';
          lbImg.alt = '';
        }
      }

      function openLightbox(src, alt) {
        if (!lbImg || !src) return;
        lbImg.src = src;
        lbImg.alt = alt || '';
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        lbClose && lbClose.focus();
      }

      lightbox.addEventListener('click', (e) => {
        if (!lbPanel.contains(e.target) || e.target.closest('[data-close-image-lightbox="true"]')) {
          closeLightbox();
        }
      });
      lbClose && lbClose.addEventListener('click', closeLightbox);
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
      });

      lightbox.openImageLightbox = openLightbox;
      lightbox.closeImageLightbox = closeLightbox;
      document.body.appendChild(lightbox);
      return lightbox;
    }

    const imageLightbox = ensureImageLightbox();
    function makeImagesZoomable(images) {
      images.forEach((img) => {
        img.classList.add('is-zoomable');
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', `${img.alt || 'Image'} - click to zoom`);
        img.addEventListener('click', () => {
          imageLightbox.openImageLightbox(img.getAttribute('src'), img.getAttribute('alt'));
        });
        img.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            imageLightbox.openImageLightbox(img.getAttribute('src'), img.getAttribute('alt'));
          }
        });
      });
    }

    const zoomableImages = $$('.template-modal__image', modal);
    makeImagesZoomable(zoomableImages);

    // Make About section photos expand with the same lightbox.
    const aboutPhotos = $$('.about__photo');
    makeImagesZoomable(aboutPhotos);

    closeBtn && closeBtn.addEventListener('click', closeModal);
    closeBackdrop && closeBackdrop.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (!panel.contains(e.target)) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    modal.openEqulTemplateModal = openModal;
    modal.closeEqulTemplateModal = closeModal;
    document.body.appendChild(modal);
    return modal;
  }

  const pdfModal = ensurePdfModal();
  const cvLink = $('#cv-link');
  if (cvLink) {
    cvLink.addEventListener('click', (e) => {
      e.preventDefault();
      const pdfPath = cvLink.getAttribute('href');
      pdfModal.openPdfModal(pdfPath, 'Jacob Thompson - CV', cvLink);
    });
  }

  if (track && carousel) {
    fetch('assets/projects.json', { cache: 'no-cache' })
      .then(r => r.json())
      .then(projects => {
        if (!Array.isArray(projects) || projects.length === 0) return;
        const equlModal = ensureEqulTemplateModal();
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
            if (project.coverImage === 'assets/bara svg.svg') {
              media.style.background = `url("${project.coverImage}"), linear-gradient(135deg, #191411, #302d29)`;
              media.style.backgroundSize = 'contain, cover';
              media.style.backgroundPosition = 'center, center';
              media.style.backgroundRepeat = 'no-repeat, no-repeat';
            } else if (project.coverImage === 'assets/try 2.svg') {
              media.style.background = `url("${project.coverImage}"), #222223`;
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
          const normalizedTitle = (project.title || '').toLowerCase();
          const isGraphicsPortfolio = normalizedTitle === 'graphics design portfolio';
          const isSmartCard = normalizedTitle === 'smart';
          const isEqulCard = normalizedTitle === 'equl';

          if (isGraphicsPortfolio) {
            card.classList.add('card--interactive');
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', 'Open Graphics Design Portfolio PDF');
            card.dataset.pdfPath = 'assets/Graphics Design Portfolio.pdf';
            card.dataset.pdfTitle = project.title || 'Graphics Design Portfolio';

            const openFromCard = () => {
              pdfModal.openPdfModal(card.dataset.pdfPath, card.dataset.pdfTitle, card);
            };

            card.addEventListener('click', (e) => {
              if (e.target.closest('a')) return;
              openFromCard();
            });

            card.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openFromCard();
              }
            });
          }

          if (isSmartCard) {
            card.classList.add('card--interactive');
            card.setAttribute('role', 'link');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Open ${project.title || 'Smart'} case study`);
            card.dataset.caseStudyUrl = project.caseStudyUrl || '#';

            const openSmartCard = () => {
              const url = card.dataset.caseStudyUrl;
              if (!url || url === '#') return;
              if (url.startsWith('http')) {
                window.open(url, '_blank', 'noopener,noreferrer');
                return;
              }
              window.location.href = url;
            };

            card.addEventListener('click', (e) => {
              if (e.target.closest('a')) return;
              openSmartCard();
            });

            card.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openSmartCard();
              }
            });
          }

          if (isEqulCard) {
            card.classList.add('card--interactive');
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', 'Open Equl case study template');

            const openEqulTemplate = () => {
              equlModal.openEqulTemplateModal(card);
            };

            card.addEventListener('click', (e) => {
              if (e.target.closest('a')) return;
              openEqulTemplate();
            });

            card.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openEqulTemplate();
              }
            });
          }

          // For "Smart", make both media and body clickable.
          // Drag still starts only on media via handleStart() checks.
          // No inline link wrapper for Smart; card-level interaction matches other interactive cards.
          card.append(media, body);
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

        // initial center after layout - prefer Equl as the starting slide
        requestAnimationFrame(() => {
          const equlIndex = projects.findIndex(
            project => (project.title || '').toLowerCase() === 'equl'
          );
          const startIndex = equlIndex >= 0 ? equlIndex : Math.floor(slideCount / 2);
          index = startIndex;
          center(startIndex);
        });
      })
      .catch(() => { /* no-op */ });
  }
})();

