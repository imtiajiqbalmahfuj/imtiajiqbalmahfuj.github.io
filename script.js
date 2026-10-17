// Helper to compress images on the fly (makes site load instantly)
function getThumb(url, width = 600) {
  if (!url) return "";
  if (url.includes('.svg')) return url; 
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=80&output=webp`;
}

// Shared helpers
function $(sel, scope=document){ return scope.querySelector(sel) }
function $all(sel, scope=document){ return [...scope.querySelectorAll(sel)] }
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Smooth scroll that goes through Lenis when it's running (see mountMotion)
function smoothScrollTo(y) {
  if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.2 });
  else window.scrollTo({ top: y, behavior: 'smooth' });
}

// === Handle Button Emails (Hero & About) ===
function mountAllEmails() {
  if (!window.SITE || !window.SITE.brand) return;
  const email = window.SITE.brand.email;

  // Logic to apply to each button
  const applyLogic = (btn) => {
    if(!btn) return;
    if(/Mobi|Android/i.test(navigator.userAgent)){
      btn.href = `mailto:${email}`
    } else {
      btn.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`
      btn.target = '_blank'
      btn.rel = 'noopener noreferrer'
    }
  };

  // Apply to all buttons
  applyLogic($('#emailBtn'));       // Hero
  applyLogic($('#aboutMailBtn'));   // About
}

function applyNav(){
  const navCenter = $('#navCenter');
  const connectBtn = $('#connectBtn');
  const homeBrand = $('#homeBrand');
  const mmBtn = $('#menuBtn');
  const mobileMenu = $('#mobileMenu');

  // Brand click
  if(homeBrand){
    homeBrand.addEventListener('click', e=>{
      const isHome = window.location.pathname.endsWith("index.html") || window.location.pathname === "/"; 
      if(isHome){
        e.preventDefault();
        smoothScrollTo(0);
      }
    });
  }

  // Smart scroll
  const navbar = $('#navbar');
  let lastScroll = 0;
  if(navbar) {
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      const isMobile = window.innerWidth < 768; 
      if (!isMobile) {
        navbar.style.transform = "translateY(0)";
        return;
      }
      if (currentScroll > lastScroll && currentScroll > 50) {
        navbar.style.transform = "translateY(-100%)";
      } else {
        navbar.style.transform = "translateY(0)";
      }
      lastScroll = currentScroll;
    });
  }

  const scrollToElement = (el) => {
    let targetEl = el;
    if (el.tagName.toLowerCase() === 'section' || el.tagName.toLowerCase() === 'main') {
      const heading = el.querySelector('h1, h2, h3');
      if (heading) targetEl = heading;
    }
    const isMobile = window.innerWidth < 768;
    const offset = isMobile ? 55 : 85; 
    const y = targetEl.getBoundingClientRect().top + window.scrollY - offset;
    smoothScrollTo(y);
  };

  if(connectBtn){
    connectBtn.addEventListener('click', (e)=> {
      e.preventDefault();
      const contactSec = document.getElementById('contact'); 
      if(contactSec) {
        scrollToElement(contactSec);
      } else {
        window.location.href = "index.html#contact";
      }
    });
  }

  $all('a[href*="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const url = new URL(a.href, window.location.href);
      if (url.pathname === window.location.pathname && url.hash.length > 1) {
        const el = $(url.hash);
        if (el) {
          e.preventDefault();
          scrollToElement(el);
          if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
             mobileMenu.classList.add('hidden');
          }
        }
      }
    });
  });

  // FIXED MOBILE MENU TOGGLE & OUTSIDE CLICK
  if(mmBtn && mobileMenu){
    mmBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevents document click from firing immediately
      mobileMenu.classList.toggle('hidden');
    });

    // Close menu when clicking anywhere else on the screen
    document.addEventListener('click', (e) => {
      if (!mobileMenu.classList.contains('hidden') && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.add('hidden');
      }
    });
  }

  if (window.location.hash) {
    setTimeout(() => {
      const el = $(window.location.hash);
      if (el) scrollToElement(el);
    }, 150);
  }
}

// === Dynamically Build Navigation & Sliding Bracket ===
function mountNavigation() {
  try {
    const navCenter = $('#navCenter');
    const mobileMenu = $('#mobileMenu');
    if (!navCenter || !window.SITE) return; 

    const isHome = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
    const basePath = isHome ? "" : "index.html";

    // Safely extract data
    const exps = window.SITE.experiences || {};
    const expLinks = [
      { id: 'exp-professional', label: 'Professional Experience', data: exps.professional },
      { id: 'exp-research', label: 'Research Experience', data: exps.research },
      { id: 'exp-teach', label: 'Teaching Experience', data: exps.teach }
    ].filter(x => x.data && x.data.length > 0);

    const pubsItems = (window.SITE.publications && window.SITE.publications.items) || [];
    const pubsOrder = (window.SITE.publications && window.SITE.publications.ordering) || [];
    const pubCounts = {};
    pubsItems.forEach(p => { if(p.type) pubCounts[p.type] = (pubCounts[p.type] || 0) + 1; });
    const pubLinks = pubsOrder.filter(type => pubCounts[type] > 0).map(type => ({
      id: type.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label: type
    }));

    const achvs = window.SITE.achievements || {};
    const achvLinks = [
      { id: 'fellowships', label: 'Fellowships, Awards & Research Grants', data: achvs.fellowships },
      { id: 'volunteer', label: 'Leadership & Volunteering', data: achvs.volunteering },
      { id: 'licenses', label: 'License & Certifications', data: achvs.licenses },
      { id: 'workshops', label: 'Workshops & Invited Talks', data: achvs.workshops },
      { id: 'prof_services', label: 'Professional Affiliations & Services', data: achvs.prof_services }
    ].filter(x => x.data && x.data.length > 0);

    const aboutLinks = [
      { id: 'about', label: 'About Me' },
      { id: 'blogs', label: 'Blogs & Notes' },
      { id: 'media', label: 'Media Appearances' }
    ];

    // Desktop Dropdown Builder
    const makeDesktopDropdown = (href, label, links, alignRight = false) => {
      if (links.length === 0) return `<a href="${basePath}${href}" class="nav-item-link text-slate-700 py-2 px-3">${label}</a>`;
      const alignClass = alignRight ? "right-0 md:left-auto" : "left-0";
      return `
        <div class="relative group flex items-center h-full">
          <a href="${basePath}${href}" class="nav-item-link text-slate-700 py-2 px-3">${label}</a>
          <div class="absolute ${alignClass} top-full mt-3 hidden group-hover:flex flex-col glass-dropdown rounded-3xl p-5 min-w-[260px] z-[200] gap-4">
            ${links.map(l => `<a href="${basePath}#${l.id}" class="dropdown-item hover-underline w-fit text-sm text-slate-700 font-medium">${l.label}</a>`).join('')}
          </div>
        </div>
      `;
    };

    // Mobile Dropdown Builder
    const makeMobileDropdown = (href, label, links) => {
      if (links.length === 0) return `<a class="hover-underline font-medium text-slate-700" href="${basePath}${href}">${label}</a>`;
      return `
        <div class="group flex flex-col gap-2">
          <a class="hover-underline font-medium text-slate-700 inline-block w-fit" href="${basePath}${href}">${label}</a>
          <div class="hidden group-hover:flex flex-col pl-4 gap-3 border-l-2 border-slate-100 mt-2">
             ${links.map(l => `<a href="${basePath}#${l.id}" class="text-sm text-slate-500 hover:text-black">${l.label}</a>`).join('')}
          </div>
        </div>
      `;
    };

    const staticLinks = `
      <a href="${basePath}#projects" class="nav-item-link text-slate-700 py-2 px-3">Projects</a>
    `;
    
    // Inject HTML
    navCenter.innerHTML = 
      makeDesktopDropdown('#about', 'About', aboutLinks) +
      staticLinks + 
      makeDesktopDropdown('#experience', 'Experiences', expLinks) +
      makeDesktopDropdown('#publications', 'Publications', pubLinks) +
      makeDesktopDropdown('#achievements', 'Prof. Highlights', achvLinks, true);

    // ==========================================
    // SLIDING BRACKET TRACKER LOGIC
    // ==========================================
    navCenter.style.position = 'relative';
    const bracketSlider = document.createElement('div');
    bracketSlider.className = 'nav-bracket-slider';
    bracketSlider.innerHTML = '<div class="bracket-tl"></div><div class="bracket-br"></div>';
    navCenter.appendChild(bracketSlider);
    
    const navItems = Array.from(navCenter.querySelectorAll('.nav-item-link'));
    let activeItem = null;
    let isHoveringNav = false;

    function updateBracket(target) {
        if (!target) {
            bracketSlider.style.opacity = '0';
            navItems.forEach(item => item.classList.remove('is-active-nav'));
            return;
        }
        
        const targetRect = target.getBoundingClientRect();
        const containerRect = navCenter.getBoundingClientRect();
        
        const padX = 16; 
        const padY = 8;
        
        bracketSlider.style.width = `${targetRect.width + padX}px`;
        bracketSlider.style.height = `${targetRect.height + padY}px`;
        bracketSlider.style.left = `${targetRect.left - containerRect.left - (padX / 2)}px`;
        bracketSlider.style.top = `${targetRect.top - containerRect.top - (padY / 2)}px`;
        bracketSlider.style.opacity = '1';

        navItems.forEach(item => item.classList.remove('is-active-nav'));
        target.classList.add('is-active-nav');
    }

    // Hover routing
    navCenter.addEventListener('mouseenter', () => { isHoveringNav = true; });
    navCenter.addEventListener('mouseleave', () => { 
        isHoveringNav = false; 
        updateBracket(activeItem); // Snap back to scroll position or hide
    });

    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => updateBracket(item));
    });

    // Exact Scroll Spy Logic
    function handleScrollSpy() {
        let currentId = null;
        const sections = document.querySelectorAll('section');
        const scrollY = window.scrollY;
        
        sections.forEach(sec => {
            const sectionTop = sec.offsetTop - 150; // Offset for navbar
            const sectionHeight = sec.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentId = sec.getAttribute('id');
            }
        });

        if (currentId) {
            const matchingNav = navItems.find(nav => nav.getAttribute('href') && nav.getAttribute('href').endsWith(`#${currentId}`));
            if (matchingNav) {
                activeItem = matchingNav;
                if (!isHoveringNav) updateBracket(activeItem);
            } else {
                activeItem = null; // If scrolling through a section NOT in navbar, remove bracket
                if (!isHoveringNav) updateBracket(null);
            }
        } else {
            activeItem = null;
            if (!isHoveringNav) updateBracket(null);
        }
    }
    
    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    setTimeout(handleScrollSpy, 100); // Run once on load to set initial state

    // Build Mobile menu (Fixed to use Mobile builder)
    if (mobileMenu) {
      let mobileMenuGrid = mobileMenu.querySelector('div');
      if (!mobileMenuGrid) {
        mobileMenu.innerHTML = '<div class="max-w-6xl mx-auto px-4 py-5 grid gap-5"></div>';
        mobileMenuGrid = mobileMenu.querySelector('div');
      }
      mobileMenuGrid.innerHTML = 
        makeMobileDropdown('#about', 'About', aboutLinks) +
        staticLinks.replace(/nav-item-link text-slate-700 py-2 px-3/g, "hover-underline font-medium text-slate-700") + 
        makeMobileDropdown('#experience', 'Experiences', expLinks) +
        makeMobileDropdown('#publications', 'Publications', pubLinks) +
        makeMobileDropdown('#achievements', 'Professional Highlights', achvLinks);
    }
  } catch(e) {
    console.error("Navigation build error:", e);
  }
}

