// Writing page — filter and card navigation
document.addEventListener('DOMContentLoaded', () => {
  const getGrid = () => document.getElementById('writing-grid');
  const grid = getGrid();
  const filterTabs = document.querySelectorAll('.filter-tab');
  const tagSelect = document.getElementById('tag-filter');
  const publicationSelect = document.getElementById('publication-filter');
  if (!grid || !filterTabs.length) return;

  // Sort cards newest-first on load
  sortCardsNewest();

  // Count items per category and update tab labels
  updateFilterCounts();
  populatePublicationOptions();

  function applyFilters() {
    const activeTab = document.querySelector('.filter-tab.active');
    const category = (activeTab && activeTab.dataset.category) ? activeTab.dataset.category : 'all';
    const currentTagSelect = document.getElementById('tag-filter');
    const currentPublicationSelect = document.getElementById('publication-filter');
    const tag = currentTagSelect && currentTagSelect.value ? currentTagSelect.value : 'all';
    const publication = currentPublicationSelect && currentPublicationSelect.value ? currentPublicationSelect.value : 'all';

    document.querySelectorAll('.writing-card-outline').forEach(outline => {
      const card = outline.querySelector('.writing-card');
      if (!card) return;
      const cardCategory = (card.dataset.category || '').trim();
      const cardTags = (card.dataset.tags || '').split(',').map(t => t.trim()).filter(Boolean);
      const cardPublication = (card.dataset.publication || '').trim();
      const categoryMatch = category === 'all' || cardCategory === category;
      const tagMatch = tag === 'all' || cardTags.includes(tag);
      const publicationMatch = publication === 'all' || cardPublication === publication;
      outline.style.display = categoryMatch && tagMatch && publicationMatch ? '' : 'none';
    });
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      applyFilters();
    });
  });

  if (tagSelect) {
    tagSelect.addEventListener('change', applyFilters);
  }

  if (publicationSelect) {
    publicationSelect.addEventListener('change', applyFilters);
  }

  // Bind click handlers on static cards
  bindCardClicks();


  function parseCardDate(str) {
    if (!str) return new Date(0);
    if (/^\d{4}-\d{2}$/.test(str)) str = str + '-01';
    return new Date(str);
  }

  function sortCardsNewest() {
    const gridEl = getGrid();
    if (!gridEl) return;
    const outlines = Array.from(gridEl.querySelectorAll('.writing-card-outline'));
    outlines.sort((a, b) => {
      const cardA = a.querySelector('.writing-card');
      const cardB = b.querySelector('.writing-card');
      const da = parseCardDate(cardA && cardA.dataset.date);
      const db = parseCardDate(cardB && cardB.dataset.date);
      return db - da;
    });
    outlines.forEach(outline => gridEl.appendChild(outline));
  }

  function updateFilterCounts() {
    const cards = Array.from(document.querySelectorAll('.writing-card'));
    const categoryCounts = { all: cards.length };
    cards.forEach(card => {
      const cat = (card.dataset.category || '').trim();
      if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const labels = { all: 'All', essays: 'Essays', articles: 'Articles' };
    document.querySelectorAll('.filter-tab').forEach(tab => {
      const category = tab.dataset.category;
      const label = labels[category] || category;
      const count = categoryCounts[category] ?? 0;
      tab.textContent = `${label} (${count})`;
    });
  }

  function populatePublicationOptions() {
    const select = document.getElementById('publication-filter');
    if (!select) return;

    const currentValue = select.value || 'all';
    const publications = Array.from(document.querySelectorAll('.writing-card'))
      .map(card => (card.dataset.publication || '').trim())
      .filter(Boolean);

    const uniquePublications = Array.from(new Set(publications)).sort((a, b) => {
      if (a === 'Personal Site') return -1;
      if (b === 'Personal Site') return 1;
      return a.localeCompare(b);
    });

    select.innerHTML = '<option value="all">All publications</option>';
    uniquePublications.forEach(publication => {
      const option = document.createElement('option');
      option.value = publication;
      option.textContent = publication;
      select.appendChild(option);
    });

    select.value = uniquePublications.includes(currentValue) ? currentValue : 'all';
  }

  function bindCardClicks() {
    const gridEl = getGrid();
    if (!gridEl) return;

    gridEl.querySelectorAll('.writing-card').forEach(card => {
      if (card.dataset.bound) return;
      card.dataset.bound = '1';
      if (!card.querySelector('.writing-card-link')) {
        card.setAttribute('role', 'link');
        card.setAttribute('tabindex', '0');
      }
      card.style.cursor = 'pointer';
      const onActivate = (event) => {
        if (event && event.target.closest('.writing-card-link')) return;
        if (card.dataset.href && card.dataset.href !== '#') {
          window.open(card.dataset.href, '_blank', 'noopener');
          return;
        }
        if (card.dataset.url) {
          showHostedEssay(card.dataset.url);
        }
      };
      card.addEventListener('click', onActivate);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onActivate();
        }
      });

      const link = card.querySelector('.writing-card-link');
      if (link && !link.dataset.bound) {
        link.dataset.bound = '1';
        link.addEventListener('click', (event) => {
          const isModifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
          if (card.dataset.url && !isModifier) {
            event.preventDefault();
            event.stopPropagation();
            showHostedEssay(card.dataset.url);
          } else {
            event.stopPropagation();
          }
        });
      }
    });
  }

  let progressBar = null;
  let progressHandler = null;

  function addProgressBar() {
    removeProgressBar();
    progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    document.body.appendChild(progressBar);

    progressHandler = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        progressBar.style.width = '100%';
        return;
      }
      const pct = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
      progressBar.style.width = pct + '%';
    };

    window.addEventListener('scroll', progressHandler, { passive: true });
    progressHandler();
  }

  function removeProgressBar() {
    if (progressHandler) {
      window.removeEventListener('scroll', progressHandler);
      progressHandler = null;
    }
    if (progressBar) {
      progressBar.remove();
      progressBar = null;
    }
  }

  function performTransition(callback) {
    if (document.startViewTransition) {
      document.startViewTransition(callback);
    } else {
      callback();
    }
  }

  async function showHostedEssay(url) {
    const main = document.querySelector('.writing-page');
    if (!main) {
      window.location.href = url;
      return;
    }

    const prevHTML = main.innerHTML;

    try {
      const response = await fetch(url, { credentials: 'same-origin' });
      if (!response.ok) throw new Error('Failed to load hosted essay');
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const articleView = doc.querySelector('.article-view');
      if (!articleView) throw new Error('Hosted essay markup missing');

      performTransition(() => {
        main.innerHTML = articleView.outerHTML;

        const backLink = main.querySelector('.back-link');
        if (backLink) {
          backLink.setAttribute('href', '/writing');
          backLink.addEventListener('click', (event) => {
            event.preventDefault();
            performTransition(() => {
              removeProgressBar();
              main.innerHTML = prevHTML;
              rebindEvents();
              window.scrollTo({ top: 0 });
            });
          });
        }

        window.scrollTo({ top: 0 });
        addProgressBar();
      });
    } catch (_error) {
      window.location.href = url;
    }
  }

  function rebindEvents() {
    const gridEl = getGrid();
    const tabs = document.querySelectorAll('.filter-tab');
    const tagSelectEl = document.getElementById('tag-filter');
    const publicationSelectEl = document.getElementById('publication-filter');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        applyFilters();
      });
    });
    if (tagSelectEl) tagSelectEl.addEventListener('change', applyFilters);
    if (publicationSelectEl) publicationSelectEl.addEventListener('change', applyFilters);
    if (gridEl) {
      gridEl.querySelectorAll('.writing-card').forEach(card => delete card.dataset.bound);
    }
    bindCardClicks();
  }
});
