// Objective selector of a declaration, grouped by domain. The bar shows the most detailed
// layout that fits its width: every bullet, else the other domains collapsed to their
// code, else the bullets of the current domain a page at a time.
$(document).ready(function () {
  const nav = document.getElementById("security_objective_selector");
  const carouselEl = document.getElementById("security_objectives_carousel");
  const labelsEl = document.getElementById("so_navigation_labels");
  if (!nav || !carouselEl || !labelsEl) {
    return;
  }

  const SYMBOLS = ["outline-uninitiated", "partially", "passed", "failed"];
  // Widest padding on each side of a domain, in rem: the space between two domains stops growing at twice this.
  const MAX_DOMAIN_PADDING = 2;
  const labels = JSON.parse(labelsEl.textContent);
  const isRegulator = nav.dataset.rule === "regulator";
  const carousel = bootstrap.Carousel.getOrCreateInstance(carouselEl);
  const bullets = Array.from(nav.querySelectorAll(".so-nav-bullet"));
  const domains = Array.from(nav.querySelectorAll(".so-nav-domain")).map(function (element) {
    return {
      element: element,
      toggle: element.querySelector(".so-nav-domain-toggle"),
      bullets: Array.from(element.querySelectorAll(".so-nav-bullet")),
      prev: element.querySelector(".so-nav-page-prev"),
      next: element.querySelector(".so-nav-page-next"),
      range: element.querySelector(".so-nav-page-range"),
    };
  });
  const toc = document.getElementById("so_table_of_contents");
  const tocDomains = Array.from(toc.querySelectorAll(".so-toc-domain"));
  const tocObjectives = Array.from(toc.querySelectorAll(".so-toc-objective"));
  const tocGroups = tocDomains.map(function (tocDomain) {
    return Array.from(tocDomain.querySelectorAll(".so-toc-objective")).map(slideIndex);
  });

  let activeIndex = Array.from(carouselEl.querySelectorAll(".carousel-item")).findIndex(function (item) {
    return item.classList.contains("active");
  });
  let pageSize = null;
  let pageStart = 0;
  let focusActiveBullet = false;
  let lastWidth = null;

  if (!bullets.length) {
    return;
  }

  function slideIndex(element) {
    return Number(element.dataset.bsSlideTo ?? element.dataset.slideTo);
  }

  function symbolOf(element) {
    return SYMBOLS.find(function (symbol) {
      return element.classList.contains("btn-" + symbol);
    });
  }

  function setSymbol(element, symbol) {
    SYMBOLS.forEach(function (candidate) {
      element.classList.remove("btn-" + candidate);
    });
    element.classList.add("btn-" + symbol);
  }

  // Same rules as get_domain_symbol in securityobjectives/helpers.py.
  function domainSymbol(symbols) {
    if (isRegulator) {
      if (symbols.includes("partially")) return "partially";
      if (symbols.includes("failed")) return "failed";
      return "passed";
    }
    if (symbols.includes("failed")) return "failed";
    if (symbols.every(function (symbol) { return symbol === "passed"; })) return "passed";
    if (symbols.every(function (symbol) { return symbol === "outline-uninitiated"; })) return "outline-uninitiated";
    return "partially";
  }

  // Same rule as is_objective_open in securityobjectives/helpers.py.
  function isOpen(symbol) {
    return isRegulator ? symbol === "partially" : symbol !== "passed";
  }

  function domainOf(index) {
    return domains.find(function (domain) {
      return domain.bullets.some(function (bullet) { return slideIndex(bullet) === index; });
    });
  }

  function symbolTag(symbol) {
    const span = document.createElement("span");
    span.className = "btn rounded-circle slide-selector-container so-nav-symbol btn-" + symbol;
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  function countsList(symbols) {
    const list = document.createElement("ul");
    list.className = "list-unstyled m-0 small";
    Object.keys(labels.symbols).forEach(function (symbol) {
      const count = symbols.filter(function (candidate) { return candidate === symbol; }).length;
      if (!count) {
        return;
      }
      const item = document.createElement("li");
      item.className = "d-flex align-items-center gap-2";
      item.append(symbolTag(symbol), labels.symbols[symbol] + ": " + count);
      list.append(item);
    });
    return list;
  }

  function domainTooltip(domain) {
    const content = document.createElement("div");
    content.className = "text-start";
    const title = document.createElement("div");
    title.className = "fw-bold";
    title.textContent = domain.element.dataset.domainCode + " · " + domain.element.dataset.domainLabel;
    const range = document.createElement("div");
    range.className = "small mb-1";
    range.textContent = domain.element.dataset.domainRange;
    content.append(title, range, countsList(domain.bullets.map(symbolOf)));
    return content;
  }

  function refresh() {
    const symbols = bullets.map(symbolOf);

    tocObjectives.forEach(function (button) {
      setSymbol(button.querySelector(".so-nav-symbol"), symbols[slideIndex(button)]);
    });

    tocDomains.forEach(function (tocDomain, position) {
      const domainSymbols = tocGroups[position].map(function (index) { return symbols[index]; });
      const symbol = domainSymbol(domainSymbols);
      const done = domainSymbols.filter(function (candidate) { return labels.done_symbols.includes(candidate); }).length;
      setSymbol(tocDomain.querySelector("summary .so-nav-symbol"), symbol);
      tocDomain.querySelector(".so-toc-progress").textContent = done + "/" + domainSymbols.length;

      const domain = domains[position];
      if (domain) {
        domain.element.querySelectorAll(".so-nav-domain-toggle .so-nav-symbol, .so-nav-domain-code .so-nav-symbol").forEach(function (element) {
          setSymbol(element, symbol);
        });
        domain.toggle.setAttribute("aria-label", interpolate(labels.progress, {
          code: domain.element.dataset.domainCode,
          label: domain.element.dataset.domainLabel,
          done: done,
          total: domainSymbols.length,
        }, true));
      }
    });

    document.getElementById("so_toc_totals").replaceChildren(...countsList(symbols).children);
  }

  function markActive() {
    bullets.forEach(function (bullet) {
      const isActive = slideIndex(bullet) === activeIndex;
      bullet.classList.toggle("slide-active-container", isActive);
      if (isActive) {
        bullet.setAttribute("aria-current", "step");
      } else {
        bullet.removeAttribute("aria-current");
      }
    });
  }

  function showPage(domain) {
    domain.bullets.forEach(function (bullet, position) {
      const onPage = pageSize === null || (position >= pageStart && position < pageStart + pageSize);
      bullet.classList.toggle("so-nav-off-page", !onPage);
    });
    domain.prev.disabled = pageSize === null || pageStart === 0;
    domain.next.disabled = pageSize === null || pageStart + pageSize >= domain.bullets.length;
    if (pageSize !== null) {
      const shown = domain.bullets.slice(pageStart, pageStart + pageSize);
      domain.range.textContent = shown[0].textContent.trim() + "–" + shown[shown.length - 1].textContent.trim();
    }
  }

  // The frame keeps the width of its widest page, so turning a page moves nothing.
  function keepPageWidth(domain) {
    let widest = 0;
    for (pageStart = 0; pageStart < domain.bullets.length; pageStart += pageSize) {
      showPage(domain);
      widest = Math.max(widest, domain.element.offsetWidth);
    }
    domain.element.style.minWidth = widest + "px";
  }

  function pageContaining(domain, index) {
    const position = domain.bullets.findIndex(function (bullet) { return slideIndex(bullet) === index; });
    return Math.floor(Math.max(position, 0) / pageSize) * pageSize;
  }

  function fits() {
    return nav.scrollWidth <= nav.clientWidth;
  }

  function setMode(collapsed, paged) {
    nav.classList.toggle("so-nav-collapsed", collapsed);
    nav.classList.toggle("so-nav-paged", paged);
  }

  // Each layout is tried from the most detailed one down, from measured widths only, so
  // a given width always gives the same layout and the bar cannot flicker between two.
  function layout() {
    if (!domains.length || nav.clientWidth === 0) {
      return;
    }
    const active = domainOf(activeIndex);
    domains.forEach(function (domain) {
      domain.element.classList.toggle("so-nav-domain-active", domain === active);
    });

    pageSize = null;
    domains.forEach(function (domain) {
      domain.element.style.minWidth = "";
      showPage(domain);
    });
    nav.style.removeProperty("--so-nav-domain-padding");
    setMode(false, false);
    if (fits()) {
      spreadDomains();
    } else {
      setMode(true, false);
    }
    if (!fits()) {
      setMode(true, true);
      let fitting = Math.max(active.bullets.length - 1, 1);
      for (;;) {
        pageSize = fitting;
        pageStart = pageContaining(active, activeIndex);
        showPage(active);
        if (fits() || fitting === 1) {
          break;
        }
        fitting--;
      }
      // Pages of equal size, so the last one is not left nearly empty.
      pageSize = Math.ceil(active.bullets.length / Math.ceil(active.bullets.length / fitting));
      keepPageWidth(active);
      pageStart = pageContaining(active, activeIndex);
      showPage(active);
    }
    updateTabStops();
  }

  // The width the bullets leave goes between the domains, up to a cap, so a wide bar
  // keeps them apart without scattering them; the bar is centred in what remains.
  function spreadDomains() {
    if (domains.length < 2) {
      return;
    }
    const style = getComputedStyle(nav);
    const available = nav.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const first = domains[0].element;
    const last = domains[domains.length - 1].element;
    const used = last.offsetLeft + last.offsetWidth - first.offsetLeft;
    const padding = parseFloat(getComputedStyle(domains[1].element).paddingLeft);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const widened = padding + (available - used) / (2 * (domains.length - 1));
    nav.style.setProperty("--so-nav-domain-padding", Math.floor(Math.min(widened, MAX_DOMAIN_PADDING * rem)) + "px");
  }

  // One tab stop per domain; the arrow keys move between the bullets inside it.
  function updateTabStops() {
    domains.forEach(function (domain) {
      const visible = domain.bullets.filter(function (bullet) {
        return !bullet.classList.contains("so-nav-off-page");
      });
      const stop = visible.find(function (bullet) { return slideIndex(bullet) === activeIndex; }) || visible[0];
      domain.bullets.forEach(function (bullet) {
        bullet.tabIndex = bullet === stop ? 0 : -1;
      });
    });
  }

  function turnPage(domain, start) {
    pageStart = start;
    showPage(domain);
    updateTabStops();
  }

  carouselEl.addEventListener("slide.bs.carousel", function (event) {
    activeIndex = event.to;
    markActive();
    layout();
    if (focusActiveBullet) {
      focusActiveBullet = false;
      bullets[activeIndex].focus();
    }
  });

  domains.forEach(function (domain) {
    new bootstrap.Tooltip(domain.toggle, {
      html: true,
      placement: "bottom",
      title: function () { return domainTooltip(domain); },
    });

    domain.toggle.addEventListener("click", function () {
      bootstrap.Tooltip.getInstance(domain.toggle).hide();
      const target = domain.bullets.find(function (bullet) { return isOpen(symbolOf(bullet)); }) || domain.bullets[0];
      focusActiveBullet = true;
      carousel.to(slideIndex(target));
    });

    domain.prev.addEventListener("click", function () {
      turnPage(domain, Math.max(pageStart - pageSize, 0));
    });
    domain.next.addEventListener("click", function () {
      turnPage(domain, pageStart + pageSize);
    });
  });

  nav.addEventListener("keydown", function (event) {
    const bullet = event.target.closest(".so-nav-bullet");
    const domain = bullet && domainOf(slideIndex(bullet));
    if (!domain) {
      return;
    }
    const position = domain.bullets.indexOf(bullet);
    const target = { ArrowLeft: position - 1, ArrowRight: position + 1, Home: 0, End: domain.bullets.length - 1 }[event.key];
    if (target === undefined || target < 0 || target >= domain.bullets.length) {
      return;
    }
    event.preventDefault();
    if (pageSize !== null && domain.element.classList.contains("so-nav-domain-active")
      && (target < pageStart || target >= pageStart + pageSize)) {
        turnPage(domain, Math.floor(target / pageSize) * pageSize);
      }
    domain.bullets.forEach(function (candidate) {
      candidate.tabIndex = candidate === domain.bullets[target] ? 0 : -1;
    });
    domain.bullets[target].focus();
  });

  tocObjectives.forEach(function (button) {
    button.addEventListener("click", function () {
      bootstrap.Offcanvas.getOrCreateInstance(toc).hide();
      carousel.to(slideIndex(button));
    });
  });

  const tocToggle = document.getElementById("so_toc_toggle_all");

  function updateTocToggle() {
    const allOpen = tocDomains.every(function (tocDomain) { return tocDomain.open; });
    tocToggle.textContent = allOpen ? tocToggle.dataset.collapseLabel : tocToggle.dataset.expandLabel;
    tocToggle.setAttribute("aria-expanded", allOpen);
  }

  if (tocToggle) {
    tocToggle.addEventListener("click", function () {
      const open = !tocDomains.every(function (tocDomain) { return tocDomain.open; });
      tocDomains.forEach(function (tocDomain) {
        tocDomain.open = open;
      });
    });
    tocDomains.forEach(function (tocDomain) {
      tocDomain.addEventListener("toggle", updateTocToggle);
    });
  }

  toc.addEventListener("show.bs.offcanvas", function () {
    tocDomains.forEach(function (tocDomain, position) {
      tocDomain.open = tocGroups[position].includes(activeIndex);
    });
  });

  $(document).on("so:objective-updated", refresh);

  new ResizeObserver(function (entries) {
    const width = entries[0].contentRect.width;
    if (width !== lastWidth) {
      lastWidth = width;
      layout();
    }
  }).observe(nav);

  // Web fonts change the width of the codes once they load.
  $(window).on("load", layout);

  markActive();
  refresh();
  layout();
});
