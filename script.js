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
  const navCenter = $('#navCenter')
  const connectBtn = $('#connectBtn')
  const homeBrand = $('#homeBrand')
  const mmBtn = $('#menuBtn')
  const mobileMenu = $('#mobileMenu')

  // Brand click
  if(homeBrand){
    homeBrand.addEventListener('click', e=>{
      const isHome = window.location.pathname.endsWith("index.html") || window.location.pathname === "/" 
      if(isHome){
        e.preventDefault()
        window.scrollTo({top:0, behavior:'smooth'})
      }
    })
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

  // === THE RESPONSIVE FIX ===
  // Helper function to calculate exact scroll position for both Mobile & Desktop
  const scrollToElement = (el) => {
    let targetEl = el;
    
    // If it's a main section, scroll to its heading to ignore huge padding spaces
    if (el.tagName.toLowerCase() === 'section' || el.tagName.toLowerCase() === 'main') {
      const heading = el.querySelector('h1, h2, h3');
      if (heading) targetEl = heading;
    }

    // Dynamic offset: Tighter on mobile, spacious on desktop
    const isMobile = window.innerWidth < 768;
    const offset = isMobile ? 55 : 85; 

    const y = targetEl.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  // Connect Button
  if(connectBtn){
    connectBtn.addEventListener('click', (e)=> {
      e.preventDefault();
      const contactSec = document.getElementById('contact'); 
      if(contactSec) {
        scrollToElement(contactSec);
      } else {
        window.location.href = "index.html#contact";
      }
    })
  }

  // Smooth scroll for anchors with smart OFFSET
  $all('a[href*="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const url = new URL(a.href, window.location.href);
      if (url.pathname === window.location.pathname && url.hash.length > 1) {
        const el = $(url.hash);
        if (el) {
          e.preventDefault();
          scrollToElement(el);
          
          // Close mobile menu if open
          if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
             mobileMenu.classList.add('hidden');
          }
        }
      }
    });
  });

  // Mobile menu toggle
  if(mmBtn && mobileMenu){
    mmBtn.addEventListener('click', ()=> mobileMenu.classList.toggle('hidden'))
  }

  // FIX FOR CROSS-PAGE ANCHOR LINKS (e.g. clicking from subpage back to index)
  if (window.location.hash) {
    setTimeout(() => {
      const el = $(window.location.hash);
      if (el) {
        scrollToElement(el);
      }
    }, 150); // Small delay ensures the page is fully rendered before scrolling
  }
}

