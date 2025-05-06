async function loadAllArticles() {
  const topicList = await fetch('topics.json').then(res => res.json());
  const allArticles = [];
  for (const topic of topicList) {
    try {
      const topicData = await fetch(`./data/${topic.slug}.json`).then(res => res.json());
      topicData.articles.forEach(article => {
        allArticles.push({
          ...article,
          topic: topic.topic,
          topicSlug: topic.slug
        });
      });
    } catch (e) {
      console.error(`❌ Failed to load ${topic.slug}.json`, e);
    }
  }
  return allArticles;
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name)?.toLowerCase() || '';
}

function renderArticles(articles, query) {
  const container = document.getElementById('articles');
  container.innerHTML = '';

  if (articles.length === 0) {
    container.innerHTML = `<p>No articles found matching "${query}"</p>`;
    return;
  }

  articles.forEach(article => {
    const card = document.createElement('div');
    card.className = 'article-card';
    card.innerHTML = `
      <div class="article-header">
        <h2>
          <a href="${article.link}" target="_blank">${article.title}</a>
          ${article.causal ? `<span class="causal-badge" title="Causal evidence">★</span>` : ''}
        </h2>
        <span class="implementation-flag ${article.implemented ? 'implemented' : 'not-implemented'}">
          ${article.implemented ? 'Implemented' : 'Partially Implemented'}
        </span>
      </div>
      <p class="summary">${article.summary}</p>
      <div class="tags">
        ${article.tags?.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      <a class="view-link" href="${article.link}" target="_blank">View Full Study →</a>
      <div class="article-details">
        <p><strong>Topic:</strong> ${article.topic}</p>
        <p><strong>Journal:</strong> ${article.journal}</p>
        <p><strong>Authors:</strong> ${article.authors}</p>
        ${article.implementation_examples?.length ? `
          <p><strong>Implementation Examples:</strong></p>
          <ul>
            ${article.implementation_examples.map(ex => `<li><a href="${ex.link}" target="_blank">${ex.title}</a></li>`).join('')}
          </ul>` : ''}
      </div>
    `;

    const details = card.querySelector('.article-details');
    details.style.display = 'none';

    card.addEventListener('click', function (e) {
      if (e.target.tagName.toLowerCase() === 'a') return;
      details.style.display = (details.style.display === 'none') ? 'block' : 'none';
      card.classList.toggle('expanded');
    });

    container.appendChild(card);
  });
}

async function runSearch() {
  const query = getQueryParam('query');
  console.log("Search query:", query);
  
  document.getElementById('search-query').innerText = query;

  const allArticles = await loadAllArticles();

  const filtered = allArticles.filter(article => {
    const inTitle = article.title?.toLowerCase().includes(query);
    const inSummary = article.summary?.toLowerCase().includes(query);
    const inTags = article.tags?.some(tag => tag.toLowerCase().includes(query));
    const inTopic = article.topic?.toLowerCase().includes(query);
    return inTitle || inSummary || inTags || inTopic;
  });

  renderArticles(filtered, query);
}

runSearch();