function mountLoading(){
  const screen = $('#loadingScreen');
  if(!screen) return;
  let cameFromSameSite = false;
  try {
    if (document.referrer) {
      const ref = new URL(document.referrer);
      cameFromSameSite = ref.origin === location.origin;
    }
  } catch(e){ cameFromSameSite = false; }
  
  if(cameFromSameSite){
    screen.style.display = 'none';
    return;
  }
  
  let hasHidden = false;
  const hide = () => {
    if (hasHidden) return;
    hasHidden = true;
    screen.style.transition = "opacity 0.4s ease";
    screen.style.opacity = '0';
    setTimeout(()=> screen.style.display='none', 400);
  };
  
  window.addEventListener('load', hide);
  // Fail-safe to remove screen even if external assets take too long
  setTimeout(hide, 800); 
}

function mountHero(){
  if (!window.SITE) return;
  const {name, subtitle, cvDownload} = window.SITE.brand;
  const nameEl = $('#heroName');
  if(nameEl) nameEl.textContent = name;
  const subEl = $('#heroSubtitle');
  if(subEl) subEl.textContent = subtitle;

  // CV Button
  const cvBtn = $('#cvBtn');
  if(cvBtn) {
    cvBtn.href = cvDownload;
    cvBtn.setAttribute('download','Imtiaj-Iqbal-Mahfuj-CV.pdf');
  }

  // Link Button -> Scroll to Blogs
  const linkBtn = $('#linkBtn');
  if(linkBtn){
    linkBtn.addEventListener('click', ()=> {
      const el = document.getElementById('blogs');
      if(el){ el.scrollIntoView({behavior:'smooth'}); }
    });
  }

  // Ticker
  const track = $('#tickerTrack');
  if(track) {
    const itemsHTML = window.SITE.tickerIcons.map(it=> `<span class="inline-flex items-center gap-2 mr-8 text-sm text-slate-600">
      <i data-lucide="${it.icon}"></i>${it.name}
    </span>`).join('');
    track.innerHTML = `<div class="ticker-inner">${itemsHTML}</div><div class="ticker-inner">${itemsHTML}</div>`;
    let innerWidth = track.querySelector('.ticker-inner').scrollWidth;
    // Re-measure once fonts/icons settle so the loop seam stays invisible
    window.addEventListener('load', () => { innerWidth = track.querySelector('.ticker-inner').scrollWidth; });
    let pos = 0;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const baseSpeed = isMobile ? 0.5 : 0.8;
    let speed = baseSpeed, targetSpeed = baseSpeed;

    // Glide to a slow crawl while hovered, so a skill can be read
    track.addEventListener('mouseenter', () => { targetSpeed = baseSpeed * 0.2; });
    track.addEventListener('mouseleave', () => { targetSpeed = baseSpeed; });

    // Skip the per-frame work while the ticker is scrolled out of view
    let tickerVisible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { tickerVisible = en.isIntersecting; }).observe(track);
    }

    function animateTicker() {
      if (tickerVisible) {
        speed += (targetSpeed - speed) * 0.08;
        pos -= speed;
        if(pos <= -innerWidth) pos = 0;
        track.style.transform = `translateX(${pos}px)`;
      }
      requestAnimationFrame(animateTicker);
    }
    requestAnimationFrame(animateTicker);
  }

  // Down button
  const downBtn = $('#downBtn');
  if(downBtn){
    downBtn.addEventListener('click', ()=> {
      const el = document.getElementById('aboutCounters');
      if(el){
        const offset = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({top: offset, behavior:'smooth'});
      }
    });
  }
}

function mountSlideshow(){
  const slidesWrap = $('#slides');
  if(!slidesWrap) return;
  const slides = (window.SITE.projects || []).filter(p => p.image).slice();
  const slideCount = slides.length;
  slidesWrap.style.display = 'flex';
  slidesWrap.style.transition = 'transform 0.5s ease';
  slidesWrap.innerHTML = slides.map(s => `
    <div class="relative flex-shrink-0 w-full">
      <a href="projects.html#${s.id}" class="block">
        <img src="${getThumb(s.image, 1000)}" alt="${s.title}" class="w-full h-80 md:h-[28rem] object-cover object-center">
      </a>
    </div>
  `).join('');
  let idx = 0;
  function go(i){
    idx = (i + slideCount) % slideCount;
    slidesWrap.style.transform = `translateX(-${idx * 100}%)`;
  }
  const prev = $('#prevSlide');
  const next = $('#nextSlide');
  if(prev) prev.addEventListener('click', ()=> go(idx-1));
  if(next) next.addEventListener('click', ()=> go(idx+1));
  setInterval(()=> go(idx+1), 4500);
}

function mountAbout(){
  if (!window.SITE) return;
  const {photo} = window.SITE.brand;
  const photoEl = $('#aboutPhoto');
  if(photoEl) {
    // Compressed copy first (the original is ~740 KB); fall back to the original if the CDN fails
    photoEl.onerror = () => { photoEl.onerror = null; photoEl.src = photo; };
    photoEl.src = getThumb(photo, 1000);
  }
  const bioEl = $('#aboutBio');
  if(bioEl) bioEl.innerHTML = window.SITE.about.bio;
  const msgBtn = $('#msgBtn');
  if(msgBtn) msgBtn.addEventListener('click', ()=> window.open(window.SITE.brand.linkedin,'_blank'));

  // Education
  const edu = window.SITE.education;
  const list = $('#eduList');
  if(list) {
    list.innerHTML = edu.map((e,i)=>`
      <div class="card p-4 bg-white rounded-xl border border-slate-200">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="font-semibold">${e.title}</div>
            <div class="text-sm text-slate-600">${e.degree}</div>
            <div class="text-xs text-slate-500 mt-1">${e.date}</div>
            <div class="text-xs text-slate-500">${e.location}</div>
            ${e.bullets && e.bullets.length 
              ? `<ul class="list-disc pl-5 mt-2 text-sm text-slate-700">${e.bullets.map(b=>`<li>${b}</li>`).join('')}</ul>` 
              : ''}
          </div>
          <a class="icon-btn border border-slate-200 hover:bg-black hover:text-white hover-smart" href="${e.link}" target="_blank" aria-label="Open ${e.title} website">
            <i data-lucide="arrow-up-right"></i>
          </a>
        </div>
      </div>
    `).join('');
  }
  
  // Research Interests
  const researchWrap = $('#research');
  if (researchWrap) {
    researchWrap.innerHTML = `
      <div class="mb-0">
        <h3 class="text-lg font-semibold mb-2">${window.SITE.research.title}</h3>
        <div class="flex flex-wrap gap-2">
          ${window.SITE.research.items.map(item => `
            <button class="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-black hover:text-white hover-smart">
              ${item}
            </button>
          `).join("")}
        </div>
      </div>`;
  }
  
  // Skills
  const skillsWrap = $('#skills');
  if (skillsWrap) {
    skillsWrap.innerHTML = window.SITE.skills.map(group => `
      <div class="mb-0">
        <h3 class="text-lg font-semibold mb-2">${group.title}</h3>
        <div class="flex flex-wrap gap-2">
          ${group.items.map(skill => `
            <button class="px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-black hover:text-white hover-smart">
              ${skill}
            </button>
          `).join("")}
        </div>
      </div>`).join("");
  }

  // Counters
  const counterWrap = $('#aboutCounters');
  if (counterWrap) {
    counterWrap.innerHTML = window.SITE.counters.map(c => `
      <div class="card p-6 bg-white rounded-xl border border-slate-200 text-center">
        <div class="text-3xl font-bold text-black count-up" data-target="${c.value}">0</div>
        <div class="mt-2 text-slate-600">${c.label}</div>
      </div>
    `).join("");
    initCounters();
  }
}