function mountHero(){
  if (!window.SITE) return;
  const {name, subtitle, cvDownload} = window.SITE.brand
  const nameEl = $('#heroName');
  if(nameEl) nameEl.textContent = name
  const subEl = $('#heroSubtitle');
  if(subEl) subEl.textContent = subtitle

  // CV Button
  const cvBtn = $('#cvBtn')
  if(cvBtn) {
    cvBtn.href = cvDownload
    cvBtn.setAttribute('download','Imtiaj-Iqbal-Mahfuj-CV.pdf')
  }

  // Link Button -> Scroll to Blogs
  const linkBtn = $('#linkBtn')
  if(linkBtn){
    linkBtn.addEventListener('click', ()=> {
      const el = document.getElementById('blogs')
      if(el){ el.scrollIntoView({behavior:'smooth'}) }
    })
  }

  // Ticker
  const track = $('#tickerTrack')
  if(track) {
    const itemsHTML = window.SITE.tickerIcons.map(it=> `<span class="inline-flex items-center gap-2 mr-8 text-sm text-slate-600">
      <i data-lucide="${it.icon}"></i>${it.name}
    </span>`).join('')
    track.innerHTML = `<div class="ticker-inner">${itemsHTML}</div><div class="ticker-inner">${itemsHTML}</div>`
    const innerWidth = track.querySelector('.ticker-inner').scrollWidth
    let pos = 0
    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    const speed = isMobile ? 0.5 : 0.8  
    function animateTicker() {
      pos -= speed
      if(pos <= -innerWidth) pos = 0
      track.style.transform = `translateX(${pos}px)`
      requestAnimationFrame(animateTicker)
    }
    requestAnimationFrame(animateTicker)
  }

  // Down button
  const downBtn = $('#downBtn')
  if(downBtn){
    downBtn.addEventListener('click', ()=> {
      const el = document.getElementById('featured')
      if(el){
        const offset = el.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({top: offset, behavior:'smooth'})
      }
    })
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
  const {photo} = window.SITE.brand
  const photoEl = $('#aboutPhoto')
  if(photoEl) photoEl.src = photo
  const bioEl = $('#aboutBio')
  if(bioEl) bioEl.innerHTML = window.SITE.about.bio
  const msgBtn = $('#msgBtn')
  if(msgBtn) msgBtn.addEventListener('click', ()=> window.open(window.SITE.brand.linkedin,'_blank'))

  // Education
  const edu = window.SITE.education
  const list = $('#eduList')
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
    `).join('')
  }
  
  // Research Interests
  const researchWrap = $('#research')
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
      </div>`
  }
  
  // Skills
  const skillsWrap = $('#skills')
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
      </div>`).join("")
  }

  // Counters
  const counterWrap = $('#aboutCounters')
  if (counterWrap) {
    counterWrap.innerHTML = window.SITE.counters.map(c => `
      <div class="card p-6 bg-white rounded-xl border border-slate-200 text-center">
        <div class="text-3xl font-bold text-black count-up" data-target="${c.value}">0</div>
        <div class="mt-2 text-slate-600">${c.label}</div>
      </div>
    `).join("")
    initCounters() 
  }
}

function initCounters(){
  const counters = document.querySelectorAll('.count-up')
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target')
    let count = 0
    const step = Math.ceil(target / 100)
    const update = () => {
      count += step
      if (count >= target) {
        counter.textContent = target + "+"
      } else {
        counter.textContent = count
        requestAnimationFrame(update)
      }
    }
    update()
  })
}

function mountProjectsCarousel() {
  const wrap = $('#projectCarousel')
  if (!wrap) return
  const items = (window.SITE.projects || []).filter(p => p.image)
  const uniqueTags = [...new Set(items.flatMap(p => p.tags))]
  const tagOrder = ["Portfolio", "GIS", "Geospatial Python", "GEE", "ML", "Remote Sensing", "URP", "GeoViz", "Operations Research", "Others"]
  const tags = [
    ...tagOrder.filter(t => uniqueTags.includes(t)),
    ...uniqueTags.filter(t => !tagOrder.includes(t)).sort()
  ]
  const tagWrap = $('#projectTags')
  tagWrap.innerHTML = ''; 
  tagWrap.insertAdjacentHTML('beforeend', `<button data-tag="ALL" class="filter-btn px-3 py-1.5 bg-black text-white border border-slate-200 rounded-xl hover:bg-black hover:text-white hover-smart">All</button>`)
  tags.forEach(t => tagWrap.insertAdjacentHTML('beforeend', `<button data-tag="${t}" class="filter-btn px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-black hover:text-white hover-smart">${t}</button>`))
  let filtered = items.slice()
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
    `).join('')
    lucide.createIcons()
  }
  render()
  tagWrap.addEventListener('click', e => {
    const b = e.target.closest('button[data-tag]')
    if (!b) return
    const t = b.dataset.tag
    filtered = (t === "ALL") ? items.slice() : items.filter(p => (p.tags || []).includes(t))
    render()
    tagWrap.querySelectorAll('button[data-tag]').forEach(btn => {
      btn.classList.remove('bg-black', 'text-white')
      btn.classList.add('bg-white')
    })
    b.classList.remove('bg-white')
    b.classList.add('bg-black', 'text-white')
  })
  const track = $('#projectTrackOuter')
  const prev = $('#projPrev')
  const next = $('#projNext')
  if(prev) prev.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }))
  if(next) next.addEventListener('click', () => track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }))
}


// === Updated Experience with Conditional Buttons (Preserved Style) ===
function mountExperience(){
  const list = $('#expList')
  if(!list) return
  
  const isHome = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
  const E = window.SITE.experiences;
  if (!E) return;

  // UPDATED: Changed IDs to 'exp-professional' and 'exp-research'
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
  }).join('')

  if(window.lucide) lucide.createIcons()
}



