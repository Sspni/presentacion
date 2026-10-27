(() => {
  "use strict";

  const slides = [...document.querySelectorAll("[data-slide]")];
  const currentLabel = document.querySelector("[data-current]");
  const progress = document.querySelector("[data-progress]");
  const progressTrack = document.querySelector("[role=progressbar]");
  const announcer = document.querySelector("[data-announcer]");
  const previous = document.querySelector("[data-prev]");
  const next = document.querySelector("[data-next]");
  const deck = document.querySelector(".deck");
  const deckTop = document.querySelector(".deck-top");
  const controls = document.querySelector(".deck-controls");
  const welcome = document.querySelector("[data-welcome]");
  const startButton = document.querySelector("[data-start]");
  const config = window.COOL_ANIMAL_CONFIG || {};
  let current = 0;
  let pointerStart = null;
  let isStarted = false;

  deckTop.inert = true;
  controls.inert = true;

  function showSlide(index, animate = true) {
    const target = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === target;
      slide.classList.toggle("is-active", active);
      slide.classList.toggle("no-motion", !animate);
      slide.setAttribute("aria-hidden", String(!active));
      slide.inert = !active || !isStarted;
      if (active && animate) {
        if (slideIndex === 5) {
          const map = slide.querySelector(".market-map");
          map?.classList.remove("is-walking");
          if (map) void map.offsetWidth;
          requestAnimationFrame(() => map?.classList.add("is-walking"));
        }
        if (slideIndex === 10) slide.classList.add("paw-walk");
        requestAnimationFrame(() => slide.classList.remove("no-motion"));
      } else {
        slide.classList.remove("paw-walk");
        slide.querySelector(".market-map")?.classList.remove("is-walking");
      }
    });
    current = target;
    deck.dataset.sequence = current % 2 === 0 ? "logo" : "paw";
    const number = String(current + 1).padStart(2, "0");
    currentLabel.textContent = number;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    progressTrack.setAttribute("aria-valuenow", String(current + 1));
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    announcer.textContent = `Diapositiva ${current + 1} de ${slides.length}: ${slides[current].querySelector("h1,h2")?.innerText.replace(/\s+/g, " ").trim() || ""}`;
    if (history.replaceState) history.replaceState(null, "", `#slide-${current + 1}`);
  }

  startButton.addEventListener("click", () => {
    if (isStarted) return;
    isStarted = true;
    deckTop.inert = false;
    controls.inert = false;
    welcome.setAttribute("aria-hidden", "true");
    welcome.classList.add("is-exiting");
    showSlide(0);
    const heading = slides[0].querySelector("h1,h2");
    heading?.setAttribute("tabindex", "-1");
    heading?.focus({ preventScroll: true });
    window.setTimeout(() => { welcome.hidden = true; }, 300);
  });

  previous.addEventListener("click", () => showSlide(current - 1));
  next.addEventListener("click", () => showSlide(current + 1));

  document.addEventListener("keydown", event => {
    if (!isStarted) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    if (["ArrowRight", "PageDown"].includes(event.key)) {
      event.preventDefault();
      showSlide(current + 1, false);
    } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
      event.preventDefault();
      showSlide(current - 1, false);
    } else if (event.key === "Home") {
      event.preventDefault();
      showSlide(0, false);
    } else if (event.key === "End") {
      event.preventDefault();
      showSlide(slides.length - 1, false);
    }
  });

  deck.addEventListener("pointerdown", event => {
    if (!isStarted || event.pointerType !== "touch") return;
    pointerStart = { x: event.clientX, y: event.clientY };
  }, { passive: true });
  deck.addEventListener("pointerup", event => {
    if (!isStarted || !pointerStart || event.pointerType !== "touch") return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.35) showSlide(current + (dx < 0 ? 1 : -1), false);
  }, { passive: true });
  deck.addEventListener("pointercancel", () => { pointerStart = null; }, { passive: true });

  const instagram = String(config.instagramUsername || "").trim().replace(/^@/, "");
  const phone = String(config.whatsappNumber || "").replace(/\D/g, "");
  const websiteUrl = String(config.websiteUrl || "").trim();

  const instagramLink = document.querySelector("[data-instagram-link]");
  const instagramLabel = document.querySelector("[data-instagram-label]");
  if (instagram) {
    if (instagramLink) {
      instagramLink.href = `https://instagram.com/${instagram}`;
      instagramLink.textContent = `@${instagram}`;
      instagramLink.hidden = false;
    }
    if (instagramLabel) {
      instagramLabel.textContent = `@${instagram}`;
    }
  } else if (instagramLink) {
    instagramLink.hidden = true;
  }
  const whatsappLink = document.querySelector("[data-whatsapp-link]");
  if (whatsappLink) {
    if (phone) {
      const localPhone = phone.startsWith("57") ? phone.slice(2) : phone;
      whatsappLink.href = `https://wa.me/${phone}?text=${encodeURIComponent("Hola, quiero conocer las paletas COOL ANIMAL.")}`;
      whatsappLink.textContent = localPhone.length === 10
        ? `${localPhone.slice(0, 3)} ${localPhone.slice(3, 6)} ${localPhone.slice(6)}`
        : phone;
    } else {
      whatsappLink.hidden = true;
    }
  }
  const defaultWebsiteUrl = "https://sspni.github.io/coolanimal/";
  const websiteLink = document.querySelector("[data-website-link]");
  const resolvedWebsiteUrl = websiteUrl || defaultWebsiteUrl;
  if (websiteLink) websiteLink.href = resolvedWebsiteUrl;
  const preview = document.querySelector("[data-website-preview]");
  if (preview) preview.src = resolvedWebsiteUrl;

  showSlide(0, false);
  window.addEventListener("hashchange", () => {
    if (!isStarted) return;
    const requested = Number(location.hash.match(/^#slide-(\d+)$/)?.[1] || 1) - 1;
    showSlide(requested, false);
  });
})();
