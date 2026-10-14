(() => {
  "use strict";

  const config = window.COOL_ANIMAL_CONFIG || {};

  const products = [
    {
      id: "fresa",
      name: "COOL ANIMAL",
      flavor: "Fresa Silvestre",
      description: "Paleta congelada con yogur natural probiótico y fresa natural seleccionada.",
      price: 3500,
      image: "assets/paleta-patita-referencia.png",
      tone: "strawberry",
      badge: "Más vendido",
      tags: ["Fruta fresca", "Sin azúcar añadida", "Molde individual"]
    },
    {
      id: "banano",
      name: "COOL ANIMAL",
      flavor: "Banano Dulce",
      description: "Paleta congelada con yogur natural cremoso y banano maduro de fácil digestión.",
      price: 3500,
      image: "assets/paleta-patita-referencia.png",
      tone: "banana",
      badge: "Cremoso",
      tags: ["Banano maduro", "Digestión ligera", "Molde individual"]
    },
    {
      id: "pack-degustacion",
      name: "COOL ANIMAL",
      flavor: "Pack x4 Degustación",
      description: "2 de Fresa Silvestre y 2 de Banano Dulce en empaque térmico especial.",
      price: 13000,
      image: "assets/paleta-patita-referencia.png",
      tone: "pack",
      badge: "Pack de 4",
      tags: ["2 fresa y 2 banano", "Empaque térmico", "Ahorro por combo"]
    }
  ];

  const cart = new Map();
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const pesos = n => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
  const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Micro-audio synthesis for tactile haptic feedback (Emil Kowalski delight)
  function playPopSound(freq = 620, endFreq = 920) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = playPopSound.ctx || (playPopSound.ctx = new AudioContext());
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.045, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch (_) {}
  }

  // Render Product Catalog with 3D Depth & Glare
  const productsContainer = $("[data-products]");
  if (productsContainer) {
    productsContainer.innerHTML = products.map(p => `
      <article class="product-card ${p.tone}" data-product-id="${p.id}">
        <div class="card-glare" aria-hidden="true"></div>
        <div class="product-top-bar">
          <span class="product-badge">${p.badge}</span>
          <span class="product-shape-tag">${p.id === 'pack-degustacion' ? '4 unidades' : 'Molde individual'}</span>
        </div>
        <div class="product-art">
          <div class="product-art-glow" aria-hidden="true"></div>
          <img src="${p.image}" alt="Paleta Cool Animal sabor ${p.flavor}">
        </div>
        <div class="product-info">
          <h3>${p.name}</h3>
          <p class="flavor">${p.flavor}</p>
          <p class="product-desc">${p.description}</p>
          <div class="product-pill-tags">
            ${p.tags.map(t => `<span class="pill-tag">${t}</span>`).join("")}
          </div>
          <div class="product-footer">
            <div class="product-price-box">
              <span class="currency">$</span>
              <strong class="product-price">${pesos(p.price).replace("$", "").trim()}</strong>
              <small>COP</small>
            </div>
            <button class="button button-dark product-add" data-add="${p.id}" aria-label="Agregar ${p.flavor} al carrito">
              <span class="btn-text">Agregar</span>
              <span class="btn-icon" aria-hidden="true">+</span>
            </button>
          </div>
        </div>
      </article>`).join("");
  }

  // Checkout configuration setup
  const payment = $("select[name=payment]");
  if (payment) {
    const methods = Array.isArray(config.paymentMethods) ? config.paymentMethods.filter(Boolean) : [];
    payment.innerHTML = methods.length ? methods.map(x => `<option>${escapeHTML(x)}</option>`).join("") : '<option value="">Configura un método de pago</option>';
  }

  const feeInput = $("[data-delivery-fee]");
  if (feeInput && Number.isFinite(config.deliveryFee) && config.deliveryFee >= 0) {
    feeInput.value = config.deliveryFee;
  }

  // Social & Floating WhatsApp setup
  const floatWa = $("[data-floating-wa]");
  const cleanPhone = String(config.whatsappNumber || "").replace(/\D/g, "");
  if (floatWa) {
    if (cleanPhone) {
      floatWa.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Hola Cool Animal, quisiera hacer una consulta sobre las paletas.")}`;
      floatWa.target = "_blank";
      floatWa.rel = "noopener noreferrer";
    } else {
      floatWa.addEventListener("click", e => {
        e.preventDefault();
        const pedidos = $("#pedidos");
        if (pedidos) pedidos.scrollIntoView({ behavior: "smooth" });
      });
    }
  }

  $("[data-year]").textContent = new Date().getFullYear();

  // Cart Modal & Drawer Controls
  const panel = $("[data-cart-panel]"), backdrop = $("[data-cart-backdrop]");
  function openCart() {
    playPopSound(520, 780);
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      panel.classList.add("is-open");
      backdrop.classList.add("is-open");
    });
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("cart-open");
    setTimeout(() => {
      const closeBtn = $("[data-close-cart]");
      if (closeBtn) closeBtn.focus();
    }, 40);
  }

  function closeCart() {
    panel.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cart-open");
    setTimeout(() => { backdrop.hidden = true; }, 280);
  }

  $$('[data-open-cart]').forEach(b => b.addEventListener("click", openCart));
  $$('[data-close-cart]').forEach(b => b.addEventListener("click", closeCart));
  if (backdrop) backdrop.addEventListener("click", closeCart);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && panel && panel.classList.contains("is-open")) closeCart();
    if (e.key === "Escape" && toggle && toggle.getAttribute("aria-expanded") === "true") closeMenu();
  });

  // Cart operations
  function triggerCartBump() {
    $$('[data-cart-count]').forEach(el => {
      el.classList.remove("cart-bump");
      void el.offsetWidth;
      el.classList.add("cart-bump");
    });
  }

  function add(id, amount = 1) {
    const prev = cart.get(id) || 0;
    const next = Math.max(0, prev + amount);
    if (next === 0) cart.delete(id);
    else cart.set(id, next);
    playPopSound(660, 940);
    renderCart();
    triggerCartBump();
  }

  function renderCart() {
    const count = [...cart.values()].reduce((a, b) => a + b, 0);
    $$('[data-cart-count]').forEach(el => el.textContent = count);
    $$('.cart-trigger').forEach(el => el.setAttribute("aria-label", `Abrir carrito, ${count} ${count === 1 ? "producto" : "productos"}`));

    const rows = [...cart.entries()].map(([id, qty]) => {
      const p = products.find(x => x.id === id);
      return `
        <article class="cart-row">
          <img src="${p.image}" alt="${p.flavor}">
          <div>
            <h3>${p.name} · ${p.flavor}</h3>
            <p>${pesos(p.price)} c/u</p>
            <div class="quantity">
              <button type="button" data-change="${id}" data-delta="-1" aria-label="Quitar una unidad de ${p.flavor}">−</button>
              <span>${qty}</span>
              <button type="button" data-change="${id}" data-delta="1" aria-label="Agregar una unidad de ${p.flavor}">+</button>
              <button type="button" class="remove-item" data-remove="${id}">Eliminar</button>
            </div>
          </div>
          <strong class="cart-row-total">${pesos(qty * p.price)}</strong>
        </article>`;
    }).join("");

    const cartItems = $("[data-cart-items]");
    if (cartItems) cartItems.innerHTML = rows;

    const emptyMsg = $("[data-cart-empty]");
    if (emptyMsg) emptyMsg.hidden = count > 0;

    const subtotal = [...cart.entries()].reduce((total, [id, qty]) => total + (products.find(p => p.id === id)?.price || 0) * qty, 0);
    const feeVal = feeInput ? feeInput.value : "";
    const fee = feeVal === "" ? null : Math.max(0, Number(feeVal) || 0);

    const subtotalEl = $("[data-subtotal]");
    if (subtotalEl) subtotalEl.textContent = pesos(subtotal);

    const totalEl = $("[data-total]");
    if (totalEl) totalEl.textContent = fee === null ? "Por confirmar" : pesos(subtotal + fee);

    if (cartItems) {
      cartItems.querySelectorAll("[data-change]").forEach(b => b.addEventListener("click", () => add(b.dataset.change, Number(b.dataset.delta))));
      cartItems.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => {
        cart.delete(b.dataset.remove);
        playPopSound(440, 320);
        renderCart();
        triggerCartBump();
      }));
    }
  }

  // Add-to-cart click handler with instant visual feedback
  if (productsContainer) {
    productsContainer.addEventListener("click", e => {
      const b = e.target.closest("[data-add]");
      if (b) {
        const id = b.dataset.add;
        add(id);
        const flavor = products.find(p => p.id === id)?.flavor || "";
        toast(`${flavor} agregado al carrito.`);

        // Subtle button press feedback state
        b.classList.add("added-feedback");
        setTimeout(() => b.classList.remove("added-feedback"), 450);
      }
    });
  }

  if (feeInput) feeInput.addEventListener("input", renderCart);

  // WhatsApp Order Generator
  function orderMessage(formData) {
    const items = [...cart.entries()].map(([id, qty]) => {
      const p = products.find(x => x.id === id);
      return `• ${p.flavor} × ${qty}: ${pesos(p.price * qty)}`;
    });
    const subtotal = [...cart.entries()].reduce((n, [id, qty]) => n + (products.find(p => p.id === id)?.price || 0) * qty, 0);
    const feeVal = feeInput ? feeInput.value : "";
    const fee = feeVal === "" ? null : Math.max(0, Number(feeVal) || 0);
    const total = fee === null ? `${pesos(subtotal)} + domicilio por confirmar` : pesos(subtotal + fee);
    const d = Object.fromEntries(formData.entries());

    return [
      `Hola Cool Animal, quiero pedir los siguientes productos:`,
      ...items,
      ``,
      `Subtotal: ${pesos(subtotal)}`,
      `Domicilio: ${fee === null ? "Por confirmar" : pesos(fee)}`,
      `TOTAL: ${total}`,
      ``,
      `Nombre: ${d.name}`,
      `Teléfono: ${d.phone}`,
      `Dirección: ${d.address}, barrio ${d.neighborhood}, ${d.city}`,
      d.reference ? `Referencia: ${d.reference}` : "",
      `Método de pago: ${d.payment}`
    ].filter(Boolean).join("\n");
  }

  // Toast notification
  function toast(text) {
    const el = $("[data-toast]");
    if (!el) return;
    el.innerHTML = `<span>${escapeHTML(text)}</span>`;
    el.classList.add("is-visible");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("is-visible"), 3200);
  }

  async function copyMessage(message) {
    try {
      await navigator.clipboard.writeText(message);
      toast("Mensaje copiado. Puedes pegarlo en WhatsApp.");
    } catch {
      const area = document.createElement("textarea");
      area.value = message;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      toast("Mensaje copiado. Puedes pegarlo en WhatsApp.");
    }
  }

  const checkout = $("[data-checkout]");
  if (checkout) {
    checkout.addEventListener("submit", async e => {
      e.preventDefault();
      if (!cart.size) { toast("Agrega al menos una paleta para continuar."); return; }
      if (!checkout.reportValidity()) return;
      const message = orderMessage(new FormData(checkout));
      if (cleanPhone) {
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      } else {
        await copyMessage(message);
        const note = $("[data-checkout-note]");
        if (note) note.textContent = "El número de WhatsApp aún no está configurado en config.js. Hemos copiado tu pedido.";
      }
    });

    const copyBtn = $("[data-copy-order]");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        if (!cart.size) { toast("Agrega al menos una paleta para continuar."); return; }
        if (!checkout.reportValidity()) return;
        await copyMessage(orderMessage(new FormData(checkout)));
      });
    }
  }

  // Mobile navigation drawer toggle
  const toggle = $(".menu-toggle"), nav = $(".main-nav");
  function closeMenu() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      if (open) {
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Cerrar menú");
        nav.classList.add("is-open");
      } else closeMenu();
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
    document.addEventListener("click", e => {
      if (!e.target.closest(".site-header") && toggle.getAttribute("aria-expanded") === "true") closeMenu();
    });
  }

  // Fluid Apple FAQ Accordion (Pure Hardware Easing)
  $$(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      if (!item) return;
      const isOpen = item.classList.contains("is-open");

      // Close all other items cleanly
      $$(".faq-item").forEach(other => {
        if (other !== item) {
          other.classList.remove("is-open");
          other.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
        }
      });

      if (isOpen) {
        item.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        playPopSound(540, 780);
      }
    });
  });

  // SUPAHERO 3D STAGE & PARALLAX ENGINE
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (finePointer.matches && !reduceMotion.matches) {
    // 1. Hero 3D Stage Spring Interpolation
    const heroStage = $("#heroVisualStage");
    const heroPhoto = $("#heroPhoto");
    const heroProduct = $("#heroProduct");
    const photoGlare = $(".photo-glare", heroPhoto);

    if (heroStage && heroPhoto) {
      let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
      let velocityX = 0, velocityY = 0, prevTime = 0, animId = 0;
      const stiffness = 85, damping = 9, mass = 1;

      function renderHero3D(time) {
        const delta = Math.min((time - (prevTime || time - 16.67)) / 1000, 1 / 30);
        prevTime = time;

        const accX = (stiffness * (targetX - currentX) - damping * velocityX) / mass;
        const accY = (stiffness * (targetY - currentY) - damping * velocityY) / mass;
        velocityX += accX * delta;
        velocityY += accY * delta;
        currentX += velocityX * delta;
        currentY += velocityY * delta;

        // Apply 3D rotation to main photo
        heroPhoto.style.transform = `rotateX(${currentX}deg) rotateY(${currentY}deg)`;

        // Parallax depth offset to satellites
        if (heroProduct) {
          heroProduct.style.transform = `translate3d(${currentY * -1.8}px, ${currentX * 1.8}px, 62px) rotateX(${currentX * 0.7}deg) rotateY(${currentY * 0.7}deg)`;
        }

        const atRest = Math.abs(targetX - currentX) < 0.01 &&
                       Math.abs(targetY - currentY) < 0.01 &&
                       Math.abs(velocityX) < 0.01 &&
                       Math.abs(velocityY) < 0.01;

        if (atRest) {
          currentX = targetX; currentY = targetY;
          velocityX = 0; velocityY = 0;
          if (targetX === 0 && targetY === 0) {
            heroPhoto.style.transform = "";
            if (heroProduct) heroProduct.style.transform = "";
          }
          prevTime = 0;
          animId = 0;
          return;
        }
        animId = requestAnimationFrame(renderHero3D);
      }

      function queueHeroMotion() {
        if (!animId) animId = requestAnimationFrame(renderHero3D);
      }

      heroStage.addEventListener("pointermove", e => {
        if (e.pointerType !== "mouse") return;
        const rect = heroStage.getBoundingClientRect();
        const normX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const normY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

        targetX = Math.max(-5, Math.min(5, -normY * 5));
        targetY = Math.max(-6, Math.min(6, normX * 6));

        if (photoGlare) {
          const photoRect = heroPhoto.getBoundingClientRect();
          const glareX = e.clientX - photoRect.left;
          const glareY = e.clientY - photoRect.top;
          photoGlare.style.setProperty("--glare-x", `${glareX}px`);
          photoGlare.style.setProperty("--glare-y", `${glareY}px`);
          photoGlare.style.opacity = "0.7";
        }
        queueHeroMotion();
      }, { passive: true });

      heroStage.addEventListener("pointerleave", () => {
        targetX = 0; targetY = 0;
        if (photoGlare) photoGlare.style.opacity = "0";
        queueHeroMotion();
      }, { passive: true });
    }

    // 2. Interactive 3D Card Hover Tilt + Specular Glare (Supahero Signature)
    function attachCard3DTilt(card) {
      const glare = card.querySelector(".card-glare");
      card.addEventListener("pointermove", e => {
        if (e.pointerType !== "mouse") return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const normX = (x - rect.width / 2) / (rect.width / 2);
        const normY = (y - rect.height / 2) / (rect.height / 2);

        const tiltX = -normY * 6.5;
        const tiltY = normX * 6.5;

        card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-4px)`;
        if (glare) {
          glare.style.setProperty("--mouse-x", `${x}px`);
          glare.style.setProperty("--mouse-y", `${y}px`);
          glare.style.opacity = "1";
        }
      }, { passive: true });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
        if (glare) glare.style.opacity = "0";
      }, { passive: true });
    }

    $$(".product-card, .feature-card").forEach(attachCard3DTilt);
  }

  // Progressive Scroll Reveal (Emil Kowalski staggered easing)
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const revealTargets = [
      ...new Set($$(
        ".hero-copy h1, .hero-copy .hero-text, .hero-actions, .hero-trust, .hero-visual, " +
        ".section-heading, .product-card, .feature-card, .nutrition-card, .faq-item, .compare-glass, .order-top, .steps .step-card, .order-main-btn"
      ))
    ];

    revealTargets.forEach((el, i) => {
      el.dataset.reveal = i % 4 === 0 ? "soft" : "rise";
      el.style.setProperty("--reveal-delay", `${(i % 5) * 50}ms`);
    });

    document.documentElement.classList.add("motion-ready");
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

    revealTargets.forEach(el => revealObserver.observe(el));
  }

  // Scroll Progress and Sticky Liquid Nav Observer
  const progress = $("[data-scroll-progress]"), header = $(".site-header");
  let scrollTicking = false;

  function updateScroll() {
    scrollTicking = false;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) {
      progress.style.width = `${maxScroll > 0 ? Math.min(100, (window.scrollY / maxScroll) * 100) : 0}%`;
    }
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    }
  }

  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  updateScroll();

  // Active section indicator in Nav
  if ("IntersectionObserver" in window && nav) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const link = nav.querySelector(`a[href="#${entry.target.id}"]`);
        if (link) {
          nav.querySelectorAll("a").forEach(a => a.removeAttribute("aria-current"));
          link.setAttribute("aria-current", "location");
        }
      });
    }, { rootMargin: "-30% 0px -55% 0px" });

    nav.querySelectorAll('a[href^="#"]').forEach(a => {
      const section = $(a.getAttribute("href"));
      if (section) sectionObserver.observe(section);
    });
  }

  // Initial cart render
  renderCart();
})();
