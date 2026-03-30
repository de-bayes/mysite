// Writing page: filter and card navigation
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

  // Restore filters from URL
  restoreFiltersFromURL();

  function pushFiltersToURL() {
    const activeTab = document.querySelector('.filter-tab.active');
    const category = activeTab ? activeTab.dataset.category : 'all';
    const tag = tagSelect ? tagSelect.value : 'all';
    const publication = publicationSelect ? publicationSelect.value : 'all';
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (tag !== 'all') params.set('tag', tag);
    if (publication !== 'all') params.set('publication', publication);
    const qs = params.toString();
    history.replaceState(null, '', qs ? '?' + qs : location.pathname);
  }

  function restoreFiltersFromURL() {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    const tag = params.get('tag');
    const publication = params.get('publication');
    if (category) {
      filterTabs.forEach(t => {
        t.classList.toggle('active', t.dataset.category === category);
      });
    }
    if (tag && tagSelect) tagSelect.value = tag;
    if (publication && publicationSelect) publicationSelect.value = publication;
    applyFilters();
  }

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

    const visibleCount = document.querySelectorAll('.writing-card-outline[style=""],.writing-card-outline:not([style])').length
      - document.querySelectorAll('.writing-card-outline[style*="none"]').length;
    let empty = document.querySelector('.writing-empty');
    const allHidden = Array.from(document.querySelectorAll('.writing-card-outline')).every(o => o.style.display === 'none');
    if (allHidden) {
      if (!empty) {
        empty = document.createElement('p');
        empty.className = 'writing-empty';
        empty.textContent = 'No articles match these filters.';
        grid.appendChild(empty);
      }
      empty.style.display = '';
    } else if (empty) {
      empty.style.display = 'none';
    }
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      applyFilters();
      pushFiltersToURL();
    });
  });

  if (tagSelect) {
    tagSelect.addEventListener('change', () => { applyFilters(); pushFiltersToURL(); });
  }

  if (publicationSelect) {
    publicationSelect.addEventListener('change', () => { applyFilters(); pushFiltersToURL(); });
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
          window.location.assign(card.dataset.url);
        }
      };
      card.addEventListener('click', onActivate);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onActivate();
        }
      });
    });
  }
});
