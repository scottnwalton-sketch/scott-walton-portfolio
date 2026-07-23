var Site = (function(){
  "use strict";

  var PLAY_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M8 5v14l11-7z"/></svg>';
  var EXTERNAL_ICON = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M7 17L17 7M9 7h8v8"/></svg>';

  function thumbBox(id){
    return '<div class="thumb-box">' +
      '<img src="https://img.youtube.com/vi/' + id + '/hqdefault.jpg" alt="" loading="lazy" ' +
      'onerror="this.parentElement.classList.add(\'thumb-fallback\')">' +
      '<div class="play-badge"><span>' + PLAY_ICON + '</span></div>' +
    '</div>';
  }

  function renderLongForm(containerId, items){
    var container = document.getElementById(containerId);
    if (!container) return;

    var featured = items.filter(function(v){ return v.featured; })[0];
    var rest = items.filter(function(v){ return !v.featured; });

    if (featured) {
      var feat = document.createElement("a");
      feat.href = featured.url;
      feat.className = "lf-featured";
      feat.setAttribute("data-video-id", featured.id);
      feat.setAttribute("data-reveal", "");
      feat.innerHTML = thumbBox(featured.id) +
        '<div class="card-title"><span class="kicker">Featured</span><h3>' + featured.title + '</h3></div>';
      container.appendChild(feat);
    }

    if (rest.length) {
      var grid = document.createElement("div");
      grid.className = "card-grid cols-4";
      rest.forEach(function(v, i){
        var card = document.createElement("a");
        card.href = v.url;
        card.className = "video-card";
        card.setAttribute("data-video-id", v.id);
        card.setAttribute("data-reveal", "");
        card.style.transitionDelay = (i * 40) + "ms";
        card.innerHTML = thumbBox(v.id) + '<div class="card-title"><h3>' + v.title + '</h3></div>';
        grid.appendChild(card);
      });
      container.appendChild(grid);
    }
  }

  function renderShortForm(containerId, items){
    var container = document.getElementById(containerId);
    if (!container) return;
    items.forEach(function(v, i){
      var card = document.createElement("a");
      card.href = v.url;
      card.target = "_blank";
      card.rel = "noopener";
      card.className = "reel-card";
      card.setAttribute("data-reveal", "");
      card.style.transitionDelay = (i * 40) + "ms";
      card.innerHTML =
        '<div class="reel-top"><span class="reel-tag">Reel</span></div>' +
        '<div class="reel-bottom"><h3>' + v.title + '</h3><span class="link-row">' + EXTERNAL_ICON + ' Instagram</span></div>';
      container.appendChild(card);
    });
  }

  function renderCommercial(containerId, items){
    var container = document.getElementById(containerId);
    if (!container) return;

    var byClient = [];
    items.forEach(function(item){
      var group = byClient.filter(function(g){ return g.client === item.client; })[0];
      if (!group) { group = { client:item.client, items:[] }; byClient.push(group); }
      group.items.push(item);
    });

    byClient.forEach(function(group){
      var wrap = document.createElement("div");
      wrap.className = "client-group";
      wrap.setAttribute("data-reveal", "");

      var name = document.createElement("h3");
      name.className = "client-name";
      name.textContent = group.client;
      wrap.appendChild(name);

      var list = document.createElement("div");
      list.className = "campaign-list";
      group.items.forEach(function(item){
        var row = document.createElement("a");
        row.href = item.url;
        row.target = "_blank";
        row.rel = "noopener";
        row.className = "campaign-row";
        row.innerHTML =
          '<span class="label">' + item.label + '</span>' +
          '<span class="platform">' + EXTERNAL_ICON + ' Instagram</span>';
        list.appendChild(row);
      });
      wrap.appendChild(list);
      container.appendChild(wrap);
    });
  }

  function initModal(){
    var modal = document.getElementById("video-modal");
    if (!modal) return;
    var iframe = document.getElementById("video-modal-iframe");
    var closeBtn = document.getElementById("video-modal-close");
    var lastFocused = null;

    function openModal(id, triggerEl){
      lastFocused = triggerEl || document.activeElement;
      iframe.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0";
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      closeBtn.focus();
      document.addEventListener("keydown", onKeydown);
    }
    function closeModal(){
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      iframe.src = "";
      document.removeEventListener("keydown", onKeydown);
      if (lastFocused) lastFocused.focus();
    }
    function onKeydown(e){ if (e.key === "Escape") closeModal(); }

    document.querySelectorAll("[data-video-id]").forEach(function(el){
      el.addEventListener("click", function(e){
        e.preventDefault();
        openModal(el.getAttribute("data-video-id"), el);
      });
    });
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", function(e){
      if (e.target === modal) closeModal();
    });
  }

  function initReveal(){
    if ("IntersectionObserver" in window) {
      var revealIO = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealIO.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll("[data-reveal]").forEach(function(el){ revealIO.observe(el); });
    } else {
      document.querySelectorAll("[data-reveal]").forEach(function(el){ el.classList.add("in-view"); });
    }
  }

  document.addEventListener("DOMContentLoaded", function(){
    initModal();
    initReveal();
  });

  return {
    renderLongForm: renderLongForm,
    renderShortForm: renderShortForm,
    renderCommercial: renderCommercial
  };
})();
