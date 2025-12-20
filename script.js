// Helper to compress images on the fly (makes site load instantly)
function getThumb(url, width = 600) {
  if (!url) return "";
  if (url.includes('.svg')) return url; // Don't compress SVGs
  // We use wsrv.nl (free global CDN) to resize GitHub/external images to WebP format
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&q=80&output=webp`;
}

// Shared helpers across pages
function $(sel, scope=document){ return scope.querySelector(sel) }
function $all(sel, scope=document){ return [...scope.querySelectorAll(sel)] }

// Helper to set email href (Shared to keep logic consistent but buttons separated)
function setupEmail(btn) {
  if(!btn) return
  const email = window.SITE.brand.email;
  if(/Mobi|Android/i.test(navigator.userAgent)){
    btn.href = `mailto:${email}`
  } else {
    btn.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`
    btn.target = '_blank'
    btn.rel = 'noopener noreferrer'
  }
}

function applyNav(){
  const navCenter = $('#navCenter')
  const connectBtn = $('#connectBtn')
  const homeBrand = $('#homeBrand')
  const mmBtn = $('#menuBtn')
  const mobileMenu = $('#mobileMenu')

  // Brand click -> if on index, scroll to top; else go home
  if(homeBrand){
    homeBrand.addEventListener('click', e=>{
      const isHome = window.location.pathname.endsWith("index.html") || window.location.pathname === "/" 
      if(isHome){
        e.preventDefault()
        window.scrollTo({top:0, behavior:'smooth'})
      }
      // else let the normal link work (reloads index.html)
    })
  }

  // Smart scroll only for mobile
  const navbar = $('#navbar');
  let lastScroll = 0;

  if(navbar) {
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      const isMobile = window.innerWidth < 768; // Tailwind md breakpoint

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

  // Connect Button -> Scrolls to "Want to collaborate"
  if(connectBtn){
    connectBtn.addEventListener('click', (e)=> {
      e.preventDefault();
      const contactSec = document.getElementById('contact'); 
      if(contactSec) contactSec.scrollIntoView({behavior: 'smooth'});
    })
  }

  // Smooth scroll for anchors
  $all('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const id = a.getAttribute('href')
      if(id.length>1){
        e.preventDefault()
        const el = $(id)
        if(el){ el.scrollIntoView({behavior:'smooth', block:'start'}) }
      }
    })
  })

  // Mobile menu toggler
  if(mmBtn && mobileMenu){
    mmBtn.addEventListener('click', ()=> mobileMenu.classList.toggle('hidden'))
    $all('#mobileMenu a').forEach(link=> link.addEventListener('click', ()=> mobileMenu.classList.add('hidden')))
  }
}

function mountHero(){
  const {name, subtitle, cvDownload} = window.SITE.brand
  const nameEl = $('#heroName');
  if(nameEl) nameEl.textContent = name
  const subEl = $('#heroSubtitle');
  if(subEl) subEl.textContent = subtitle

  // HERO EMAIL BUTTON
  setupEmail($('#emailBtn'));

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

  // Ticker content - seamless loop
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

  // Down button scroll
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

  // Get projects with images,
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
  const {photo} = window.SITE.brand
  const photoEl = $('#aboutPhoto')
  if(photoEl) photoEl.src = photo
  const bioEl = $('#aboutBio')
  if(bioEl) bioEl.innerHTML = window.SITE.about.bio

  const msgBtn = $('#msgBtn')
  if(msgBtn) msgBtn.addEventListener('click', ()=> window.open(window.SITE.brand.linkedin,'_blank'))

  // ABOUT EMAIL BUTTON
  setupEmail($('#aboutMailBtn'));

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
      </div>
    `
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
      </div>
    `).join("")
  }

  // Counters Section
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
              <a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${p.github}" target="_blank" rel="noopener noreferrer"><i data-lucide="monitor"></i></a>
              <a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${p.details}" target="_blank" rel="noopener noreferrer"><i data-lucide="external-link"></i><span class="sr-only">See more</span></a>
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


function mountExperience(){
  const list = $('#expList')
  if(!list) return

  const recentLimit = window.SITE.experiences.recentLimit || null
  const itemsToShow = recentLimit ? window.SITE.experiences.items.slice(0, recentLimit) : window.SITE.experiences.items

  list.innerHTML = itemsToShow.map(x=>`
    <div class="card p-4 bg-white rounded-xl border border-slate-200">
      <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <div class="font-semibold">${x.role}</div>
          <div class="text-sm text-slate-600">${x.org}</div>
          <div class="text-xs text-slate-500">${x.date} — ${x.location}</div>
          <ul class="mt-2 list-disc pl-5 text-sm text-slate-700">${x.bullets.map(b=>`<li>${b}</li>`).join('')}</ul>
        </div>
        <div class="flex gap-2 md:self-end">
          <a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${x.github}"  target="_blank" rel="noopener noreferrer"><i data-lucide="file-text"></i></a>
          <a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${x.more}" target="_blank" rel="noopener noreferrer"><i data-lucide="external-link"></i></a>
        </div>
      </div>
    </div>
  `).join('')
}


