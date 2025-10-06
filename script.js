
// Shared helpers across pages
function $(sel, scope=document){ return scope.querySelector(sel) }
function $all(sel, scope=document){ return [...scope.querySelectorAll(sel)] }

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
// Smart scroll only for mobile
const navbar = $('#navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  const isMobile = window.innerWidth < 768; // Tailwind md breakpoint

  if (!isMobile) {
    // Desktop: always visible
    navbar.style.transform = "translateY(0)";
    return;
  }

  if (currentScroll > lastScroll && currentScroll > 50) {
    // Scrolling down → hide
    navbar.style.transform = "translateY(-100%)";
  } else {
    // Scrolling up → show
    navbar.style.transform = "translateY(0)";
  }

  lastScroll = currentScroll;
});

}

  // Connect
  if(connectBtn){
    connectBtn.addEventListener('click', ()=> window.open(window.SITE.brand.linkedin, '_blank'))
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

  // Mobile menu toggler with white background
  if(mmBtn && mobileMenu){
    mmBtn.addEventListener('click', ()=> mobileMenu.classList.toggle('hidden'))
    $all('#mobileMenu a').forEach(link=> link.addEventListener('click', ()=> mobileMenu.classList.add('hidden')))
  }
}

function mountHero(){
  const {name, subtitle, cvDownload, email, linkTargetId} = window.SITE.brand
  $('#heroName').textContent = name
  $('#heroSubtitle').textContent = subtitle

  // Buttons
  const cvBtn = $('#cvBtn')
  cvBtn.href = cvDownload
  cvBtn.setAttribute('download','Imtiaj-Iqbal-Mahfuj-CV.pdf')

  const emailBtn = $('#emailBtn')
  if(/Mobi|Android/i.test(navigator.userAgent)){
    emailBtn.href = `mailto:${email}`
  } else {
    emailBtn.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`
    emailBtn.target = '_blank'
    emailBtn.rel = 'noopener noreferrer'
  }

  const linkBtn = $('#linkBtn')
  linkBtn.addEventListener('click', ()=> {
    const el = document.getElementById(linkTargetId)
    if(el){ el.scrollIntoView({behavior:'smooth'}) }
  })

  // Ticker content - seamless loop
  const track = $('#tickerTrack')
  const itemsHTML = window.SITE.tickerIcons.map(it=> `<span class="inline-flex items-center gap-2 mr-8 text-sm text-slate-600">
    <i data-lucide="${it.icon}"></i>${it.name}
  </span>`).join('')

  // Wrap each set in a div for seamless scroll
  track.innerHTML = `<div class="ticker-inner">${itemsHTML}</div>
                     <div class="ticker-inner">${itemsHTML}</div>`

  const innerWidth = track.querySelector('.ticker-inner').scrollWidth
  let pos = 0
  const isMobile = /Mobi|Android/i.test(navigator.userAgent)
  const speed = isMobile ? 0.5 : 0.8  // PC a bit faster

  function animateTicker() {
    pos -= speed
    if(pos <= -innerWidth) pos = 0
    track.style.transform = `translateX(${pos}px)`
    requestAnimationFrame(animateTicker)
  }

  // start ticker animation
  requestAnimationFrame(animateTicker)

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
        <img src="${s.image}" alt="${s.title}" class="w-full h-80 md:h-[28rem] object-cover object-center">
      </a>
    </div>
  `).join('');

  let idx = 0;
  function go(i){
    idx = (i + slideCount) % slideCount;
    slidesWrap.style.transform = `translateX(-${idx * 100}%)`;
  }

  $('#prevSlide').addEventListener('click', ()=> go(idx-1));
  $('#nextSlide').addEventListener('click', ()=> go(idx+1));
  setInterval(()=> go(idx+1), 4500);
}