function initCounters(){
  const counters = document.querySelectorAll('.count-up');
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    let count = 0;
    const step = Math.ceil(target / 100);
    const update = () => {
      count += step;
      if (count >= target) {
        counter.textContent = target + "+";
      } else {
        counter.textContent = count;
        requestAnimationFrame(update);
      }
    }
    update();
  });
}

function mountProjectsCarousel() {
  const wrap = $('#projectCarousel');
  if (!wrap) return;
  const items = (window.SITE.projects || []).filter(p => p.image);
  const uniqueTags = [...new Set(items.flatMap(p => p.tags))];
  const tagOrder = ["Portfolio", "GIS", "Geospatial Python", "GEE", "ML", "Remote Sensing", "URP", "GeoViz", "Operations Research", "Others"];
  const tags = [
    ...tagOrder.filter(t => uniqueTags.includes(t)),
    ...uniqueTags.filter(t => !tagOrder.includes(t)).sort()
  ];
  const tagWrap = $('#projectTags');
  tagWrap.innerHTML = ''; 
  tagWrap.insertAdjacentHTML('beforeend', `<button data-tag="ALL" class="filter-btn px-3 py-1.5 bg-black text-white border border-slate-200 rounded-xl hover:bg-black hover:text-white hover-smart">All</button>`);
  tags.forEach(t => tagWrap.insertAdjacentHTML('beforeend', `<button data-tag="${t}" class="filter-btn px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-black hover:text-white hover-smart">${t}</button>`));
  let filtered = items.slice();
  function render() {
    $('#projectTrack').innerHTML = filtered.map(p => `
      <div class="flex-shrink-0">
        <div class="card h-full bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <a href="projects.html#${p.id}" target="_blank" class="block">
            <img src="${getThumb(p.image, 400)}" class="w-full h-48 object-cover" alt="${p.title}">
          </a>
          <div class="p-4 flex flex-col gap-3 grow">
            <div class="font-medium">${p.title}</div>
            <div class="flex flex-wrap gap-2">${p.tags.map(t => `<span class="text-xs px-2 py-0.5 border rounded-full">${t}</span>`).join('')}</div>
            <div class="mt-auto flex gap-2 justify-end">
              ${p.details ? `<a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${p.details}" target="_blank" rel="noopener noreferrer"><i data-lucide="external-link"></i><span class="sr-only">See more</span></a>` : ''}
              ${p.github ? `<a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${p.github}" target="_blank" rel="noopener noreferrer"><i data-lucide="monitor"></i></a>` : ''}
            </div>
          </div>
        </div>
      </div>
    `).join('');
    lucide.createIcons();
  }
  render();
  tagWrap.addEventListener('click', e => {
    const b = e.target.closest('button[data-tag]');
    if (!b) return;
    const t = b.dataset.tag;
    filtered = (t === "ALL") ? items.slice() : items.filter(p => (p.tags || []).includes(t));
    render();
    tagWrap.querySelectorAll('button[data-tag]').forEach(btn => {
      btn.classList.remove('bg-black', 'text-white');
      btn.classList.add('bg-white');
    });
    b.classList.remove('bg-white');
    b.classList.add('bg-black', 'text-white');
  });
  const track = $('#projectTrackOuter');
  const prev = $('#projPrev');
  const next = $('#projNext');
  if(prev) prev.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }));
  if(next) next.addEventListener('click', () => track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }));
}

function mountExperience(){
  const list = $('#expList');
  if(!list) return;
  
  const isHome = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
  const E = window.SITE.experiences;
  if (!E) return;

  const sections = [
    { id: 'exp-professional', title: 'Professional Experience', list: E.professional, icon: 'briefcase' },
    { id: 'exp-research', title: 'Research Experience', list: E.research, icon: 'microscope' },
    { id: 'exp-teach', title: 'Teaching Experience', list: E.teach, icon: 'presentation' }
  ];

  list.innerHTML = sections.map(sec => {
    const items = isHome ? (sec.list || []).slice(0, 8) : (sec.list || []);
    if(items.length === 0) return '';

    return `
      <div class="flex flex-col h-full mb-8" id="${sec.id}">
        <div class="font-bold mb-4 text-xl flex items-center gap-2">
           ${sec.title}
        </div>
        
        <div class="grid gap-3 mb-4">
          ${items.map(x=>`
            <div class="card p-4 bg-white rounded-xl border border-slate-200">
              <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div class="font-semibold">${x.role}</div>
                  <div class="text-sm text-slate-600">${x.org}</div>
                  <div class="text-xs text-slate-500">${x.date} — ${x.location}</div>
                  <ul class="mt-2 list-disc pl-5 text-sm text-slate-700">${x.bullets.map(b=>`<li>${b}</li>`).join('')}</ul>
                </div>
                <div class="flex gap-2 md:self-end">
                  ${x.github ? `<a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${x.github}"  target="_blank" rel="noopener noreferrer"><i data-lucide="file-text"></i></a>` : ''}
                  ${x.cert ? `<a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${x.cert}" target="_blank" rel="noopener noreferrer"><i data-lucide="badge-check"></i></a>` : ''}
                  ${x.details ? `<a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${x.details}" target="_blank" rel="noopener noreferrer"><i data-lucide="external-link"></i></a>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        ${isHome ? `
        <div class="mt-2">
           <a href="experience.html#${sec.id}" class="inline-flex items-center gap-2 text-sm font-bold text-black hover:underline decoration-2 underline-offset-4 group">
             See all ${sec.title.toLowerCase()} <i data-lucide="${sec.icon}" class="w-4 h-4 transition-transform group-hover:scale-110"></i>
           </a>
        </div>
        ` : ''}
      </div>
    `
  }).join('');

  if(window.lucide) lucide.createIcons();
}

function mountPublications() {
  const rec = $('#pubRecent');
  if(!rec) return;

  const isHome = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
  const P = window.SITE.publications;
  if (!P) return;

  const order = P.ordering || [];
  const items = P.items || [];

  const grouped = {};
  items.forEach(item => {
    if (!grouped[item.type]) grouped[item.type] = [];
    grouped[item.type].push(item);
  });

  const typesToRender = [...order];
  Object.keys(grouped).forEach(t => {
    if (!typesToRender.includes(t)) typesToRender.push(t);
  });

  const icons = {
    "Peer-Reviewed Journal Articles": "book-check",
    "Journal Articles": "book-open",
    "Book Chapters": "book",
    "Conference Presentations & Proceedings": "users", // Updated to match your data
    "Manuscripts Under Review": "eye",
    "Manuscripts in Preparation": "file-edit",
    "Reports": "file-text",
    "Posters": "layout-template"
  };

  rec.innerHTML = typesToRender.map(type => {
    let groupItems = grouped[type] || [];

    if (isHome) {
      groupItems = groupItems.slice(0, 6);
    }

    if (groupItems.length === 0) return '';

    const secId = type.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const icon = icons[type] || "library";

    return `
      <div class="flex flex-col h-full mb-8" id="${secId}">
        <div class="font-bold mb-4 text-xl flex items-center gap-2">
           ${type}
        </div>

        <div class="grid gap-3 mb-4">
          ${groupItems.map(p => `
            <div class="card p-4 bg-white rounded-xl border border-slate-200">
              <div class="font-medium mt-1">${p.title}</div>
              <div class="text-xs text-slate-500">${p.date} · ${p.venue}</div>
              <div class="mt-3 flex gap-2 justify-end">
                ${p.cite ? `<a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${p.cite}" target="_blank">
                  <i data-lucide="quote"></i><span class="sr-only">Cite</span>
                </a>` : ''}
                ${p.cert ? `<a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${p.cert}" target="_blank">
                  <i data-lucide="badge-check"></i><span class="sr-only">Cite</span>
                </a>` : ''}
                ${p.details ? `<a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${p.details}" target="_blank">
                  <i data-lucide="external-link"></i><span class="sr-only">See more</span>
                </a>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        ${isHome ? `
        <div class="mt-2">
           <a href="publications.html#${secId}" class="inline-flex items-center gap-2 text-sm font-bold text-black hover:underline decoration-2 underline-offset-4 group">
             See all <i data-lucide="${icon}" class="w-4 h-4 transition-transform group-hover:scale-110"></i>
           </a>
        </div>
        ` : ''}
      </div>
    `;
  }).join('');

  if(window.lucide) lucide.createIcons();
}

function mountAchvPreview(){
  const wrap = $('#achvPreview');
  if(!wrap) return;
  const A = window.SITE.achievements;
  if(!A) return;

  const sections = [
    {id:'fellowships', title:'Fellowships, Awards & Research Grants', list: A.fellowships, icon:'award'},
    {id:'volunteer', title:'Leadership & Volunteering Experience', list: A.volunteering, icon:'users'},
    {id:'licenses', title:'License & Certifications', list: A.licenses, icon:'shield-check'},
    {id:'workshops', title:'Workshops & Invited Talks', list: A.workshops, icon:'presentation'},
    {id:'prof_services', title:'Professional Affiliations & Services', list: A.prof_services, icon:'briefcase'}
  ];

  wrap.innerHTML = sections.map(sec => {
    const items = (sec.list || []).slice(0, 5);
    if(items.length === 0) return ''; 

    return `
      <div class="flex flex-col h-full mb-8" id="${sec.id}">
        <div class="font-bold mb-4 text-xl flex items-center gap-2">
           ${sec.title}
        </div>
        
        <div class="grid gap-3 mb-4">
          ${items.map(a => `
            <div class="card p-4 bg-white rounded-xl border border-slate-200">
              <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                
                <div>
                  <div class="text-sm">${a.title}</div>
                  <div class="text-xs text-slate-500">${a.date || ''}</div>
                  ${a.tags?.length ? `<div class="mt-1 flex flex-wrap gap-1">${a.tags.map(t=>`<span class="text-xs px-2 py-0.5 border rounded-full">${t}</span>`).join('')}</div>` : ''}
                </div>
                
                <div class="flex gap-2 md:self-end">
                  ${a.cert ? `<a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${a.cert}" target="_blank" rel="noopener noreferrer"><i data-lucide="badge-check"></i></a>` : ''}
                  ${a.link ? `
                  <a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${a.link}" target="_blank">
                    <i data-lucide="external-link"></i>
                  </a>` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="mt-2">
           <a href="achievements.html#${sec.id}" class="inline-flex items-center gap-2 text-sm font-bold text-black hover:underline decoration-2 underline-offset-4 group">
             See all <i data-lucide="${sec.icon}" class="w-4 h-4 transition-transform group-hover:scale-110"></i>
           </a>
        </div>
      </div>
    `
  }).join('');

  if(window.lucide) lucide.createIcons();
}

function mountServices() {
  const wrap = document.querySelector("#servicesList");
  if (!wrap) return;
  wrap.innerHTML = window.SITE.services.map(s => `
    <div class="card p-6 bg-white border border-slate-200 rounded-xl text-center hover:[transform:scale(1.03)] transition-transform duration-200 hover:shadow-lg hover-smart">
      <i data-lucide="${s.icon}" class="mx-auto mb-3"></i>
      <h4 class="font-semibold text-lg">${s.title}</h4>
      <p class="text-sm text-gray-600 mt-2">${s.description}</p>
    </div>
  `).join("");
  if(window.lucide) lucide.createIcons();
}

function mountFooter(){
  const zone = $('#footerLinks');
  if(!zone) return;
  zone.innerHTML = window.SITE.socials.map(s=>`
    <a class="footer-link hover:bg-white hover:text-black hover-smart" href="${s.href}" target="_blank">
      <i data-lucide="${s.icon}"></i><span>${s.label}</span>
    </a>
  `).join('');
  const y = $('#year');
  if(y) y.textContent = new Date().getFullYear();
}

function mountBlogCarousel() {
  const track = $('#blogTrack');
  if (!track) return;

  const items = window.SITE.blogs || [];

  track.innerHTML = items.map(b => `
    <div class="flex-shrink-0 w-80 md:w-96">
      <div class="card h-full bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover-smart">
        <a href="${b.link}" target="_blank" class="block relative group">
          <img src="${getThumb(b.image, 400)}" class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" alt="${b.title}">
        </a>
        <div class="p-5 flex flex-col gap-3 grow">
          <div class="text-xs text-slate-500 font-medium">${b.date}</div>
          <a href="${b.link}" target="_blank" class="font-bold text-lg leading-tight hover:text-slate-600 transition-colors">
            ${b.title}
          </a>
          <div class="flex flex-wrap gap-2 mt-1">
            ${b.tags.map(t => `<a href="blogs.html?tag=${t}" class="text-xs px-2.5 py-1 border border-slate-200 rounded-full text-slate-600 hover:bg-black hover:text-white transition-colors">${t}</a>`).join('')}
          </div>
          <div class="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
            <span class="text-xs text-slate-400">Read article</span>
            <a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${b.link}" target="_blank">
              <i data-lucide="external-link"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();

  const outer = $('#blogTrackOuter');
  if(outer){
    $('#blogPrev').addEventListener('click', () => outer.scrollBy({ left: -outer.clientWidth, behavior: 'smooth' }));
    $('#blogNext').addEventListener('click', () => outer.scrollBy({ left: outer.clientWidth, behavior: 'smooth' }));
  }
}

function mountMediaCarousel() {
  const track = $('#mediaTrack');
  if (!track) return;

  const items = window.SITE.media || [];

  track.innerHTML = items.map(m => `
    <div class="flex-shrink-0 w-80 md:w-96">
      <div class="card h-full bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover-smart">
        <a href="${m.link}" target="_blank" class="block relative group">
          <img src="${getThumb(m.image, 400)}" class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" alt="${m.title}">
        </a>
        <div class="p-5 flex flex-col gap-3 grow">
          <div class="text-xs text-slate-500 font-medium">${m.date}</div>
          <a href="${m.link}" target="_blank" class="font-bold text-lg leading-tight hover:text-slate-600 transition-colors">
            ${m.title}
          </a>
          <div class="flex flex-wrap gap-2 mt-1">
            ${(m.tags||[]).map(t => `<span class="text-xs px-2.5 py-1 border border-slate-200 rounded-full text-slate-600">${t}</span>`).join('')}
          </div>
          <div class="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
            <span class="text-xs text-slate-400">View media</span>
            <a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${m.link}" target="_blank">
              <i data-lucide="external-link"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  if(window.lucide) lucide.createIcons();

  const outer = $('#mediaTrackOuter');
  if(outer){
    $('#mediaPrev').addEventListener('click', () => outer.scrollBy({ left: -outer.clientWidth, behavior: 'smooth' }));
    $('#mediaNext').addEventListener('click', () => outer.scrollBy({ left: outer.clientWidth, behavior: 'smooth' }));
  }
}

function mountBlogsPage() {
  const list = document.getElementById('blogList');
  if (!list) return;

  const params = new URLSearchParams(window.location.search);
  const tagFilter = params.get('tag');

  let items = window.SITE.blogs || [];
  
  const headerDesc = document.querySelector('#blogHeaderDesc');
  if (tagFilter) {
    items = items.filter(b => b.tags.includes(tagFilter));
    if(headerDesc) {
      headerDesc.innerHTML = `Showing articles tagged: <span class="font-bold text-black">#${tagFilter}</span> <a href="blogs.html" class="ml-2 text-sm text-blue-600 hover:underline">(Clear filter)</a>`;
    }
  }

  if(items.length === 0){
    list.innerHTML = `<div class="col-span-full text-center py-20 text-slate-500">No articles found with the tag "${tagFilter}". <br><a href="blogs.html" class="underline mt-2 inline-block">View all</a></div>`;
    return;
  }

  list.innerHTML = items.map(b => `
    <div class="card bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
      <a href="${b.link}" target="_blank" class="block overflow-hidden">
        <img src="${getThumb(b.image, 400)}" class="w-full h-52 object-cover transition-transform duration-500 hover:scale-105" alt="${b.title}">
      </a>
      <div class="p-6 flex flex-col gap-4 grow">
        <div class="flex items-center justify-between">
           <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">${b.date}</span>
        </div>
        <a href="${b.link}" target="_blank" class="font-bold text-xl hover:underline decoration-2 underline-offset-4">
          ${b.title}
        </a>
        <div class="flex flex-wrap gap-2">
           ${b.tags.map(t => `<a href="blogs.html?tag=${t}" class="text-xs px-2.5 py-1 border border-slate-200 rounded-full text-slate-600 hover:bg-black hover:text-white transition-colors">${t}</a>`).join('')}
        </div>
        <div class="mt-auto pt-4 flex justify-end">
          <a class="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all" href="${b.link}" target="_blank">
            Read more <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </a>
        </div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

// Particle Engine (lightweight): same cyan/magenta network, far less work per frame.
// - Lines are bucketed by opacity and stroked in a few batched paths instead of one stroke() per line
// - Dots are filled in one path per colour
// - Frame rate is capped at 30fps on phones / low-power devices; movement is time-scaled so speed looks the same
// - Nothing animates for visitors who ask for reduced motion
function initDefaultParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'magicCanvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobileDevice = window.innerWidth <= 768;
  const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  const FRAME_MS = (isMobileDevice || lowPower) ? 1000 / 30 : 0;

  const LINK = 100;                // max link distance between particles
  const LINK_SQ = LINK * LINK;
  const BUCKETS = 4;               // opacity steps for batched line drawing
  const mouse = { x: null, y: null, radius: 120 };
  const MOUSE_SQ = mouse.radius * mouse.radius;
  let particles = [];

  function targetCount() {
    const area = canvas.width * canvas.height;
    if (isMobileDevice) return 14;                       // a light sprinkle on phones
    return Math.round(Math.min(area / 30000, lowPower ? 24 : 40));
  }

  function makeParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      cyan: Math.random() > 0.5
    };
  }

  function resize() {
    const oldW = canvas.width || 1, oldH = canvas.height || 1;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Keep existing particles where they were, proportionally
    particles.forEach(p => { p.x *= canvas.width / oldW; p.y *= canvas.height / oldH; });
    const n = targetCount();
    while (particles.length < n) particles.push(makeParticle());
    particles.length = n;
  }

  if (!isMobileDevice) {
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
  }

  // Reusable per-bucket segment lists: [x1, y1, x2, y2, ...]
  const linkBuckets = Array.from({ length: BUCKETS }, () => []);
  const mouseBuckets = Array.from({ length: BUCKETS }, () => []);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    linkBuckets.forEach(b => (b.length = 0));
    mouseBuckets.forEach(b => (b.length = 0));

    const n = particles.length;
    const hasMouse = mouse.x !== null;
    for (let a = 0; a < n; a++) {
      const pa = particles[a];
      for (let b = a + 1; b < n; b++) {
        const pb = particles[b];
        const dx = pa.x - pb.x, dy = pa.y - pb.y;
        if (dx > LINK || dx < -LINK || dy > LINK || dy < -LINK) continue;
        const d2 = dx * dx + dy * dy;
        if (d2 < LINK_SQ) {
          const k = Math.min(BUCKETS - 1, Math.floor((Math.sqrt(d2) / LINK) * BUCKETS));
          linkBuckets[k].push(pa.x, pa.y, pb.x, pb.y);
        }
      }
      if (hasMouse) {
        const mx = pa.x - mouse.x, my = pa.y - mouse.y;
        const m2 = mx * mx + my * my;
        if (m2 < MOUSE_SQ) {
          const k = Math.min(BUCKETS - 1, Math.floor((Math.sqrt(m2) / mouse.radius) * BUCKETS));
          mouseBuckets[k].push(pa.x, pa.y, mouse.x, mouse.y);
        }
      }
    }

    const strokeBuckets = (buckets, rgb, width) => {
      ctx.lineWidth = width;
      for (let k = 0; k < BUCKETS; k++) {
        const segs = buckets[k];
        if (!segs.length) continue;
        ctx.strokeStyle = `rgba(${rgb}, ${1 - (k + 0.5) / BUCKETS})`;
        ctx.beginPath();
        for (let i = 0; i < segs.length; i += 4) {
          ctx.moveTo(segs[i], segs[i + 1]);
          ctx.lineTo(segs[i + 2], segs[i + 3]);
        }
        ctx.stroke();
      }
    };
    strokeBuckets(linkBuckets, '0, 255, 255', 0.5);
    strokeBuckets(mouseBuckets, '255, 0, 255', 1);

    // Dots: one path per colour
    [['#00ffff', true], ['#ff00ff', false]].forEach(([color, cyan]) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      for (const p of particles) {
        if (p.cyan !== cyan) continue;
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      ctx.fill();
    });
  }

  function step(dt) {
    const W = canvas.width, H = canvas.height;
    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x > W || p.x < 0) p.vx = -p.vx;
      if (p.y > H || p.y < 0) p.vy = -p.vy;
    }
  }

  resize();

  if (reduceMotion) {
    draw(); // a still constellation
  } else {
    let last = performance.now();
    function animate(now) {
      requestAnimationFrame(animate);
      const elapsed = now - last;
      if (elapsed < FRAME_MS) return;
      last = now;
      step(Math.min(elapsed / 16.67, 3)); // time-scaled; clamp after tab switches
      draw();
    }
    requestAnimationFrame(animate);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); if (reduceMotion) draw(); }, 150);
  });
}



// === Dark Purple Glassmorphism, Video Injection & Theme Configuration ===
function mountMagicMode() {
  const btn = $('#magicBtn');
  if (!btn) return;

  // ==========================================
  // CONFIGURATION: SET DEFAULT THEME FOR NEW VISITORS
  // true = Site loads in Dark Mode initially
  // false = Site loads in Light Mode initially
  // ==========================================
  const DEFAULT_DARK_MODE = false; 

  const params = new URLSearchParams(window.location.search);
  let savedTheme = localStorage.getItem('theme');
  
  if (params.has('theme')) {
    savedTheme = params.get('theme');
  }

  let isMagic = savedTheme !== null ? (savedTheme === 'dark') : DEFAULT_DARK_MODE;

  // Hero visuals are heavy, so they sleep while the hero is off screen or hidden by the other theme
  let heroVisible = true;
  const heroSleepers = [];
  const syncHeroVisuals = () => heroSleepers.forEach(fn => fn());
  const heroSection = document.getElementById('hero');
  if (heroSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; syncHeroVisuals(); }).observe(heroSection);
  }
  document.addEventListener('themechange', syncHeroVisuals);

  function injectVideos() {
    const hero = document.getElementById('hero');
    if (!hero) return; // Safely exit if on a subpage

    // 1. Black Hole Video
    if (!document.getElementById('heroBlackhole')) {
      const heroVid = document.createElement('video');
      heroVid.id = 'heroBlackhole';
      heroVid.className = 'blackhole-video hero-blackhole';
      heroVid.src = 'https://raw.githubusercontent.com/sanidhyy/space-portfolio/main/public/videos/blackhole.webm';
      heroVid.autoplay = true; heroVid.loop = true; heroVid.muted = true; heroVid.playsInline = true;
      hero.appendChild(heroVid);

      // Only decode the video when it can actually be seen (Space theme + hero on screen)
      heroSleepers.push(() => {
        if (heroVisible && document.body.classList.contains('magic-mode')) heroVid.play().catch(() => {});
        else heroVid.pause();
      });
      syncHeroVisuals();
    }

    // 2. Interactive Globe
    if (!document.getElementById('heroGlobe')) {
      const globeDiv = document.createElement('div');
      globeDiv.id = 'heroGlobe';
      globeDiv.className = 'earth-3d'; 
      hero.appendChild(globeDiv);

      // >>> MOBILE PERFORMANCE FIX: Reduce rendered canvas size by 60% on phones
      const isMobile = window.innerWidth <= 768;
      const globeSize = isMobile ? 600 : 1300; 

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/globe.gl';
      script.async = true; script.defer = true;
      script.onload = async () => {
        const { scaleSequentialSqrt } = await import('https://esm.sh/d3-scale');
        
        // >>> COLOR OPTIONS: Change 'interpolateViridis' below to any of these:
        // interpolateCool, interpolateMagma, interpolatePlasma, interpolateInferno, interpolateYlGnBu
        const {interpolateViridis } = await import('https://esm.sh/d3-scale-chromatic'); 
        
        const colorScale = scaleSequentialSqrt(interpolateViridis);
        const getVal = feat => feat.properties.GDP_MD_EST / Math.max(1e5, feat.properties.POP_EST);

        fetch('https://unpkg.com/globe.gl/example/datasets/ne_110m_admin_0_countries.geojson')
          .then(res => res.json())
          .then(countries => {
            const maxVal = Math.max(...countries.features.map(getVal));
            colorScale.domain([0, maxVal]);

            const world = Globe()(globeDiv)
              .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
              .backgroundColor('rgba(0,0,0,0)')
              .width(globeSize).height(globeSize) // Applied performance size
              .lineHoverPrecision(0)
              .polygonsData(countries.features.filter(d => d.properties.ISO_A2 !== 'AQ'))
              .polygonAltitude(isMobile ? 0.005 : 0.02) // Lowers 3D pop on mobile for better FPS
              .polygonCapColor(feat => colorScale(getVal(feat)))
              .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
              .polygonStrokeColor(() => '#111')
              .polygonLabel(({ properties: d }) => `
                <div style="background: rgba(0,0,0,0.8); padding: 6px 10px; border-radius: 8px; color: white; font-family: sans-serif; font-size: 13px;">
                  <b>${d.ADMIN} (${d.ISO_A2})</b> <br />
                  GDP: <i>${d.GDP_MD_EST}</i> M$<br/>
                  Population: <i>${d.POP_EST}</i>
                </div>
              `)
              .onPolygonHover(hoverD => world
                .polygonAltitude(d => d === hoverD ? 0.06 : 0.02)
                .polygonCapColor(d => d === hoverD ? 'steelblue' : colorScale(getVal(d)))
              ).polygonsTransitionDuration(300);

            world.controls().autoRotate = true;
            world.controls().autoRotateSpeed = 0.5;
            world.controls().enableZoom = false;

            // Stop WebGL rendering while the globe can't be seen (Space theme or scrolled away)
            let globeRunning = true;
            heroSleepers.push(() => {
              const run = heroVisible && !document.body.classList.contains('magic-mode');
              if (run === globeRunning) return;
              globeRunning = run;
              run ? world.resumeAnimation() : world.pauseAnimation();
            });
            syncHeroVisuals();

            const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
            if (isTouchDevice) {
              world.controls().enableRotate = false;
              globeDiv.style.pointerEvents = 'none'; 
            } else {
              let mouseX = 0, mouseY = 0;
              document.addEventListener('mousemove', (event) => {
                mouseX = (event.clientX / window.innerWidth) * 2 - 1;
                mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
              });
              function animateParallax() {
                if (globeRunning) {
                  world.scene().rotation.x += (mouseY * 0.15 - world.scene().rotation.x) * 0.05;
                  world.scene().rotation.z += (mouseX * 0.15 - world.scene().rotation.z) * 0.05;
                }
                requestAnimationFrame(animateParallax);
              }
              animateParallax();
            }
          });
      };
      document.head.appendChild(script);
    }
  }

  if (document.getElementById('hero')) {
    setTimeout(injectVideos, 800);
  }

  function toggleTheme(forceDark) {
    isMagic = forceDark;
    document.body.classList.toggle('magic-mode', isMagic);

    if (isMagic && document.getElementById('hero')) injectVideos();

    btn.innerHTML = `<i data-lucide="wand-2" class="w-5 h-5"></i>`;
    if (window.lucide) lucide.createIcons();

    localStorage.setItem('theme', isMagic ? 'dark' : 'light');

    // Lets the globe, black hole video and face raster react to the theme
    document.dispatchEvent(new CustomEvent('themechange', { detail: { dark: isMagic } }));
  }

  toggleTheme(isMagic);

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleTheme(!isMagic);
  });
}




// === Liquid Glass: cursor-tracked light, scrolled navbar state & scroll progress ===
// The look itself lives in styles.css (section 8); this only feeds it --mx / --my.
function mountLiquidGlass() {
  const LIQUID_SEL = '.card, a.bg-white, button.bg-white, .icon-btn, a.bg-black, button.bg-black, #navbar > div:first-child';

  // Cursor position, relative to every glass surface under the pointer (button + its card, etc.)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let lastEvent = null, frame = 0;
    document.addEventListener('pointermove', (e) => {
      lastEvent = e;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        let el = lastEvent.target instanceof Element ? lastEvent.target.closest(LIQUID_SEL) : null;
        while (el) {
          const r = el.getBoundingClientRect();
          el.style.setProperty('--mx', `${lastEvent.clientX - r.left}px`);
          el.style.setProperty('--my', `${lastEvent.clientY - r.top}px`);
          el = el.parentElement ? el.parentElement.closest(LIQUID_SEL) : null;
        }
      });
    }, { passive: true });
  }

  // Thin reading-progress line + denser navbar glass once the page has scrolled
  const navbar = $('#navbar');
  const bar = document.createElement('div');
  bar.id = 'scrollProgress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
      if (navbar) navbar.classList.toggle('is-scrolled', window.scrollY > 24);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();
}

// === Scroll-driven Face Raster (About photo) ===
// The portrait is rendered as a colour-classified raster, like a DEM or land-cover map.
// Scrolling increases the resolution and the number of classes, then a scan line sweeps the real photo in.
// Geo theme uses viridis (the same ramp as the hero globe); Space theme uses a nebula ramp.
function mountFaceRaster() {
  const wrap = $('#faceRaster');
  if (!wrap || !window.SITE) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const RAMPS = {
    geo:   ['#440154', '#482878', '#3e4989', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725'],
    space: ['#05020a', '#1e0b3a', '#3b0f70', '#6b21a8', '#9333ea', '#c084fc', '#e879f9', '#67e8f9', '#ecfeff']
  };
  // Raster cell sizes in CSS px, stepped coarse → fine so each "resolution upgrade" reads clearly
  const LEVELS = [36, 28, 20, 14, 9, 5, 2];
  const MAX_CELL = LEVELS[0];
  const MIN_CLASSES = 5, MAX_CLASSES = 20;
  const REVEAL_FROM = 0.68;            // scroll progress at which the photo starts sweeping in

  const canvas = document.createElement('canvas');
  canvas.className = 'face-raster-canvas';
  const scan = document.createElement('div');
  scan.className = 'face-raster-scan';
  const hud = document.createElement('div');
  hud.className = 'face-raster-hud';
  hud.innerHTML = '<span class="face-raster-ramp"></span><span class="face-raster-res"></span>';
  [canvas, scan, hud].forEach(el => el.setAttribute('aria-hidden', 'true'));
  const resEl = hud.querySelector('.face-raster-res');

  const ctx = canvas.getContext('2d');
  const tiny = document.createElement('canvas');                 // one pixel per raster cell
  const tctx = tiny.getContext('2d', { willReadFrequently: true });

  let ready = false, inView = false, W = 0, H = 0, lo = 0, hi = 1, lastKey = '';
  const lutCache = {};

  const isSpace = () => document.body.classList.contains('magic-mode');
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const hexToRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

  // Colour table for N classes, sampled evenly along the theme ramp
  function lut(theme, classes) {
    const key = theme + classes;
    if (lutCache[key]) return lutCache[key];
    const stops = RAMPS[theme].map(hexToRgb);
    const out = [];
    for (let k = 0; k < classes; k++) {
      const t = (k / (classes - 1)) * (stops.length - 1);
      const i = Math.min(Math.floor(t), stops.length - 2), f = t - i;
      out.push(stops[i].map((c, j) => Math.round(c + (stops[i + 1][j] - c) * f)));
    }
    return (lutCache[key] = out);
  }

  // Source rectangle matching the <img>'s object-fit: cover crop
  function cropRect() {
    const iw = src.naturalWidth, ih = src.naturalHeight;
    const s = Math.max(W / iw, H / ih);
    const sw = W / s, sh = H / s;
    return [(iw - sw) / 2, (ih - sh) / 2, sw, sh];
  }

  // Contrast-stretch bounds (2nd–98th percentile luminance), measured once
  function calibrate() {
    tiny.width = 48; tiny.height = 48;
    tctx.drawImage(src, 0, 0, 48, 48);
    const d = tctx.getImageData(0, 0, 48, 48).data; // throws if the image is cross-origin tainted
    const lum = [];
    for (let i = 0; i < d.length; i += 4) lum.push((0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255);
    lum.sort((a, b) => a - b);
    lo = lum[Math.floor(lum.length * 0.02)];
    hi = Math.max(lum[Math.floor(lum.length * 0.98)], lo + 0.05);
  }

  function progress() {
    const vh = window.innerHeight;
    if (window.innerWidth >= 768 && wrap.parentElement) {
      // Desktop: the photo is sticky, so measure the About block instead.
      // 0 as it enters, 1 (real photo) about one screen later, while the bio is still being read.
      const g = wrap.parentElement.getBoundingClientRect();
      return clamp01((vh * 0.8 - g.top) / vh);
    }
    const r = wrap.getBoundingClientRect();
    return clamp01((vh - r.top) / (vh * 0.8));
  }

  function render() {
    if (!ready || !W || !H) return;
    const p = progress();
    const e = clamp01(p / REVEAL_FROM);                             // linear over the raster phase
    const level = Math.min(LEVELS.length - 1, Math.floor(e * LEVELS.length));
    const cell = LEVELS[level];
    const classes = Math.round(MIN_CLASSES + (MAX_CLASSES - MIN_CLASSES) * (level / (LEVELS.length - 1)));
    const cols = Math.max(4, Math.round(W / cell));
    const rows = Math.max(4, Math.round(H / cell));
    const theme = isSpace() ? 'space' : 'geo';

    // Only re-classify when the raster actually changes
    const key = `${cols}x${rows}x${classes}${theme}`;
    if (key !== lastKey) {
      lastKey = key;
      tiny.width = cols; tiny.height = rows;
      tctx.drawImage(src, ...cropRect(), 0, 0, cols, rows);
      const img = tctx.getImageData(0, 0, cols, rows);
      const d = img.data, table = lut(theme, classes);
      for (let i = 0; i < d.length; i += 4) {
        const L = clamp01(((0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255 - lo) / (hi - lo));
        const c = table[Math.min(classes - 1, Math.floor(L * classes))];
        d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
      }
      tctx.putImageData(img, 0, 0);

      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(tiny, 0, 0, cols, rows, 0, 0, canvas.width, canvas.height);

      // Faint cell grid while cells are big enough to read as a raster
      if (cell >= 9) {
        const sx = canvas.width / cols, sy = canvas.height / rows;
        ctx.strokeStyle = `rgba(255,255,255,${0.06 + ((cell - 9) / (MAX_CELL - 9)) * 0.16})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 1; x < cols; x++) { ctx.moveTo(Math.round(x * sx) + 0.5, 0); ctx.lineTo(Math.round(x * sx) + 0.5, canvas.height); }
        for (let y = 1; y < rows; y++) { ctx.moveTo(0, Math.round(y * sy) + 0.5); ctx.lineTo(canvas.width, Math.round(y * sy) + 0.5); }
        ctx.stroke();
      }

      resEl.textContent = `${cols} × ${rows}`;
      const ramp = RAMPS[theme];
      hud.style.setProperty('--ramp', `linear-gradient(90deg, ${ramp.join(', ')})`);
    }

    // Photo sweep: clip the raster away from the top, scan line rides the edge
    const reveal = clamp01((p - REVEAL_FROM) / (1 - REVEAL_FROM));
    canvas.style.clipPath = `inset(${(reveal * 100).toFixed(2)}% 0 0 0)`;
    scan.style.transform = `translateY(${reveal * H}px)`;
    scan.style.opacity = reveal > 0 && reveal < 1 ? '1' : '0';
    hud.style.opacity = String(1 - reveal);
  }

  let frame = 0;
  const schedule = () => { if (!frame && inView) frame = requestAnimationFrame(() => { frame = 0; render(); }); };

  function measure() {
    W = wrap.clientWidth; H = wrap.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    lastKey = '';
    render();
  }

  function teardown() {
    [canvas, scan, hud].forEach(el => el.remove());
  }

  // Separate CORS-enabled copy for pixel access; the visible <img> is untouched
  const src = new Image();
  src.crossOrigin = 'anonymous';
  src.decoding = 'async';
  const original = window.SITE.brand.photo;
  src.onload = () => {
    try {
      calibrate();
    } catch (err) {
      // Pixels unreadable (CORS): retry with the original, otherwise just show the normal photo
      if (src.src !== original) src.src = original;
      else teardown();
      return;
    }
    wrap.append(canvas, scan, hud);
    ready = true;
    measure();
  };
  src.onerror = () => {
    if (src.src !== original) src.src = original; // CDN failed: try the original file
    else teardown();
  };
  src.src = getThumb(original, 800);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { inView = en.isIntersecting; if (inView) schedule(); }).observe(wrap);
  } else {
    inView = true;
  }
  if ('ResizeObserver' in window) new ResizeObserver(() => ready && measure()).observe(wrap);
  window.addEventListener('scroll', schedule, { passive: true });
  document.addEventListener('themechange', () => { lastKey = ''; schedule(); });
}

// =====================================================================
// MOTION SYSTEM: 3D hero, tilt cards, magnetic buttons, cursor, drag
// carousels, smooth scroll & scroll choreography. Styles: styles.css §12
// =====================================================================

// Pinned library versions, loaded on demand so every page shares one source of truth
const MOTION_LIBS = {
  gsap: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js',
  scrollTrigger: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js',
  splitText: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/SplitText.min.js',
  lenis: 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js'
};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

// Delegated hover tracking for the closest element matching `sel` (mouse only).
// Works for cards/buttons rendered later from data.js without re-binding.
function trackPointer(sel, { enter, move, leave }) {
  let current = null;
  const set = (el, e) => {
    if (el === current) return;
    if (current && leave) leave(current);
    current = el;
    if (el && enter) enter(el, e);
  };
  document.addEventListener('pointerover', e => {
    if (e.pointerType !== 'mouse') return;
    set(e.target instanceof Element ? e.target.closest(sel) : null, e);
  });
  document.addEventListener('pointermove', e => { if (current && move) move(current, e); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => set(null));
}

// === Hero 3D scene ===
// Geo theme: a flowing DEM wireframe terrain in perspective (black lines, cartographic).
// Space theme: a 3D starfield flying toward the black hole.
// The camera follows the mouse, and the hero text/ticker float on parallax layers above it.
function mountHeroScene() {
  const hero = $('#hero');
  if (!hero) return;

  const reduced = prefersReducedMotion();
  const isMobile = window.innerWidth <= 768;
  const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  const FRAME_MS = (isMobile || lowPower) ? 1000 / 30 : 0;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-scene';
  canvas.setAttribute('aria-hidden', 'true');
  const grid = hero.querySelector('.hero-grid');
  grid ? grid.after(canvas) : hero.prepend(canvas);
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Mouse in -1..1, and an eased camera that chases it
  const mouse = { x: 0, y: 0 }, cam = { x: 0, y: 0 };
  const fine = hasFinePointer();
  if (fine) {
    window.addEventListener('pointermove', e => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  // Parallax layers: [element, px shift on x, px shift on y]
  const layers = [
    [hero.querySelector(':scope > .z-10'), 18, 10],
    [hero.querySelector('.hero-bottom'), 8, 5]
  ].filter(l => l[0]);
  let blackhole = null;

  // --- Geo: DEM wireframe ---
  const GX = isMobile ? 24 : 46, GZ = isMobile ? 14 : 24;
  const Z_NEAR = 1, Z_FAR = 6, X_SPAN = 7, CAM_H = 1.0;
  const pts = new Float32Array(GX * GZ * 2);
  const terrain = (x, z) =>
    0.22 * Math.sin(x * 0.9) * Math.cos(z * 0.8) +
    0.10 * Math.sin(x * 2.3 - z * 1.7) +
    0.04 * Math.cos(x * 5.1 + z * 4.3);

  function drawTerrain(t) {
    const f = H * 0.5, horizon = H * 0.42;
    const flow = t * 0.12; // landscape slowly scrolls toward the viewer
    for (let iz = 0; iz < GZ; iz++) {
      const z = Z_NEAR + (iz / (GZ - 1)) * (Z_FAR - Z_NEAR);
      for (let ix = 0; ix < GX; ix++) {
        const x = ((ix / (GX - 1)) * 2 - 1) * X_SPAN;
        const y = terrain(x, z + flow);
        const k = (iz * GX + ix) * 2;
        pts[k] = W / 2 + ((x - cam.x * 0.6) / z) * f;
        pts[k + 1] = horizon + ((CAM_H + cam.y * 0.15 - y) / z) * f;
      }
    }
    ctx.lineWidth = 1;
    // Rows (contours across the view), far → near, fading with distance
    for (let iz = GZ - 1; iz >= 0; iz--) {
      const near = 1 - iz / (GZ - 1);
      ctx.strokeStyle = `rgba(11,11,11,${(0.03 + near * 0.13).toFixed(3)})`;
      ctx.beginPath();
      for (let ix = 0; ix < GX; ix++) {
        const k = (iz * GX + ix) * 2;
        ix ? ctx.lineTo(pts[k], pts[k + 1]) : ctx.moveTo(pts[k], pts[k + 1]);
      }
      ctx.stroke();
    }
    // Columns (meridians running into the distance), one batched path
    ctx.strokeStyle = 'rgba(11,11,11,0.06)';
    ctx.beginPath();
    for (let ix = 0; ix < GX; ix++) {
      for (let iz = 0; iz < GZ; iz++) {
        const k = (iz * GX + ix) * 2;
        iz ? ctx.lineTo(pts[k], pts[k + 1]) : ctx.moveTo(pts[k], pts[k + 1]);
      }
    }
    ctx.stroke();
  }

  // --- Space: starfield ---
  const STAR_COUNT = isMobile ? 160 : (lowPower ? 260 : 420);
  const DEPTH = 4;
  const STAR_COLORS = ['#ffffff', '#d8b4fe', '#67e8f9'];
  const stars = Array.from({ length: STAR_COUNT }, () => ({
    x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 2,
    z: Math.random() * DEPTH + 0.1,
    c: Math.random() < 0.6 ? 0 : (Math.random() < 0.6 ? 1 : 2)
  }));

  function drawStars(dt) {
    const f = Math.max(W, H) * 0.45;
    const cx = W / 2 - cam.x * W * 0.04, cy = H * 0.62 - cam.y * H * 0.04;
    for (const s of stars) {
      s.z -= 0.004 * dt;
      if (s.z < 0.1) { s.z = DEPTH; s.x = (Math.random() - 0.5) * 3; s.y = (Math.random() - 0.5) * 2; }
    }
    for (let c = 0; c < STAR_COLORS.length; c++) {
      ctx.fillStyle = STAR_COLORS[c];
      for (const s of stars) {
        if (s.c !== c) continue;
        const sx = cx + ((s.x - cam.x * 0.35) / s.z) * f;
        const sy = cy + ((s.y - cam.y * 0.2) / s.z) * f;
        if (sx < -4 || sx > W + 4 || sy < -4 || sy > H + 4) continue;
        const near = 1 - s.z / DEPTH;
        const size = 0.5 + near * 2.2;
        ctx.globalAlpha = Math.min(1, 0.15 + near * 1.1);
        ctx.fillRect(sx, sy, size, size);
      }
    }
    ctx.globalAlpha = 1;
  }

  function frame(t, dt) {
    // Camera eases toward the mouse (or sways gently on touch screens)
    const tx = fine ? mouse.x : Math.sin(t * 0.0002) * 0.35;
    const ty = fine ? mouse.y : Math.cos(t * 0.00015) * 0.2;
    cam.x += (tx - cam.x) * Math.min(0.05 * dt, 1);
    cam.y += (ty - cam.y) * Math.min(0.05 * dt, 1);

    ctx.clearRect(0, 0, W, H);
    if (document.body.classList.contains('magic-mode')) drawStars(dt);
    else drawTerrain(t / 1000);

    if (fine) {
      layers.forEach(([el, dx, dy]) => { el.style.translate = `${(-cam.x * dx).toFixed(2)}px ${(-cam.y * dy).toFixed(2)}px`; });
      blackhole = blackhole || document.getElementById('heroBlackhole');
      if (blackhole) blackhole.style.translate = `${(cam.x * 26).toFixed(2)}px ${(cam.y * 14).toFixed(2)}px`;
    }
  }

  resize();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); if (reduced) frame(0, 0); }, 150);
  });

  if (reduced) {
    frame(0, 0); // a still scene
    document.addEventListener('themechange', () => frame(0, 0));
    return;
  }

  // Only animate while the hero is on screen
  let visible = true, last = performance.now(), raf = 0;
  const loop = now => {
    raf = visible ? requestAnimationFrame(loop) : 0;
    const elapsed = now - last;
    if (elapsed < FRAME_MS) return;
    last = now;
    frame(now, Math.min(elapsed / 16.67, 3));
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); }
    }).observe(hero);
  }
  raf = requestAnimationFrame(loop);
}