function mountPublications() {
  const rec = $('#pubRecent');
  if(!rec) return;

  const isHome = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
  const items = isHome 
    ? window.SITE.publications.items.slice(0, window.SITE.publications.recentLimit)
    : window.SITE.publications.items;

  rec.innerHTML = items.map(p => `
    <div class="card p-4 bg-white rounded-xl border border-slate-200">
      <div class="text-sm text-slate-500">${p.type}</div>
      <div class="font-medium mt-1">${p.title}</div>
      <div class="text-xs text-slate-500">${p.date} · ${p.venue}</div>
      <div class="mt-3 flex gap-2 justify-end">
        <a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${p.link}" target="_blank">
          <i data-lucide="external-link"></i><span class="sr-only">See more</span>
        </a>
        ${p.cite ? `<a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${p.cite}" target="_blank">
          <i data-lucide="quote"></i><span class="sr-only">Cite</span>
        </a>` : ''}
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}


function mountAchievementsPreview(){
  const wrap = $('#achvPreview')
  if(!wrap) return

  function renderCard(list, title, limit = 10){
    const filtered = list.filter(a => a.featured).slice(0, limit)
    return `
      <div class="card p-4 bg-white rounded-xl border border-slate-200">
        <div class="font-semibold mb-2">${title}</div>
        <div class="grid gap-2">
          ${filtered.map(a=>`
            <div class="card p-4 bg-white rounded-xl border border-slate-200 flex items-start justify-between">
              <div>
                <div class="text-sm">${a.title}</div>
                <div class="text-xs text-slate-500">${a.date}</div>
                ${a.tags?.length ? `<div class="mt-1 flex flex-wrap gap-1">${a.tags.map(t=>`<span class="text-xs px-2 py-0.5 border rounded-full">${t}</span>`).join('')}</div>` : ''}
              </div>
              <a class="px-3 py-1.5 bg-white border rounded-xl hover:bg-black hover:text-white hover-smart" href="${a.link}" target="_blank">
                <i data-lucide="external-link"></i>
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  const A = window.SITE.achievements
  wrap.innerHTML = [
    renderCard(A.fellowships, "Fellowships, Awards & Research Grants"),
    renderCard(A.licenses, "License & Certifications"),
    renderCard(A.workshops, "Workshops & Presentations"),
    renderCard(A.volunteering, "Leadership & Volunteering Experience")
  ].join('')

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
            ${b.tags.map(t => `<a href="blogs.html?tag=${t}" class="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-md hover:bg-black hover:text-white transition-colors">${t}</a>`).join('')}
          </div>
          <div class="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
            <span class="text-xs text-slate-400">Read article</span>
            <a class="px-3 py-1.5 bg-black text-white rounded-xl hover:scale-105 transition-transform" href="${b.link}" target="_blank">
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
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
           ${b.tags.map(t => `<a href="blogs.html?tag=${t}" class="text-xs px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-black hover:text-white transition-colors">${t}</a>`).join('')}
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


// === NEW: Explicit Function for the Collaborate Button (Footer) ===
function mountCollaborate() {
  const btn = $('#footerEmailBtn');
  // We use the shared helper to keep logic in one place, but the button itself is separate
  if(btn) setupEmail(btn);
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


// Faster Loading Screen logic
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

  // Force hide after max 1.5 seconds, or when window loads (whichever is first)
  const hide = () => {
    screen.style.transition = "opacity 0.5s ease"
    screen.style.opacity = '0'
    setTimeout(()=> screen.style.display='none', 500)
  }

  window.addEventListener('load', hide) 
  setTimeout(hide, 1500) 
}



document.addEventListener('DOMContentLoaded', () => {
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
  if ($('#achvPreview')) mountAchievementsPreview();
  if ($('#footerLinks')) mountFooter();
  if ($('#servicesList')) mountServices(); // ensure ID matches HTML
  
  if ($('#blogTrack')) mountBlogCarousel();
  if ($('#blogList')) mountBlogsPage();

  // Initialize Footer/Collaborate Button separate from Hero
  mountCollaborate();

  if (window.lucide) lucide.createIcons();
});
