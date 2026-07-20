/* Renders the home-page resource cards from COURSE_CONFIG.resourceCards.
   Loaded after config.js. Each page calls:
     renderResourceCards(CFG.resourceCards);
   which fills <div id="resourceCards"></div>.
   Styling matches the hand-built cards (theme variables, hover .qlink). */
(function () {
  var ICONS = {
    link:      '<path d="M10 14a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1M14 10a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1" style="stroke:var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    shield:    '<path d="M12 2l8 4.6v9.2L12 22 4 15.8V6.6L12 2z" style="stroke:var(--accent)" stroke-width="1.6" stroke-linejoin="round"/><path d="M15 9.2a3.5 3.5 0 100 5.6" style="stroke:var(--accent)" stroke-width="1.6" stroke-linecap="round"/>',
    graph:     '<circle cx="5" cy="12" r="2.2" style="stroke:var(--accent)" stroke-width="1.6"/><circle cx="18" cy="6" r="2.2" style="stroke:var(--accent)" stroke-width="1.6"/><circle cx="18" cy="18" r="2.2" style="stroke:var(--accent)" stroke-width="1.6"/><path d="M7 11l9-4M7 13l9 4" style="stroke:var(--accent)" stroke-width="1.6" stroke-linecap="round"/>',
    flag:      '<path d="M6 3v18" style="stroke:var(--accent)" stroke-width="1.6" stroke-linecap="round"/><path d="M6 4h11l-2.5 3.5L17 11H6" style="stroke:var(--accent)" stroke-width="1.6" stroke-linejoin="round"/>',
    video:     '<rect x="3" y="5" width="18" height="14" rx="2" style="stroke:var(--accent)" stroke-width="1.6"/><path d="M10 9.2l5 2.8-5 2.8z" fill="var(--accent)"/>',
    book:      '<path d="M12 4L3 8l9 4 9-4-9-4z" style="stroke:var(--accent)" stroke-width="1.6" stroke-linejoin="round"/><path d="M7 10.5V15c0 1.1 2.2 2 5 2s5-.9 5-2v-4.5" style="stroke:var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    exam:      '<path d="M9 11l2 2 4-4" style="stroke:var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 4h14v16l-7-3-7 3z" style="stroke:var(--accent)" stroke-width="1.6" stroke-linejoin="round"/>',
    code:      '<path d="M9 8l-5 4 5 4M15 8l5 4-5 4" style="stroke:var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    classroom: '<path d="M4 5h7v14H4zM13 5h7v14h-7z" style="stroke:var(--accent)" stroke-width="1.6" stroke-linejoin="round"/>',
    doc:       '<path d="M7 3h7l4 4v14H7zM14 3v4h4" style="stroke:var(--accent)" stroke-width="1.6" stroke-linejoin="round"/>',
    diamond:   '<path d="M12 2l7 10-7 4-7-4 7-10zM5 13l7 4 7-4-7 9-7-9z" style="stroke:var(--accent)" stroke-width="1.4" stroke-linejoin="round"/>',
    bitcoin:   '<circle cx="12" cy="12" r="9" style="stroke:var(--accent)" stroke-width="1.5"/><path d="M9.5 8h4a2 2 0 010 4h-4m0 0h4.3a2 2 0 010 4H9.5m0-8v10M11 6v2m0 8v2" style="stroke:var(--accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function iconBox(name) {
    var p = ICONS[name] || ICONS.link;
    return '<span style="flex:none;width:42px;height:42px;border-radius:9px;background:var(--panel2);border:1px solid var(--border3);display:flex;align-items:center;justify-content:center;">'
      + '<svg width="22" height="22" viewBox="0 0 24 24" fill="none">' + p + '</svg></span>';
  }

  function itemHTML(r) {
    return '<a class="qlink" href="' + esc(r.url) + '" target="_blank" rel="noopener" '
      + 'style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--bg);border:1px solid var(--border2);border-radius:10px;">'
      + iconBox(r.icon)
      + '<span style="display:flex;flex-direction:column;gap:2px;">'
      + '<span style="font-size:15px;font-weight:600;color:var(--bright);">' + esc(r.name) + '</span>'
      + (r.desc ? '<span style="font-size:12px;color:var(--dim);">' + esc(r.desc) + '</span>' : '')
      + '</span>'
      + '<span class="mono" style="margin-left:auto;color:var(--faint);font-size:13px;">&nearr;</span></a>';
  }

  window.renderResourceCards = function (cards, mountId) {
    var el = document.getElementById(mountId || 'resourceCards');
    if (!el || !Array.isArray(cards)) return;
    el.innerHTML = cards.map(function (card) {
      var items = (card.items || []).map(itemHTML).join('')
        || '<div style="padding:14px 16px;background:var(--bg);border:1px solid var(--border2);border-radius:10px;font-size:13px;color:var(--dim);line-height:1.5;">More resources coming soon.</div>';
      return '<div class="card">'
        + '<div class="mono" style="font-size:12px;letter-spacing:1.5px;color:var(--accent);margin-bottom:18px;">// ' + esc(card.title) + '</div>'
        + '<div style="display:flex;flex-direction:column;gap:10px;">' + items + '</div></div>';
    }).join('');
  };
})();