// === 3D tilt cards ===
// Each glass card leans toward the cursor. Wide cards tilt less so the edges don't swing too far.
function mountTilt() {
  if (!hasFinePointer() || prefersReducedMotion()) return;
  let target = null, lastE = null, raf = 0;
  const apply = () => {
    raf = 0;
    if (!target || !lastE) return;
    const r = target.getBoundingClientRect();
    const nx = (lastE.clientX - r.left) / r.width - 0.5;
    const ny = (lastE.clientY - r.top) / r.height - 0.5;
    const max = Math.max(2, Math.min(8, 1600 / r.width)); // degrees
    target.style.transform =
      `perspective(1000px) rotateX(${(-ny * max).toFixed(2)}deg) rotateY(${(nx * max).toFixed(2)}deg) translateY(-4px) scale(1.012)`;
  };
  trackPointer('.card', {
    enter: (el, e) => { target = el; lastE = e; el.classList.add('is-tilting'); },
    move: (el, e) => { lastE = e; if (!raf) raf = requestAnimationFrame(apply); },
    leave: el => {
      el.classList.remove('is-tilting');
      el.style.transform = '';
      if (target === el) target = null;
    }
  });
}

// === Magnetic buttons ===
// Key buttons lean toward the cursor and spring back. Uses the `translate` property
// so it never fights the existing hover `transform: scale(...)` rules.
function mountMagnetic() {
  if (!hasFinePointer() || prefersReducedMotion()) return;
  const SEL = '#cvBtn, #emailBtn, #businessBtn, #connectBtn, #magicBtn, #msgBtn, #aboutMailBtn, #homeBrand, .icon-btn, .footer-link';
  const STRENGTH = 0.3;
  const springs = new Map(); // element → { x, y, tx, ty }
  let raf = 0;

  const tick = () => {
    raf = 0;
    let moving = false;
    springs.forEach((s, el) => {
      s.x += (s.tx - s.x) * 0.2;
      s.y += (s.ty - s.y) * 0.2;
      if (Math.abs(s.tx - s.x) < 0.05 && Math.abs(s.ty - s.y) < 0.05) {
        s.x = s.tx; s.y = s.ty;
        if (!s.tx && !s.ty) { el.style.translate = ''; springs.delete(el); return; }
      } else {
        moving = true;
      }
      el.style.translate = `${s.x.toFixed(2)}px ${s.y.toFixed(2)}px`;
    });
    if (moving) raf = requestAnimationFrame(tick);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  trackPointer(SEL, {
    move: (el, e) => {
      const r = el.getBoundingClientRect();
      const s = springs.get(el) || { x: 0, y: 0, tx: 0, ty: 0 };
      s.tx = (e.clientX - (r.left + r.width / 2)) * STRENGTH;
      s.ty = (e.clientY - (r.top + r.height / 2)) * STRENGTH;
      springs.set(el, s);
      kick();
    },
    leave: el => {
      const s = springs.get(el);
      if (s) { s.tx = 0; s.ty = 0; kick(); }
    }
  });
}

// === Reticle cursor ===
// A crosshair that trails the pointer (inverts over black/white in Geo, glows violet in Space)
// and opens up over links and buttons. The normal cursor stays visible.
function mountCursor() {
  if (!hasFinePointer() || prefersReducedMotion()) return;
  const el = document.createElement('div');
  el.className = 'cursor-reticle';
  el.setAttribute('aria-hidden', 'true');
  document.body.appendChild(el);

  let x = -100, y = -100, cx = -100, cy = -100, raf = 0;
  const tick = () => {
    cx += (x - cx) * 0.22;
    cy += (y - cy) * 0.22;
    el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    raf = (Math.abs(x - cx) + Math.abs(y - cy) > 0.1) ? requestAnimationFrame(tick) : 0;
  };
  window.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    el.classList.add('is-visible');
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => el.classList.remove('is-visible'));

  const INTERACTIVE = 'a, button, [role="button"], input, select, textarea, label';
  document.addEventListener('pointerover', e => {
    el.classList.toggle('is-hover', !!(e.target instanceof Element && e.target.closest(INTERACTIVE)));
  });
  window.addEventListener('pointerdown', () => el.classList.add('is-down'));
  window.addEventListener('pointerup', () => el.classList.remove('is-down'));
}