// === Updated Publications with Subsections and See All Buttons ===
function mountPublications() {
  const rec = $('#pubRecent');
  if(!rec) return;

  const isHome = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
  const P = window.SITE.publications;
  if (!P) return;

  const order = P.ordering || [];
  const items = P.items || [];

  // Group items by type
  const grouped = {};
  items.forEach(item => {
    if (!grouped[item.type]) grouped[item.type] = [];
    grouped[item.type].push(item);
  });

  // Ensure types not in 'ordering' are still rendered at the end
  const typesToRender = [...order];
  Object.keys(grouped).forEach(t => {
    if (!typesToRender.includes(t)) typesToRender.push(t);
  });

  // Map icons for "See all" buttons
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

    // If on homepage, limit to 3 items per subsection (similar to professional highlights)
    if (isHome) {
      groupItems = groupItems.slice(0, 6);
    }

    // If subsection data is missing, don't render it
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



// === (5 Sections + Preserved Style + See More Button) ===
function mountAchvPreview(){
  const wrap = $('#achvPreview')
  if(!wrap) return
  const A = window.SITE.achievements
  if(!A) return

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

    // UPDATED: Added id="${sec.id}" to this wrapper div
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
  }).join('')

  if(window.lucide) lucide.createIcons()
}


function mountServices() {
  const wrap = document.querySelector("#servicesList");
  if (!wrap) return;
  wrap.innerHTML = window.SITE.services.map(s => `
    <div class="p-6 bg-white border border-slate-200 rounded-xl text-center hover:[transform:scale(1.03)] transition-transform duration-200 hover:shadow-lg hover-smart">
      <i data-lucide="${s.icon}" class="mx-auto mb-3"></i>
      <h4 class="font-semibold text-lg">${s.title}</h4>
      <p class="text-sm text-gray-600 mt-2">${s.description}</p>
    </div>
  `).join("");
  lucide.createIcons();
}

