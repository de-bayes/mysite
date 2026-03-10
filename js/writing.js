// Writing page — filter, sort, API integration, guestbook
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('writing-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const sortSelect = document.getElementById('sort-select');

  // Filter
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.type;
      document.querySelectorAll('.writing-card').forEach(card => {
        if (type === 'all' || card.dataset.type === type) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Sort
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const cards = Array.from(grid.querySelectorAll('.writing-card'));
      const asc = sortSelect.value === 'date-asc';
      cards.sort((a, b) => {
        const da = new Date(a.dataset.date);
        const db = new Date(b.dataset.date);
        return asc ? da - db : db - da;
      });
      cards.forEach(card => grid.appendChild(card));
    });
  }

  // Load blog posts from API
  fetch('/api/blogposts')
    .then(r => r.json())
    .then(posts => {
      if (!Array.isArray(posts) || !posts.length) return;
      posts.forEach(post => {
        const card = document.createElement('article');
        card.className = 'writing-card';
        card.dataset.type = (post.tags && post.tags[0]) ? post.tags[0].toLowerCase() : 'blog';
        card.dataset.date = post.date || '';
        card.dataset.id = post.id;

        const tagsHtml = (post.tags || []).map(t =>
          `<span class="tag">${escapeHtml(t)}</span>`
        ).join('');

        const dateStr = post.date ? new Date(post.date).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric'
        }) : '';

        card.innerHTML = `
          <h3>${escapeHtml(post.title)}</h3>
          <p class="excerpt">${escapeHtml((post.body || '').slice(0, 140))}${post.body && post.body.length > 140 ? '...' : ''}</p>
          <div class="meta">
            <span>${dateStr}</span>
            <span>${escapeHtml(post.readTime || '')}</span>
          </div>
          ${tagsHtml}
        `;

        card.addEventListener('click', () => showArticle(post));
        grid.appendChild(card);
      });
    })
    .catch(() => {}); // silently fail if API unavailable

  // Article detail view
  function showArticle(post) {
    const main = document.querySelector('.writing-page');
    const prevHTML = main.innerHTML;

    const dateStr = post.date ? new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }) : '';

    main.innerHTML = `
      <div class="article-view">
        <a href="#" class="back-link" id="back-to-grid">&larr; Back to writing</a>
        <h1>${escapeHtml(post.title)}</h1>
        <div class="article-meta">${dateStr} &middot; ${escapeHtml(post.readTime || '')}</div>
        <div class="article-body">${formatBody(post.body || '')}</div>
      </div>
    `;

    document.getElementById('back-to-grid').addEventListener('click', (e) => {
      e.preventDefault();
      main.innerHTML = prevHTML;
      rebindEvents();
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function formatBody(text) {
    return text.split('\n\n').map(p => `<p>${escapeHtml(p)}</p>`).join('');
  }

  function rebindEvents() {
    // Re-bind filter, sort, and card click events after restoring grid
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.dataset.type;
        document.querySelectorAll('.writing-card').forEach(card => {
          card.style.display = (type === 'all' || card.dataset.type === type) ? '' : 'none';
        });
      });
    });
  }

  // ===== Guestbook =====
  const gbForm = document.getElementById('guestbook-form');
  const gbList = document.getElementById('guestbook-list');

  if (gbForm && gbList) {
    // Load entries
    fetch('/api/guestbook')
      .then(r => r.json())
      .then(entries => {
        if (!Array.isArray(entries)) return;
        entries.forEach(entry => appendGuestbookEntry(entry));
      })
      .catch(() => {});

    // Submit
    gbForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = gbForm.querySelector('[name="name"]').value.trim();
      const message = gbForm.querySelector('[name="message"]').value.trim();
      if (!name || !message) return;

      fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message })
      })
        .then(r => {
          if (!r.ok) throw new Error('Rate limited');
          return r.json();
        })
        .then(() => {
          appendGuestbookEntry({
            name,
            message,
            date: new Date().toISOString()
          }, true);
          gbForm.reset();
        })
        .catch(() => {});
    });
  }

  function appendGuestbookEntry(entry, prepend) {
    const li = document.createElement('li');
    li.className = 'guestbook-entry';
    const dateStr = entry.date ? new Date(entry.date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }) : '';
    li.innerHTML = `
      <span class="gb-name">${escapeHtml(entry.name)}</span>
      <span class="gb-date">${dateStr}</span>
      <p class="gb-message">${escapeHtml(entry.message)}</p>
    `;
    if (prepend) {
      gbList.prepend(li);
    } else {
      gbList.appendChild(li);
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