// === Drag-to-scroll carousels (desktop mouse) ===
// Clicks still work; a drag of more than a few pixels cancels the click that follows it.
function mountDragScroll() {
  if (!hasFinePointer()) return;
  $all('#projectTrackOuter, #blogTrackOuter, #mediaTrackOuter').forEach(track => {
    let down = false, moved = false, startX = 0, startScroll = 0;
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false;
      startX = e.clientX; startScroll = track.scrollLeft;
    });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = startScroll - dx;
    }, { passive: true });
    window.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      track.classList.remove('is-dragging'); // scroll-snap settles the cards again
    });
    track.addEventListener('click', e => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
    track.addEventListener('dragstart', e => e.preventDefault());
  });
}

// === Scroll choreography (GSAP + ScrollTrigger + SplitText) & smooth scroll (Lenis) ===
async function mountMotion() {
  if (prefersReducedMotion()) return;

  await Promise.allSettled([loadScript(MOTION_LIBS.gsap), loadScript(MOTION_LIBS.lenis)]);
  if (!window.gsap) return; // CDN unavailable: the CSS/IntersectionObserver effects still run
  await Promise.allSettled([loadScript(MOTION_LIBS.scrollTrigger), loadScript(MOTION_LIBS.splitText)]);
  if (!window.ScrollTrigger) return;
  const hasSplit = !!window.SplitText;
  gsap.registerPlugin(ScrollTrigger, ...(hasSplit ? [SplitText] : []));

  // Smooth, weighted wheel scrolling on desktop (touch keeps native scrolling)
  if (window.Lenis && hasFinePointer()) {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Hero intro: letters of the name flip up in 3D after the loading screen.
  // Skipped if the libraries arrived late, so a visible hero never blinks out.
  const heroName = $('#heroName');
  if (heroName && hasSplit && performance.now() < 3500) {
    const split = SplitText.create(heroName, { type: 'chars', charsClass: 'char' });
    // Buttons/cards have CSS transform transitions that would smear GSAP's per-frame updates
    const pauseCss = targets => targets.forEach(el => { el.style.transition = 'none'; });
    const resumeCss = targets => targets.forEach(el => { el.style.transition = ''; });
    const cssSafe = { onStart() { pauseCss(this.targets()); }, onComplete() { resumeCss(this.targets()); } };
    const tl = gsap.timeline({ delay: Math.max(0, 1.1 - performance.now() / 1000) });
    tl.from(split.chars, {
      yPercent: 90, rotateX: -85, opacity: 0, transformPerspective: 600,
      duration: 1.1, ease: 'expo.out', stagger: 0.028
    })
      .from('#heroSubtitle', { y: 18, opacity: 0, duration: 0.9, ease: 'expo.out' }, '-=0.8')
      .from('#hero .mt-8 > *', { ...cssSafe, y: 16, opacity: 0, scale: 0.9, duration: 0.8, ease: 'back.out(2)', stagger: 0.08, clearProps: 'transform,opacity' }, '-=0.7')
      .from('#ticker', { opacity: 0, duration: 1 }, '-=0.6')
      .from('#aboutCounters > *', { ...cssSafe, y: 30, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08, clearProps: 'transform,opacity' }, '-=0.8');
  }

  // Hero content drifts up and fades as you scroll into the page
  const heroContent = $('#hero > .z-10');
  if (heroContent) {
    gsap.to(heroContent, {
      yPercent: -40, opacity: 0.1, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  // Featured slideshow: images glide inside their frame (depth parallax)
  const slideImgs = $all('#slides img');
  if (slideImgs.length) {
    gsap.fromTo(slideImgs, { yPercent: -6, scale: 1.14 }, {
      yPercent: 6, scale: 1.14, ease: 'none',
      scrollTrigger: { trigger: '#slideshow', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  // Section titles: letters rise in 3D, then the contour line draws underneath
  if (hasSplit) {
    $all('.section-title').forEach(h => {
      h.classList.remove('reveal', 'is-visible'); // GSAP takes over from the CSS reveal
      const split = SplitText.create(h, { type: 'words,chars' });
      gsap.from(split.chars, {
        yPercent: 70, rotateX: -80, opacity: 0, transformPerspective: 500,
        duration: 0.9, ease: 'expo.out', stagger: 0.016,
        scrollTrigger: { trigger: h, start: 'top 88%', once: true, onEnter: () => h.classList.add('is-in') }
      });
    });
  }

  // Positions shift once images and fonts finish loading
  window.addEventListener('load', () => ScrollTrigger.refresh());
}

// === Scroll Reveal: headings & cards rise in as they enter the viewport ===
function mountReveal() {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-visible');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });

  // Every page/section heading gets the same editorial title style and entrance
  // (+ contour line, see styles.css §12). Headings inside cards move with their card.
  const isOwnHeading = h => !h.closest('#hero, .card, nav, footer, #navbar');
  $all('main h1, section h2, section h3').filter(isOwnHeading)
    .forEach(h => h.classList.add('section-title'));

  $all('.section-title, .card, #faceRaster').forEach(el => {
    if (el.closest('#hero')) return; // the hero is already on screen behind the loader
    // Small stagger between siblings (e.g. cards in a grid)
    const idx = el.parentElement ? [...el.parentElement.children].indexOf(el) : 0;
    el.style.setProperty('--rv-delay', `${Math.min(idx, 5) * 60}ms`);
    el.classList.add('reveal');
    io.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  mountAllEmails();
  mountNavigation();
  applyNav();
  initDefaultParticles();

  if ($('#loadingScreen')) mountLoading();
  if ($('#heroName')) { 
    mountHero(); 
    mountSlideshow(); 
  }
  if ($('#about')) mountAbout();
  if ($('#projects')) mountProjectsCarousel();
  if ($('#expList')) mountExperience();
  if ($('#pubRecent')) mountPublications();
  if ($('#achvPreview')) mountAchvPreview();
  if ($('#footerLinks')) mountFooter();
  if ($('#servicesList')) mountServices(); 
  if ($('#blogTrack')) mountBlogCarousel();
  if ($('#mediaTrack')) mountMediaCarousel(); 
  if ($('#blogList')) mountBlogsPage();
  if ($('#magicBtn')) mountMagicMode();
  if ($('#faceRaster')) mountFaceRaster();
  mountLiquidGlass();
  mountHeroScene();
  mountTilt();
  mountMagnetic();
  mountCursor();
  mountDragScroll();

  if (window.lucide) lucide.createIcons();

  // After every page's own content has rendered (subpages render in their own DOMContentLoaded handlers)
  setTimeout(() => {
    mountReveal();
    mountMotion();
  }, 0);
});