function mountFooter(){
  const zone = $('#footerLinks')
  if(!zone) return
  zone.innerHTML = window.SITE.socials.map(s=>`
    <a class="footer-link hover:bg-white hover:text-black hover-smart" href="${s.href}" target="_blank">
      <i data-lucide="${s.icon}"></i><span>${s.label}</span>
    </a>
  `).join('')
  const y = $('#year');
  if(y) y.textContent = new Date().getFullYear()
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


// === Dynamically Build Navigation & Dropdowns ===
function mountNavigation() {
  try {
    const navCenter = $('#navCenter');
    const mobileMenu = $('#mobileMenu');
    if (!navCenter || !window.SITE) return; 

    const isHome = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
    const basePath = isHome ? "" : "index.html";

    // 1. Safely extract experiences (UPDATED IDs to prevent collision)
    const exps = window.SITE.experiences || {};
    const expLinks = [
      { id: 'exp-professional', label: 'Professional Experience', data: exps.professional },
      { id: 'exp-research', label: 'Research Experience', data: exps.research },
      { id: 'exp-teach', label: 'Teaching Experience', data: exps.teach }
    ].filter(x => x.data && x.data.length > 0);

    // 2. Safely extract publications
    const pubsItems = (window.SITE.publications && window.SITE.publications.items) || [];
    const pubsOrder = (window.SITE.publications && window.SITE.publications.ordering) || [];
    const pubCounts = {};
    pubsItems.forEach(p => { if(p.type) pubCounts[p.type] = (pubCounts[p.type] || 0) + 1; });
    const pubLinks = pubsOrder.filter(type => pubCounts[type] > 0).map(type => ({
      id: type.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label: type
    }));

    // 3. Safely extract achievements
    const achvs = window.SITE.achievements || {};
    const achvLinks = [
      { id: 'fellowships', label: 'Fellowships & Research Grants', data: achvs.fellowships },
      { id: 'awards', label: 'Awards, Honors & Memberships', data: achvs.awards },
      { id: 'volunteer', label: 'Leadership & Volunteering', data: achvs.volunteering },
      { id: 'licenses', label: 'License & Certifications', data: achvs.licenses },
      { id: 'workshops', label: 'Workshops & Presentations', data: achvs.workshops },
      { id: 'prof_services', label: 'Professional Services', data: achvs.prof_services }
    ].filter(x => x.data && x.data.length > 0);

    // UPDATED Desktop Dropdown Builder (Solid color + hover-underline)
    const makeDesktopDropdown = (href, label, links, alignRight = false) => {
      if (links.length === 0) return `<a href="${basePath}${href}" class="hover-underline text-slate-700 py-4">${label}</a>`;
      const alignClass = alignRight ? "right-0 md:left-auto" : "left-0";
      return `
        <div class="relative group flex items-center h-full">
          <a href="${basePath}${href}" class="hover-underline text-slate-700 py-4 inline-block">${label}</a>
          <div class="absolute ${alignClass} top-full mt-0 hidden group-hover:flex flex-col bg-white border border-slate-200 shadow-xl rounded-2xl p-5 min-w-[260px] z-50 gap-4">
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
      <a href="${basePath}#about" class="hover-underline text-slate-700 py-4">About</a>
      <a href="${basePath}#projects" class="hover-underline text-slate-700 py-4">Projects</a>
    `;
    
    navCenter.innerHTML = staticLinks + 
      makeDesktopDropdown('#experience', 'Experiences', expLinks) +
      makeDesktopDropdown('#publications', 'Publications', pubLinks) +
      makeDesktopDropdown('#achievements', 'Professional Highlights', achvLinks, true);

    if (mobileMenu) {
      let mobileMenuGrid = mobileMenu.querySelector('div');
      if (!mobileMenuGrid) {
        mobileMenu.innerHTML = '<div class="max-w-6xl mx-auto px-4 py-5 grid gap-5"></div>';
        mobileMenuGrid = mobileMenu.querySelector('div');
      }
      mobileMenuGrid.innerHTML = staticLinks.replace(/text-slate-700 py-4/g, "font-medium text-slate-700") + 
        makeMobileDropdown('#experience', 'Experiences', expLinks) +
        makeMobileDropdown('#publications', 'Publications', pubLinks) +
        makeMobileDropdown('#achievements', 'Professional Highlights', achvLinks);
    }
  } catch(e) {
    console.error("Navigation build error:", e);
  }
}


function mountLoading(){
  const screen = $('#loadingScreen')
  if(!screen) return
  let cameFromSameSite = false
  try {
    if (document.referrer) {
      const ref = new URL(document.referrer)
      cameFromSameSite = ref.origin === location.origin
    }
  } catch(e){ cameFromSameSite = false }
  if(cameFromSameSite){
    screen.style.display = 'none'
    return
  }
  const hide = () => {
    screen.style.transition = "opacity 0.5s ease"
    screen.style.opacity = '0'
    setTimeout(()=> screen.style.display='none', 500)
  }
  window.addEventListener('load', hide) 
  setTimeout(hide, 1500) 
}




// === Modern AI Lab Magic Mode — animated voxel-cube "IM" sculpture (Three.js) ===
// Two shapes, matching the reference render:
//   "I" = a vertical dumbbell (two round lobes joined by a thin neck)
//   "M" = an arch/bridge of three lobes (left-top-right), like two dumbbells sharing a peak
// Both are built as fields of small cubes sampled off a smooth revolved/tube surface,
// then kept in constant gentle motion and pushed/lit up wherever the mouse gets close.
function mountMagicMode() {
  const btn = $('#magicBtn');
  if (!btn || typeof THREE === 'undefined') return;

  let isMagic = false;
  let renderer, scene, camera, group, voxels;
  let animId, resizeTimeout;
  let clockStart = 0;

  // Per-cube data we track ourselves (InstancedMesh doesn't store this for us)
  let basePositions = [];  // THREE.Vector3 — resting spot in the sculpture
  let baseNormals = [];    // THREE.Vector3 — outward direction, used for shimmer + push
  let phases = [];         // float — per-cube animation offset so motion isn't uniform
  const baseColor = new THREE.Color(0xe9ecee);
  const glowColor = new THREE.Color(0x1fd6d6);
  const tmpColor = new THREE.Color();
  const tmpMatrix = new THREE.Matrix4();
  const tmpPos = new THREE.Vector3();
  const tmpQuat = new THREE.Quaternion();
  const tmpScale = new THREE.Vector3();
  const tmpVec = new THREE.Vector3();

  // Mouse, tracked in normalized (-1..1) and raw pixel form
  let mouse = { nx: 0, ny: 0, px: -9999, py: -9999, active: false };
  window.addEventListener('mousemove', (e) => {
    mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ny = (e.clientY / window.innerHeight) * 2 - 1;
    mouse.px = e.clientX; mouse.py = e.clientY;
    mouse.active = true;
  });
  window.addEventListener('mouseleave', () => { mouse.active = false; });
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      const t = e.touches[0];
      mouse.nx = (t.clientX / window.innerWidth) * 2 - 1;
      mouse.ny = (t.clientY / window.innerHeight) * 2 - 1;
      mouse.px = t.clientX; mouse.py = t.clientY;
      mouse.active = true;
    }
  }, { passive: true });

  // Radius of a sphere of radius R centered at c, at position x along one axis (0 outside)
  function sphereRadius(x, c, R) {
    const d = x - c, v = R * R - d * d;
    return v > 0 ? Math.sqrt(v) : 0;
  }

  // ---- Shape 1: "I" — vertical dumbbell, built as a lathe (revolve around Y) ----
  function buildDumbbellProfile() {
    const H = 1.05, LOBE_C = 0.62, LOBE_R = 0.42, NECK = 0.12, STEPS = 44;
    const pts = [];
    for (let i = 0; i <= STEPS; i++) {
      const h = -H + (2 * H) * (i / STEPS);
      const r = Math.max(NECK, sphereRadius(h, -LOBE_C, LOBE_R), sphereRadius(h, LOBE_C, LOBE_R));
      pts.push(new THREE.Vector2(Math.max(r, 0.01), h));
    }
    return pts;
  }

  function sampleDumbbellVoxels(offsetX) {
    const geo = new THREE.LatheGeometry(buildDumbbellProfile(), 14);
    geo.computeVertexNormals();
    const pos = geo.attributes.position, nor = geo.attributes.normal;
    for (let i = 0; i < pos.count; i++) {
      basePositions.push(new THREE.Vector3(pos.getX(i) + offsetX, pos.getY(i), pos.getZ(i)));
      baseNormals.push(new THREE.Vector3(nor.getX(i), nor.getY(i), nor.getZ(i)));
      phases.push(Math.random() * Math.PI * 2);
    }
    geo.dispose();
  }

  // ---- Shape 2: "M" — arch of 3 lobes along a curved path (not axis-symmetric, so we
  // hand-build rings of vertices around a Catmull-Rom curve instead of using Lathe) ----
  function sampleArchVoxels(offsetX) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.15, -0.82, 0),
      new THREE.Vector3(-0.70, 0.10, 0),
      new THREE.Vector3(0.00, 0.80, 0),
      new THREE.Vector3(0.70, 0.10, 0),
      new THREE.Vector3(1.15, -0.82, 0),
    ]);
    const archLen = curve.getLength();
    const NECK = 0.11, LOBE_R = 0.40, STEPS = 70, RADIAL = 12;
    const forward = new THREE.Vector3(), sideways = new THREE.Vector3(), up = new THREE.Vector3(0, 0, 1);

    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      const s = t * archLen;
      const r = Math.max(
        NECK,
        sphereRadius(s, 0, LOBE_R),
        sphereRadius(s, archLen / 2, LOBE_R),
        sphereRadius(s, archLen, LOBE_R)
      );
      const center = curve.getPointAt(t);
      forward.copy(curve.getTangentAt(t)).normalize();
      sideways.crossVectors(forward, up).normalize();
      const outOfPlane = new THREE.Vector3().crossVectors(forward, sideways).normalize();

      for (let j = 0; j < RADIAL; j++) {
        const a = (j / RADIAL) * Math.PI * 2;
        const nx = Math.cos(a), ny = Math.sin(a);
        tmpVec.set(0, 0, 0)
          .addScaledVector(sideways, nx)
          .addScaledVector(outOfPlane, ny);
        const normal = tmpVec.clone().normalize();
        const p = new THREE.Vector3(center.x + offsetX, center.y, center.z).addScaledVector(tmpVec, r);
        basePositions.push(p);
        baseNormals.push(normal);
        phases.push(Math.random() * Math.PI * 2);
      }
    }
  }

  function buildScene() {
    basePositions = []; baseNormals = []; phases = [];
    sampleDumbbellVoxels(-1.55);  // "I"
    sampleArchVoxels(0.55);       // "M"

    const count = basePositions.length;
    const cubeSize = 0.045;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff, vertexColors: true, roughness: 0.82, metalness: 0.12,
    });
    voxels = new THREE.InstancedMesh(cubeGeo, mat, count);
    voxels.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);

    for (let i = 0; i < count; i++) {
      const shade = 0.9 + Math.random() * 0.15;
      tmpColor.copy(baseColor).multiplyScalar(shade);
      voxels.setColorAt(i, tmpColor);
      tmpQuat.setFromEuler(new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6));
      tmpMatrix.compose(basePositions[i], tmpQuat, new THREE.Vector3(1, 1, 1));
      voxels.setMatrixAt(i, tmpMatrix);
    }

    group = new THREE.Group();
    group.add(voxels);
    scene.add(group);
  }

  function sizeScaleFor(w, h) {
    // Keep the sculpture large and centered — bigger on desktop, still readable on mobile
    const base = Math.min(w, h);
    return (w < 768 ? base * 0.0022 : base * 0.0032);
  }

  function initThree() {
    const canvas = document.createElement('canvas');
    canvas.id = 'magicCanvas';
    document.body.prepend(canvas);

    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(2, 3, 4); scene.add(key);
    const fill = new THREE.DirectionalLight(0xdfffff, 0.35); fill.position.set(-3, -1, 2); scene.add(fill);

    buildScene();
    group.scale.setScalar(sizeScaleFor(window.innerWidth, window.innerHeight));

    clockStart = performance.now();
    animate();
  }

  function animate() {
    if (!isMagic) return;
    const t = (performance.now() - clockStart) / 1000;

    // Idle motion: slow spin + gentle breathing/bob, always moving even without the mouse
    group.rotation.y = t * 0.18 + mouse.nx * 0.35;
    group.rotation.x = Math.sin(t * 0.35) * 0.05 + mouse.ny * 0.18;
    const breathe = 1 + Math.sin(t * 0.8) * 0.02;
    group.scale.setScalar(sizeScaleFor(window.innerWidth, window.innerHeight) * breathe);
    group.position.y = Math.sin(t * 0.6) * 0.06;

    const count = basePositions.length;
    for (let i = 0; i < count; i++) {
      const shimmer = Math.sin(t * 1.6 + phases[i]) * 0.012;
      tmpPos.copy(basePositions[i]).addScaledVector(baseNormals[i], shimmer);

      // Mouse proximity: project this cube to screen space and glow/push it if the cursor is near
      let excite = 0;
      if (mouse.active) {
        tmpVec.copy(basePositions[i]).applyMatrix4(group.matrixWorld).project(camera);
        const sx = (tmpVec.x * 0.5 + 0.5) * window.innerWidth;
        const sy = (-tmpVec.y * 0.5 + 0.5) * window.innerHeight;
        const dist = Math.hypot(sx - mouse.px, sy - mouse.py);
        const radius = 140;
        if (dist < radius) excite = 1 - dist / radius;
      }
      if (excite > 0) tmpPos.addScaledVector(baseNormals[i], excite * 0.12);

      tmpQuat.setFromEuler(new THREE.Euler(t * 0.2 + phases[i], t * 0.15 + phases[i], 0));
      tmpScale.setScalar(1 + excite * 0.6);
      tmpMatrix.compose(tmpPos, tmpQuat, tmpScale);
      voxels.setMatrixAt(i, tmpMatrix);

      if (excite > 0) tmpColor.copy(baseColor).lerp(glowColor, excite);
      else tmpColor.copy(baseColor).multiplyScalar(0.95 + (i % 7) * 0.01);
      voxels.setColorAt(i, tmpColor);
    }
    voxels.instanceMatrix.needsUpdate = true;
    voxels.instanceColor.needsUpdate = true;

    renderer.render(scene, camera);
    animId = requestAnimationFrame(animate);
  }

  function disposeThree() {
    cancelAnimationFrame(animId);
    if (voxels) { voxels.geometry.dispose(); voxels.material.dispose(); }
    if (renderer) renderer.dispose();
    const existingCanvas = document.getElementById('magicCanvas');
    if (existingCanvas) existingCanvas.remove();
    renderer = scene = camera = group = voxels = null;
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    isMagic = !isMagic;
    document.body.classList.toggle('magic-mode', isMagic);

    if (isMagic) {
      initThree();
      btn.innerHTML = `<i data-lucide="power-off" class="w-5 h-5"></i>`;
    } else {
      disposeThree();
      btn.innerHTML = `<i data-lucide="wand-2" class="w-5 h-5"></i>`;
    }
    lucide.createIcons();
  });

  window.addEventListener('resize', () => {
    if (!isMagic || !renderer) return;
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }, 150);
  });
}




document.addEventListener('DOMContentLoaded', () => {
  // 1. Activate ALL email buttons first
  mountAllEmails(); 

// 2. Build Navigation dynamically
  mountNavigation();

  // 3. Initialize Navigation (Smooth scroll, etc.)
  applyNav();

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