function mountAbout(){
  const {photo} = window.SITE.brand
  $('#aboutPhoto').src = photo
  $('#aboutBio').innerHTML = window.SITE.about.bio

  const msgBtn = $('#msgBtn')
  msgBtn.addEventListener('click', ()=> window.open(window.SITE.brand.linkedin,'_blank'))

  const aboutMailBtn = $('#aboutMailBtn')
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    aboutMailBtn.href = `mailto:${window.SITE.brand.email}`
  } else {
    aboutMailBtn.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(window.SITE.brand.email)}`
    aboutMailBtn.target = '_blank'
    aboutMailBtn.rel = 'noopener noreferrer'
  }

  // Education
  const edu = window.SITE.education
  const list = $('#eduList')
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
  
  
  // Research Interests (works just like Skills)
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

  
  
  // Skills (Flexible categories)
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
    initCounters() // animate the counters
  }
}

// Counter animation
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

  // only projects with images
  const items = (window.SITE.projects || []).filter(p => p.image)

  // unique tags
  const uniqueTags = [...new Set(items.flatMap(p => p.tags))]

  // 🎯 define the order you want
  const tagOrder = ["Portfolio", "GIS", "Geospatial Python", "GEE", "ML", "Remote Sensing", "URP", "GeoViz", "Operations Research", "Others"]

  // reorder tags: first by tagOrder, then any new tags alphabetically
  const tags = [
    ...tagOrder.filter(t => uniqueTags.includes(t)),
    ...uniqueTags.filter(t => !tagOrder.includes(t)).sort()
  ]

  const tagWrap = $('#projectTags')

  // First add ALL button (always first)
  tagWrap.insertAdjacentHTML('beforeend',
    `<button data-tag="ALL" class="filter-btn px-3 py-1.5 bg-black text-white border border-slate-200 rounded-xl hover:bg-black hover:text-white hover-smart">All</button>`)

  // Then add ordered tags
  tags.forEach(t => tagWrap.insertAdjacentHTML('beforeend',
    `<button data-tag="${t}" class="filter-btn px-3 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-black hover:text-white hover-smart">${t}</button>`))

  let filtered = items.slice()

  function render() {
    $('#projectTrack').innerHTML = filtered.map(p => `
      <div class="flex-shrink-0">
        <div class="card h-full bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
          <a href="projects.html#${p.id}" target="_blank" class="block">
            <img src="${p.image}" class="w-full h-48 object-cover" alt="${p.title}">
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

  // filtering with active state
  tagWrap.addEventListener('click', e => {
    const b = e.target.closest('button[data-tag]')
    if (!b) return

    const t = b.dataset.tag
    filtered = (t === "ALL") ? items.slice() : items.filter(p => (p.tags || []).includes(t))
    render()

    // clear active from all, set active on clicked
    tagWrap.querySelectorAll('button[data-tag]').forEach(btn => {
      btn.classList.remove('bg-black', 'text-white')
      btn.classList.add('bg-white')
    })
    b.classList.remove('bg-white')
    b.classList.add('bg-black', 'text-white')
  })

  // carousel buttons (scroll container)
  const track = $('#projectTrackOuter')
  $('#projPrev').addEventListener('click', () => track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' }))
  $('#projNext').addEventListener('click', () => track.scrollBy({ left: track.clientWidth, behavior: 'smooth' }))
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
  // Limit only on homepage
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

  function renderCard(list, title, limit = 5){
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
    renderCard(A.licenses, "Licenses & Certifications"),
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




function mountFooter(){
  const zone = $('#footerLinks')
  if(!zone) return
  zone.innerHTML = window.SITE.socials.map(s=>`
    <a class="footer-link hover:bg-white hover:text-black hover-smart" href="${s.href}" target="_blank">
      <i data-lucide="${s.icon}"></i><span>${s.label}</span>
    </a>
  `).join('')
  $('#year').textContent = new Date().getFullYear()
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

  window.addEventListener('load', ()=> setTimeout(()=> screen.style.display='none', 1200))
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
  if ($('#services')) mountServices(); // initialize Services section

  // Contact Form
  const form = document.querySelector("#contactForm");
  const sendBtn = document.getElementById("sendBtn");

  if (form && sendBtn) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      sendBtn.disabled = true;

      const data = Object.fromEntries(new FormData(form));

      try {
        const res = await fetch("https://script.google.com/macros/s/AKfycbxhs7539WwsLweHd-KJ_cB3UbxLrT8qwPYCvSahVc0FeOaPScR9r4fuOxQqf62SDUperQ/exec", {  // <-- replace with your Web App URL
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json;charset=utf-8" }
        });

        const result = await res.json();

        if (result.status === "success") {
          alert("Message sent! Thank you.");
          form.reset();
        } else {
          alert("Oops! Something went wrong: " + result.message + "\n\nFor a prompt response, please contact me via email: imtiajiqbal.ruet@gmai.com");
        }

      } catch(err) {
        alert("Oops! Something went wrong. Please try again.\n\nFor a prompt response, please contact me via email: imtiajiqbal.ruet@gmai.com");
        console.error(err);
      } finally {
        sendBtn.disabled = false;
      }
    });
  }

  if (window.lucide) lucide.createIcons();
});


