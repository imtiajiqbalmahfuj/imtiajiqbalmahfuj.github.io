// Helper to compress images on the fly (makes site load instantly)
function getThumb(url, width = 600) {
  if (!url) return "";
  if (url.includes('.svg')) return url; 
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=80&output=webp`;
}

// Shared helpers
function $(sel, scope=document){ return scope.querySelector(sel) }
function $all(sel, scope=document){ return [...scope.querySelectorAll(sel)] }

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
        window.scrollTo({top:0, behavior:'smooth'});
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
    window.scrollTo({ top: y, behavior: 'smooth' });
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
      { id: 'fellowships', label: 'Fellowships & Research Grants', data: achvs.fellowships },
      { id: 'awards', label: 'Awards, Honors & Memberships', data: achvs.awards },
      { id: 'volunteer', label: 'Leadership & Volunteering', data: achvs.volunteering },
      { id: 'licenses', label: 'License & Certifications', data: achvs.licenses },
      { id: 'workshops', label: 'Workshops & Presentations', data: achvs.workshops },
      { id: 'prof_services', label: 'Professional Services', data: achvs.prof_services }
    ].filter(x => x.data && x.data.length > 0);

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
      <a href="${basePath}#about" class="nav-item-link text-slate-700 py-2 px-3">About</a>
      <a href="${basePath}#projects" class="nav-item-link text-slate-700 py-2 px-3">Projects</a>
    `;
    
    // Inject HTML
    navCenter.innerHTML = staticLinks + 
      makeDesktopDropdown('#experience', 'Experiences', expLinks) +
      makeDesktopDropdown('#publications', 'Publications', pubLinks) +
      makeDesktopDropdown('#achievements', 'Professional Highlights', achvLinks, true);

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
      mobileMenuGrid.innerHTML = staticLinks.replace(/nav-item-link text-slate-700 py-2 px-3/g, "hover-underline font-medium text-slate-700") + 
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
    const innerWidth = track.querySelector('.ticker-inner').scrollWidth;
    let pos = 0;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const speed = isMobile ? 0.5 : 0.8;  
    function animateTicker() {
      pos -= speed;
      if(pos <= -innerWidth) pos = 0;
      track.style.transform = `translateX(${pos}px)`;
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
  if(photoEl) photoEl.src = photo;
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
    "Conference proceedings": "users",
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
    {id:'fellowships', title:'Fellowships & Research Grants', list: A.fellowships, icon:'graduation-cap'},
    {id:'awards', title:'Awards, Honors & Professional Memberships', list: A.awards, icon:'award'},
    {id:'volunteer', title:'Leadership & Volunteering Experience', list: A.volunteering, icon:'users'},
    {id:'licenses', title:'License & Certifications', list: A.licenses, icon:'shield-check'},
    {id:'workshops', title:'Workshops & Presentations', list: A.workshops, icon:'presentation'},
    {id:'prof_services', title:'Professional Services', list: A.prof_services, icon:'briefcase'}
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

// Particle Engine OPTIMIZED (90% faster)
function initDefaultParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'magicCanvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];
  let mouse = { x: null, y: null, radius: 120 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.8;
      this.speedY = (Math.random() - 0.5) * 0.8;
      this.color = Math.random() > 0.5 ? '#00ffff' : '#ff00ff';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
      if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
      // Start inner loop at 'a + 1' to cut checks in half and stop checking a particle against itself
      for (let b = a + 1; b < particles.length; b++) { 
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        
        // Fast spatial bounding box check to skip heavy Math.sqrt calculation
        if (Math.abs(dx) < 100 && Math.abs(dy) < 100) {
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            ctx.strokeStyle = `rgba(0, 255, 255, ${1 - distance / 100})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      if (mouse.x && mouse.y) {
        let mx = particles[a].x - mouse.x;
        let my = particles[a].y - mouse.y;
        if (Math.abs(mx) < mouse.radius && Math.abs(my) < mouse.radius) {
          let mDistance = Math.sqrt(mx * mx + my * my);
          if (mDistance < mouse.radius) {
            ctx.strokeStyle = `rgba(255, 0, 255, ${1 - mDistance / mouse.radius})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    connectParticles();
    requestAnimationFrame(animate);
  }

  // Capped at max 50 particles to avoid locking up CPU
  let particleCount = Math.min((canvas.width * canvas.height) / 25000, 50);
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// === Dark Purple Glassmorphism, Video Injection & Theme Configuration ===
function mountMagicMode() {
  const btn = $('#magicBtn');
  if (!btn) return;

  const DEFAULT_DARK_MODE = false; 
  const params = new URLSearchParams(window.location.search);
  let initialThemeIsDark = DEFAULT_DARK_MODE;
  if (params.has('theme')) {
    initialThemeIsDark = params.get('theme') === 'dark';
  }
  
  let isMagic = false;

  function injectVideos() {
    const hero = document.getElementById('hero');
    if (!hero) return;

    // 1. Black Hole Video (For Dark Theme)
    if (!document.getElementById('heroBlackhole')) {
      const heroVid = document.createElement('video');
      heroVid.id = 'heroBlackhole';
      heroVid.className = 'blackhole-video hero-blackhole';
      heroVid.src = 'https://raw.githubusercontent.com/sanidhyy/space-portfolio/main/public/videos/blackhole.webm';
      heroVid.autoplay = true; heroVid.loop = true; heroVid.muted = true; heroVid.playsInline = true;
      hero.appendChild(heroVid);
    }

    // 2. Interactive GDP Choropleth Globe (For White Theme)
    if (!document.getElementById('heroGlobe')) {
      const globeDiv = document.createElement('div');
      globeDiv.id = 'heroGlobe';
      globeDiv.className = 'earth-3d'; 
      hero.appendChild(globeDiv);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/globe.gl';
      script.async = true; // explicitly make non-blocking
      script.defer = true;
      script.onload = async () => {
        const { scaleSequentialSqrt } = await import('https://esm.sh/d3-scale');
        const { interpolateYlOrRd } = await import('https://esm.sh/d3-scale-chromatic');
        const colorScale = scaleSequentialSqrt(interpolateYlOrRd);
        const getVal = feat => feat.properties.GDP_MD_EST / Math.max(1e5, feat.properties.POP_EST);

        fetch('https://unpkg.com/globe.gl/example/datasets/ne_110m_admin_0_countries.geojson')
          .then(res => res.json())
          .then(countries => {
            const maxVal = Math.max(...countries.features.map(getVal));
            colorScale.domain([0, maxVal]);

            const world = Globe()(globeDiv)
              .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
              .backgroundColor('rgba(0,0,0,0)')
              .width(1300)
              .height(1300)
              .lineHoverPrecision(0)
              .polygonsData(countries.features.filter(d => d.properties.ISO_A2 !== 'AQ'))
              .polygonAltitude(0.06)
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
                .polygonAltitude(d => d === hoverD ? 0.12 : 0.06)
                .polygonCapColor(d => d === hoverD ? 'steelblue' : colorScale(getVal(d)))
              )
              .polygonsTransitionDuration(300);

            world.controls().autoRotate = true;
            world.controls().autoRotateSpeed = 0.5;
            world.controls().enableZoom = false; 

            const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
            if (isTouchDevice) {
              world.controls().enableRotate = false;
            }

            if (!isTouchDevice) {
              let mouseX = 0, mouseY = 0;
              document.addEventListener('mousemove', (event) => {
                mouseX = (event.clientX / window.innerWidth) * 2 - 1;
                mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
              });
              function animateParallax() {
                world.scene().rotation.x += (mouseY * 0.15 - world.scene().rotation.x) * 0.05;
                world.scene().rotation.z += (mouseX * 0.15 - world.scene().rotation.z) * 0.05;
                requestAnimationFrame(animateParallax);
              }
              animateParallax();
            }
          });
      };
      document.head.appendChild(script);
    }
  }

  // ==> DEFERRED INJECTION: Wait for 800ms so initial DOM loads instantly <==
  setTimeout(injectVideos, 800);

  if (initialThemeIsDark) {
    toggleTheme(true);
  }

  function toggleTheme(forceDark) {
    isMagic = forceDark;
    document.body.classList.toggle('magic-mode', isMagic);

    // If toggled before the 800ms timer runs, inject immediately
    if (isMagic) injectVideos();

    btn.innerHTML = `<i data-lucide="wand-2" class="w-5 h-5"></i>`;
    if (window.lucide) lucide.createIcons();

    const newUrl = new URL(window.location);
    if (isMagic) {
      newUrl.searchParams.set('theme', 'dark');
    } else {
      newUrl.searchParams.delete('theme');
    }
    window.history.replaceState({}, '', newUrl);
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleTheme(!isMagic);
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

  if (window.lucide) lucide.createIcons();
});
