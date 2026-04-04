document.addEventListener('DOMContentLoaded', () => {
  const getGrid = () => document.getElementById('writing-grid');
  const grid = getGrid();
  const filterTabs = document.querySelectorAll('.filter-tab');
  const tagSelect = document.getElementById('tag-filter');
  const publicationSelect = document.getElementById('publication-filter');
  if (!grid || !filterTabs.length) return;

  sortCardsNewest();
  updateFilterCounts();
  populatePublicationOptions();
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
    // replaceState keeps the URL shareable without a new history entry per tweak.
    history.replaceState(null, '', qs ? '?' + qs : location.pathname);
  }

  function restoreFiltersFromURL() {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    const tag = params.get('tag');
    const publication = params.get('publication');
    if (category) {
      filterTabs.forEach((t) => {
        t.classList.toggle('active', t.dataset.category === category);
      });
    }
    if (tag && tagSelect) tagSelect.value = tag;
    if (publication && publicationSelect) publicationSelect.value = publication;
    applyFilters();
  }

  function applyFilters() {
    const activeTab = document.querySelector('.filter-tab.active');
    const category = activeTab && activeTab.dataset.category ? activeTab.dataset.category : 'all';
    const tag = tagSelect && tagSelect.value ? tagSelect.value : 'all';
    const publication =
      publicationSelect && publicationSelect.value ? publicationSelect.value : 'all';

    document.querySelectorAll('.writing-card-outline').forEach((outline) => {
      const card = outline.querySelector('.writing-card');
      if (!card) return;
      const cardCategory = (card.dataset.category || '').trim();
      const cardTags = (card.dataset.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const cardPublication = (card.dataset.publication || '').trim();
      const categoryMatch = category === 'all' || cardCategory === category;
      const tagMatch = tag === 'all' || cardTags.includes(tag);
      const publicationMatch = publication === 'all' || cardPublication === publication;
      outline.style.display = categoryMatch && tagMatch && publicationMatch ? '' : 'none';
    });

    let empty = document.querySelector('.writing-empty');
    const allHidden = Array.from(document.querySelectorAll('.writing-card-outline')).every(
      (o) => o.style.display === 'none'
    );
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

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      applyFilters();
      pushFiltersToURL();
    });
  });

  if (tagSelect) {
    tagSelect.addEventListener('change', () => {
      applyFilters();
      pushFiltersToURL();
    });
  }

  if (publicationSelect) {
    publicationSelect.addEventListener('change', () => {
      applyFilters();
      pushFiltersToURL();
    });
  }

  bindCardClicks();

  function parseCardDate(str) {
    if (!str) return new Date(0);
    // YYYY-MM: normalize to -01 so sort order is stable across engines.
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
    outlines.forEach((outline) => gridEl.appendChild(outline));
  }

  function updateFilterCounts() {
    const cards = Array.from(document.querySelectorAll('.writing-card'));
    const categoryCounts = { all: cards.length };
    cards.forEach((card) => {
      const cat = (card.dataset.category || '').trim();
      if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const labels = { all: 'All', essays: 'Essays', articles: 'Articles' };
    filterTabs.forEach((tab) => {
      const category = tab.dataset.category;
      const label = labels[category] || category;
      const count = categoryCounts[category] ?? 0;
      tab.textContent = `${label} (${count})`;
    });
  }

  function populatePublicationOptions() {
    if (!publicationSelect) return;

    const currentValue = publicationSelect.value || 'all';
    const publications = Array.from(document.querySelectorAll('.writing-card'))
      .map((card) => (card.dataset.publication || '').trim())
      .filter(Boolean);

    const uniquePublications = Array.from(new Set(publications)).sort((a, b) => {
      if (a === 'Personal Site') return -1;
      if (b === 'Personal Site') return 1;
      return a.localeCompare(b);
    });

    publicationSelect.innerHTML = '<option value="all">All publications</option>';
    uniquePublications.forEach((publication) => {
      const option = document.createElement('option');
      option.value = publication;
      option.textContent = publication;
      publicationSelect.appendChild(option);
    });

    publicationSelect.value = uniquePublications.includes(currentValue) ? currentValue : 'all';
  }

  function bindCardClicks() {
    const gridEl = getGrid();
    if (!gridEl) return;

    gridEl.querySelectorAll('.writing-card').forEach((card) => {
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
