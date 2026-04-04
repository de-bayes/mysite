(function () {
  'use strict';

  // Command palette (Cmd/Ctrl+K): fuzzy match against INDEX; synonym-expanded queries only add hits at a lower score so literal matches stay on top.
  var siteData = window.SITE_DATA || {};
  var navLinks = siteData.navLinks || [];
  var hostedEssays = siteData.hostedEssays || [];
  var pageEntries = [
    { type: 'Pages', title: 'Home', desc: 'Design, data, and forecasting', url: '/', keys: '' },
  ];

  for (var n = 0; n < navLinks.length; n++) {
    pageEntries.push({
      type: 'Pages',
      title: navLinks[n].label,
      desc: navLinks[n].desc || '',
      url: navLinks[n].href,
      keys: navLinks[n].keys || '',
    });
  }

  var hostedEssayEntries = hostedEssays.map(function (essay) {
    return {
      type: 'Articles',
      title: essay.title,
      desc: essay.desc,
      url: essay.url,
      keys: essay.keys || 'essays',
    };
  });

  var INDEX = [
    // Pages
    ...pageEntries,

    // Articles
    ...hostedEssayEntries,
    {
      type: 'Articles',
      title: 'March 17th Preview: Illinois Primary',
      desc: 'VoteHub',
      url: 'https://votehub.com/2026/03/17/march-17th-preview-illinois-primary/',
      keys: 'elections illinois primary',
    },
    {
      type: 'Articles',
      title: 'Guest Post: ETHS Student on the IL-9 Election',
      desc: 'FOIA Gras',
      url: 'https://foiagras.com/p/il9-org-guest-post',
      keys: 'elections il9 prediction markets',
    },
    {
      type: 'Articles',
      title: 'ETHS Students Reflect on Casting First Ballots',
      desc: 'The Daily Northwestern',
      url: 'https://dailynorthwestern.com/2026/03/11/top-stories/eths-students-reflect-on-casting-first-ballots-in-congressional-primary/',
      keys: 'elections voting',
    },
    {
      type: 'Articles',
      title: 'Students Reflect on Casting First Ballots in Congressional Primary',
      desc: 'The Evanstonian',
      url: 'https://www.evanstonian.net/news/2026/03/11/students-reflect-on-casting-first-ballots-in-congressional-primary/',
      keys: 'elections voting',
    },
    {
      type: 'Articles',
      title: 'D202 Board Confronts Deficit, Improves Sustainability',
      desc: 'The Evanstonian',
      url: 'https://www.evanstonian.net/news/2026/02/27/school-board-confronts-4-2-million-deficit-while-advancing-sustainability-initiatives/',
      keys: 'education',
    },
    {
      type: 'Articles',
      title: 'District 65 Board Remains at Impasse Over Salem Replacement',
      desc: 'The Evanstonian',
      url: 'https://www.evanstonian.net/news/2026/01/23/district-65-board-remains-at-impasse-over-salem-replacement/',
      keys: 'education',
    },
    {
      type: 'Articles',
      title: 'Finals Return with Familiar 10% Weight',
      desc: 'The Evanstonian',
      url: 'https://www.evanstonian.net/news/2025/12/12/finals-return-with-familiar-10-weight/',
      keys: 'education',
    },
    {
      type: 'Articles',
      title: 'Democratic Candidates Battle for Lead in IL-9 Primary',
      desc: 'The Evanstonian',
      url: 'https://www.evanstonian.net/news/2025/11/21/democratic-candidates-battle-for-lead-in-illinois-ninth-congressional-district-primary/',
      keys: 'elections',
    },
    {
      type: 'Articles',
      title: 'Kits on the Rise: Field Hockey and Swim & Dive Eye State Success',
      desc: 'The Evanstonian',
      url: 'https://www.evanstonian.net/sports/2025/10/24/kits-on-the-rise-field-hockey-and-swim-dive-eye-state-success/',
      keys: 'sports swimming',
    },
    {
      type: 'Articles',
      title: 'Equity or Exclusion? District 65 Draws a Federal Eye',
      desc: 'The Evanstonian',
      url: 'https://www.evanstonian.net/opinion/2025/09/19/equity-or-exclusion-district-65-draws-a-federal-eye/',
      keys: 'education',
    },
    {
      type: 'Articles',
      title: "Top 4 Candidates in Illinois' 9th Congressional District Race",
      desc: 'The Evanstonian',
      url: 'https://www.evanstonian.net/news/2025/08/15/top-4-candidates-in-illinois-9th-congressional-district-race/',
      keys: 'elections',
    },
    {
      type: 'Articles',
      title: 'Contentious Races Decided in Evanston',
      desc: 'The Evanstonian',
      url: 'https://www.evanstonian.net/news/2025/04/17/contentious-races-decided-in-evanston/',
      keys: 'elections',
    },
    {
      type: 'Articles',
      title: '$2.5 Million Donation Added to the Auditorium Renovations',
      desc: 'The Evanstonian',
      url: 'https://www.evanstonian.net/news/2025/03/14/2-5-million-dollar-donation-added-to-the-auditorium-renovations/',
      keys: 'education',
    },
    {
      type: 'Articles',
      title: "Evanston's Mayoral Race: Biss vs. Boarini",
      desc: 'The Evanstonian',
      url: 'https://www.evanstonian.net/news/2025/02/14/evanston-mayoral-race/',
      keys: 'elections',
    },

    // Press
    {
      type: 'Press',
      title: 'The Open Seat: ETHS Sophomore Aims to Predict Congressional Race',
      desc: 'The Daily Northwestern Podcast',
      url: 'https://podcasts.apple.com/ru/podcast/the-open-seat-eths-sophomore-aims-to-predict/id1156168384?i=1000751106803',
      keys: 'il9cast',
    },
    {
      type: 'Press',
      title: 'IL9Cast Featured as Novel Local Forecasting Tool',
      desc: 'Capitol Fax',
      url: 'https://capitolfax.com/2026/02/09/catching-up-with-the-federal-candidates-35/',
      keys: 'il9cast',
    },
    {
      type: 'Press',
      title: 'ETHS Student Aims to Forecast 9th District Congressional Race',
      desc: 'Evanston Roundtable',
      url: 'https://evanstonroundtable.com/2026/02/10/eths-student-aims-to-forecast-9th-district-congressional-race-using-betting-market-data/',
      keys: 'il9cast prediction markets',
    },

    // Projects
    {
      type: 'Projects',
      title: 'IL9Cast',
      desc: 'Forecasting aggregator for the IL-9 Democratic primary',
      url: 'https://il9.org',
      keys: 'prediction markets polling elections',
    },
    {
      type: 'Projects',
      title: 'Project 2028 Podcast',
      desc: 'Politics and policy podcast reaching 50+ countries',
      url: 'https://podcasts.apple.com/us/podcast/project-2028/id1753137875',
      keys: 'podcast politics',
    },
    {
      type: 'Projects',
      title: 'ManiFed Markets & Manifold Trading',
      desc: 'Play-money peer-to-peer lending platform with trading bots',
      url: 'https://manifold.markets/JeromeHPowell',
      keys: 'prediction markets trading kelly criterion',
    },
    {
      type: 'Projects',
      title: 'Political Science & Policy Project',
      desc: 'Blog covering game theory, constitutional law, and voting theory',
      url: '/experience',
      keys: 'blog pspp',
    },

    // Experience
    {
      type: 'Experience',
      title: 'Student Fellow, Data Science & Decision Desk',
      desc: 'VoteHub',
      url: '/experience',
      keys: 'kalshi forecasting midterms',
    },
    {
      type: 'Experience',
      title: 'Founder & Data Scientist',
      desc: 'IL9Cast',
      url: '/experience',
      keys: 'forecasting prediction markets polling',
    },
    {
      type: 'Experience',
      title: 'Volunteer Finance Lead',
      desc: 'Daniel Biss for Congress (IL-9)',
      url: '/experience',
      keys: 'campaign finance',
    },
    {
      type: 'Experience',
      title: 'Sports Photographer',
      desc: 'Chicago Union (UFA)',
      url: '/experience',
      keys: 'photography ultimate frisbee canon',
    },
    {
      type: 'Experience',
      title: 'ManiFed Markets & Manifold Trading',
      desc: 'Play-money lending platform with trading bots',
      url: '/experience',
      keys: 'prediction markets trading kelly criterion',
    },
    {
      type: 'Experience',
      title: 'Founder & Host',
      desc: 'Project 2028 Podcast',
      url: '/experience',
      keys: 'podcast politics',
    },
  ];

  // Pre-compute searchable data
  INDEX.forEach(function (e) {
    e._text = (e.title + ' ' + e.desc + ' ' + e.keys).toLowerCase();
    e._titleLower = e.title.toLowerCase();
    e._words = e._text.match(/[a-z0-9]+/g) || [];
    e._titleWords = e._titleLower.match(/[a-z0-9]+/g) || [];
  });

  // --- Recent items (localStorage) ---
  var RECENT_KEY = 'cmdk-recent';

  function getRecent() {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    } catch {
      return [];
    }
  }

  function addRecent(url) {
    var recent = getRecent().filter(function (u) {
      return u !== url;
    });
    recent.unshift(url);
    if (recent.length > 5) recent = recent.slice(0, 5);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    } catch {
      void 0;
    }
  }

  // --- Damerau-Levenshtein edit distance ---
  function editDist(a, b) {
    if (a === b) return 0;
    var m = a.length,
      n = b.length;
    if (Math.abs(m - n) > 2) return 99;
    var d = [];
    for (var i = 0; i <= m; i++) {
      d[i] = [];
      for (var j = 0; j <= n; j++) {
        if (i === 0) {
          d[0][j] = j;
        } else if (j === 0) {
          d[i][0] = i;
        } else {
          var cost = a[i - 1] === b[j - 1] ? 0 : 1;
          d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
          // Transposition
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
      }
    }
    return d[m][n];
  }

  // --- Match a single query word against an entry ---
  // Returns { quality: 1-3, inTitle: bool } or null
  function matchQueryWord(qw, entry) {
    // Strategy 1: substring in full text (best quality)
    if (entry._text.indexOf(qw) !== -1) {
      return { quality: 3, inTitle: entry._titleLower.indexOf(qw) !== -1 };
    }

    // Strategy 2: shared prefix with a text word
    var minOverlap = Math.max(3, Math.ceil(qw.length * 0.6));
    for (let i = 0; i < entry._words.length; i++) {
      const tw = entry._words[i];
      var overlap = 0;
      var limit = Math.min(qw.length, tw.length);
      while (overlap < limit && qw[overlap] === tw[overlap]) overlap++;
      if (overlap >= minOverlap) {
        var titleHit = false;
        for (let t = 0; t < entry._titleWords.length; t++) {
          const ttw = entry._titleWords[t];
          var ov = 0,
            lim = Math.min(qw.length, ttw.length);
          while (ov < lim && qw[ov] === ttw[ov]) ov++;
          if (ov >= minOverlap) {
            titleHit = true;
            break;
          }
        }
        return { quality: 2, inTitle: titleHit };
      }
    }

    // Strategy 3: edit distance (typo tolerance)
    var maxDist = qw.length <= 3 ? 0 : qw.length <= 5 ? 1 : 2;
    if (maxDist === 0) return null;
    var bestDist = 99;
    for (let i = 0; i < entry._words.length; i++) {
      const tw = entry._words[i];
      if (tw.length < 3 || Math.abs(qw.length - tw.length) > maxDist) continue;
      var d = editDist(qw, tw);
      if (d < bestDist) bestDist = d;
      if (d === 0) break;
    }
    if (bestDist <= maxDist) {
      var titleFuzzy = false;
      for (let t = 0; t < entry._titleWords.length; t++) {
        const ttw = entry._titleWords[t];
        if (ttw.length < 3 || Math.abs(qw.length - ttw.length) > maxDist) continue;
        if (editDist(qw, ttw) <= maxDist) {
          titleFuzzy = true;
          break;
        }
      }
      return { quality: 1, inTitle: titleFuzzy };
    }

    // Strategy 4: typo in prefix of a longer word (e.g. "forcast" vs "forecasting")
    for (let i = 0; i < entry._words.length; i++) {
      const tw = entry._words[i];
      if (tw.length <= qw.length) continue;
      var prefix = tw.substring(0, qw.length);
      if (editDist(qw, prefix) <= maxDist) {
        var titlePrefix = false;
        for (let t = 0; t < entry._titleWords.length; t++) {
          const ttw = entry._titleWords[t];
          if (ttw.length <= qw.length) continue;
          if (editDist(qw, ttw.substring(0, qw.length)) <= maxDist) {
            titlePrefix = true;
            break;
          }
        }
        return { quality: 1, inTitle: titlePrefix };
      }
    }

    return null;
  }

  // --- Score an entry against a full query ---
  function scoreEntry(query, entry) {
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return null;

    var totalQuality = 0;
    var titleHits = 0;

    for (var i = 0; i < words.length; i++) {
      var m = matchQueryWord(words[i], entry);
      if (!m) return null; // ALL query words must match
      totalQuality += m.quality;
      if (m.inTitle) titleHits++;
    }

    var score = 0;
    var queryLower = query.toLowerCase().trim();

    // Full-query bonuses
    if (entry._titleLower === queryLower) score += 1000;
    else if (entry._titleLower.indexOf(queryLower) === 0) score += 500;
    else if (entry._titleLower.indexOf(queryLower) !== -1) score += 300;

    // Match quality + title hit bonuses
    score += totalQuality * 40;
    score += titleHits * 80;

    // Per-word position bonuses for title substring matches
    for (var j = 0; j < words.length; j++) {
      var pos = entry._titleLower.indexOf(words[j]);
      if (pos !== -1) {
        if (pos === 0 || ' -/\'":.'.indexOf(entry._titleLower[pos - 1]) !== -1) score += 50;
        score += Math.max(0, 30 - pos);
      }
    }

    return { score: score };
  }

  var SYNONYMS = {
    vote: ['election', 'ballot', 'primary', 'race'],
    voting: ['election', 'ballot', 'primary', 'race'],
    elect: ['vote', 'ballot', 'primary', 'race'],
    election: ['vote', 'ballot', 'primary', 'race'],
    elections: ['vote', 'ballot', 'primary', 'race'],
    predict: ['forecast', 'probability', 'projection'],
    prediction: ['forecast', 'probability', 'markets'],
    predictions: ['forecast', 'probability', 'markets'],
    forecast: ['predict', 'probability', 'projection'],
    forecasting: ['predict', 'probability', 'markets'],
    market: ['kalshi', 'manifold', 'prediction', 'forecast', 'betting'],
    markets: ['kalshi', 'manifold', 'prediction', 'forecast', 'betting'],
    il9: ['illinois', '9th', 'congressional', 'district'],
    illinois: ['il9', 'congressional', 'district'],
    primary: ['election', 'vote', 'democrat', 'democratic'],
    democrat: ['democratic', 'primary', 'election'],
    democratic: ['democrat', 'primary', 'election'],
    age: ['generational', 'young', 'youth', 'generation'],
    generational: ['age', 'young', 'youth'],
    data: ['science', 'analysis', 'statistics'],
    photo: ['photography', 'photographer', 'sports'],
    photography: ['photo', 'photographer', 'sports'],
    sports: ['photography', 'ultimate', 'frisbee'],
    podcast: ['project', '2028', 'politics'],
    student: ['eths', 'evanston', 'school', 'fellow'],
    eths: ['evanston', 'school', 'student'],
    evanston: ['eths', 'school', 'student'],
    write: ['essay', 'article', 'writing'],
    writing: ['essay', 'article'],
    essay: ['writing', 'article'],
  };

  function expandQueryWords(query) {
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    var extra = [];
    words.forEach(function (w) {
      var syns = SYNONYMS[w];
      if (syns)
        syns.forEach(function (s) {
          if (words.indexOf(s) === -1 && extra.indexOf(s) === -1) extra.push(s);
        });
    });
    return extra.length ? query + ' ' + extra.join(' ') : query;
  }

  function search(query) {
    if (!query) {
      var recent = getRecent();
      if (recent.length > 0) {
        var recentEntries = [];
        for (var r = 0; r < recent.length; r++) {
          for (var j = 0; j < INDEX.length; j++) {
            if (INDEX[j].url === recent[r]) {
              recentEntries.push({
                type: 'Recent',
                title: INDEX[j].title,
                desc: INDEX[j].desc,
                url: INDEX[j].url,
                keys: INDEX[j].keys,
              });
              break;
            }
          }
        }
        var pages = INDEX.filter(function (e) {
          return e.type === 'Pages';
        });
        return recentEntries.concat(pages);
      }
      return INDEX.filter(function (e) {
        return e.type === 'Pages';
      });
    }

    var expandedQuery = expandQueryWords(query);
    var seen = {};
    var results = [];
    for (var i = 0; i < INDEX.length; i++) {
      var m = scoreEntry(query, INDEX[i]);
      if (m) {
        seen[INDEX[i].url] = true;
        results.push({ entry: INDEX[i], score: m.score });
      }
    }
    if (expandedQuery !== query) {
      for (let ei = 0; ei < INDEX.length; ei++) {
        if (seen[INDEX[ei].url]) continue;
        var me = scoreEntry(expandedQuery, INDEX[ei]);
        if (me) results.push({ entry: INDEX[ei], score: me.score * 0.35 });
      }
    }

    results.sort(function (a, b) {
      return b.score - a.score;
    });
    return results.map(function (r) {
      return r.entry;
    });
  }

  // --- Highlight matched substrings in title (fuzzy-aware) ---
  function highlightTitle(title, query) {
    if (!query) return escapeHtml(title);
    var words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return escapeHtml(title);

    var titleLower = title.toLowerCase();
    var highlight = new Array(title.length);

    for (let w = 0; w < words.length; w++) {
      var qw = words[w];

      // Try 1: substring match in title
      var subPos = titleLower.indexOf(qw);
      if (subPos !== -1) {
        for (let c = subPos; c < subPos + qw.length; c++) highlight[c] = true;
        continue;
      }

      // Try 2: prefix match against title words
      var minOverlap = Math.max(3, Math.ceil(qw.length * 0.6));
      var re = /[a-z0-9]+/g;
      var match,
        found = false;
      while ((match = re.exec(titleLower)) !== null) {
        const tw = match[0];
        var overlap = 0;
        var limit = Math.min(qw.length, tw.length);
        while (overlap < limit && qw[overlap] === tw[overlap]) overlap++;
        if (overlap >= minOverlap) {
          for (let c = match.index; c < match.index + tw.length; c++) highlight[c] = true;
          found = true;
          break;
        }
      }
      if (found) continue;

      // Try 3: edit-distance match; highlight the closest title word
      var maxDist = qw.length <= 3 ? 0 : qw.length <= 5 ? 1 : 2;
      if (maxDist === 0) continue;
      re = /[a-z0-9]+/g;
      var bestDist = 99,
        bestIdx = -1,
        bestLen = 0;
      while ((match = re.exec(titleLower)) !== null) {
        const tw = match[0];
        if (tw.length < 3 || Math.abs(qw.length - tw.length) > maxDist) continue;
        var d = editDist(qw, tw);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = match.index;
          bestLen = tw.length;
        }
      }
      if (bestDist <= maxDist && bestIdx !== -1) {
        for (let c = bestIdx; c < bestIdx + bestLen; c++) highlight[c] = true;
      }
    }

    var html = '';
    var inMatch = false;
    for (var i = 0; i < title.length; i++) {
      if (highlight[i] && !inMatch) {
        html += '<span class="cmdk-match">';
        inMatch = true;
      } else if (!highlight[i] && inMatch) {
        html += '</span>';
        inMatch = false;
      }
      html += escapeHtml(title[i]);
    }
    if (inMatch) html += '</span>';
    return html;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // --- Render ---
  var activeIndex = 0;
  var currentItems = [];
  var currentQuery = '';

  function render(entries) {
    var container = document.getElementById('cmdk-results');
    if (!container) return;

    if (entries.length === 0) {
      container.innerHTML = '<div class="cmdk-empty">No results found</div>';
      currentItems = [];
      return;
    }

    // Group by type, preserving order
    var groups = [];
    var groupMap = {};
    entries.forEach(function (e) {
      if (!groupMap[e.type]) {
        groupMap[e.type] = [];
        groups.push({ type: e.type, items: groupMap[e.type] });
      }
      groupMap[e.type].push(e);
    });

    var html = '';
    var idx = 0;
    groups.forEach(function (g) {
      html += '<div class="cmdk-group">';
      html += '<div class="cmdk-group-label">' + escapeHtml(g.type) + '</div>';
      g.items.forEach(function (e) {
        var isExternal = e.url.indexOf('http') === 0;
        html +=
          '<a class="cmdk-item' +
          (idx === activeIndex ? ' cmdk-active' : '') +
          '"' +
          ' href="' +
          escapeHtml(e.url) +
          '"' +
          ' data-index="' +
          idx +
          '"' +
          (isExternal ? ' target="_blank" rel="noopener"' : '') +
          '>';
        html += '<div class="cmdk-item-main">';
        html +=
          '<span class="cmdk-item-title">' + highlightTitle(e.title, currentQuery) + '</span>';
        html += '<span class="cmdk-item-desc">' + escapeHtml(e.desc) + '</span>';
        html += '</div>';
        if (isExternal) {
          html += '<span class="cmdk-item-arrow">&nearr;</span>';
        } else {
          html += '<span class="cmdk-item-arrow">&rarr;</span>';
        }
        html += '</a>';
        idx++;
      });
      html += '</div>';
    });

    container.innerHTML = html;
    currentItems = container.querySelectorAll('.cmdk-item');

    // Mouse hover sets active
    currentItems.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        setActive(parseInt(item.dataset.index, 10));
      });
    });
  }

  function setActive(idx) {
    if (idx < 0) idx = currentItems.length - 1;
    if (idx >= currentItems.length) idx = 0;
    activeIndex = idx;
    currentItems.forEach(function (item, i) {
      item.classList.toggle('cmdk-active', i === activeIndex);
    });
    // Scroll into view
    if (currentItems[activeIndex]) {
      currentItems[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  // --- Open / close ---
  var overlay, input, hint;
  var isOpen = false;

  function open() {
    if (isOpen) return;
    isOpen = true;
    overlay.classList.add('cmdk-open');
    document.body.classList.add('cmdk-body-lock');
    if (hint) hint.classList.remove('cmdk-hint-visible');
    input.value = '';
    currentQuery = '';
    activeIndex = 0;
    render(search(''));
    // Focus after short delay to ensure visibility transition has started
    setTimeout(function () {
      input.focus();
    }, 50);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove('cmdk-open');
    document.body.classList.remove('cmdk-body-lock');
    if (hint) hint.classList.add('cmdk-hint-visible');
  }

  function toggle() {
    if (isOpen) close();
    else open();
  }

  function navigateTo(href) {
    addRecent(href);
    var isExternal = href.indexOf('http') === 0;
    close();
    if (isExternal) {
      window.open(href, '_blank');
    } else {
      document.body.classList.add('page-exit');
      setTimeout(function () {
        window.location.href = href;
      }, 160);
    }
  }

  // --- Init ---
  document.addEventListener('DOMContentLoaded', function () {
    // Inject DOM
    var el = document.createElement('div');
    el.className = 'cmdk-overlay';
    el.id = 'cmdk-overlay';
    el.innerHTML =
      '<div class="cmdk-dialog">' +
      '<div class="cmdk-input-wrap">' +
      '<svg class="cmdk-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
      '<input type="text" class="cmdk-input" placeholder="Search pages, articles, projects..." />' +
      '<kbd class="cmdk-kbd">ESC</kbd>' +
      '</div>' +
      '<div class="cmdk-results" id="cmdk-results"></div>' +
      '<div class="cmdk-footer">' +
      '<span><kbd>&uarr;</kbd><kbd>&darr;</kbd> Navigate</span>' +
      '<span><kbd>&crarr;</kbd> Open</span>' +
      '<span><kbd>esc</kbd> Close</span>' +
      '</div>' +
      '</div>';
    document.body.appendChild(el);

    overlay = document.getElementById('cmdk-overlay');
    input = overlay.querySelector('.cmdk-input');

    // Click backdrop to close
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    // Input handler
    input.addEventListener('input', function () {
      currentQuery = input.value.trim();
      activeIndex = 0;
      render(search(currentQuery));
    });

    // Keyboard within dialog
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive(activeIndex - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentItems[activeIndex]) {
          navigateTo(currentItems[activeIndex].getAttribute('href'));
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    });

    // Global Cmd+K / Ctrl+K
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    });

    // --- "Press ⌘K to search" hint (inlined in nav HTML) ---
    // Prefer Client Hints platform when present; legacy navigator.platform is frozen and a weak signal on some OS builds.
    var platform =
      (navigator.userAgentData && navigator.userAgentData.platform) ||
      navigator.platform ||
      navigator.userAgent;
    var isMac = /Mac|iPhone|iPad|iPod/i.test(platform);
    hint = document.getElementById('cmdk-hint');
    if (hint) {
      if (!isMac) hint.innerHTML = '<kbd>Ctrl+K</kbd> Search';
      hint.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        open();
      });
    }
  });
})();
