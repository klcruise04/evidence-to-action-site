let allArticles = [];

function renderArticles(articles) {
  const container = document.getElementById('articles');
  container.innerHTML = '';

  articles.forEach(article => {
    const card = document.createElement('div');
    card.className = 'article-card';

    // Build card HTML
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
        ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
      <a class="view-link" href="${article.link}" target="_blank">View Full Study →</a>

      <div class="article-details">
        <p><strong>Journal:</strong> ${article.journal}</p>
        <p><strong>Authors:</strong> ${article.authors}</p>
        ${article.implementation_examples?.length ? `
          <p><strong>Implementation Examples:</strong></p>
          <ul>
            ${article.implementation_examples.map(ex => `<li><a href="${ex.link}" target="_blank">${ex.title}</a></li>`).join('')}
          </ul>` : ''}
      </div>
    `;
    function toggleDetails(card) {
      const details = card.querySelector('.article-details');
      if (details.style.display === 'block') {
        details.style.display = 'none';
      } else {
        details.style.display = 'block';
      }
    }
    

    // 🚫 Hide details initially
    const details = card.querySelector('.article-details'); // already hidden by CSS

card.addEventListener('click', function (e) {
  if (e.target.tagName.toLowerCase() === 'a') return;
  details.classList.toggle('expanded');
});


    container.appendChild(card);
  });
}


function generateSummary(articles) {
  const summaryBox = document.getElementById('summary-text');

  if (articles.length === 0) {
    summaryBox.innerText = "No articles match the selected filters. Try changing your selections.";
    return;
  }

  const sentences = articles.map(article => article.summary);
  const preview = sentences.slice(0, 3).join(" ");
  summaryBox.innerText = `Summary of current research: ${preview}`;
}
function renderSolutions(articles) {
  const allSolutions = new Set();
  articles.forEach(a => a.solutions?.forEach(s => allSolutions.add(s)));
  const container = document.getElementById('solution-list');
  container.innerHTML = '';

  Array.from(allSolutions).forEach(solution => {
    const span = document.createElement('span');
    span.textContent = solution;
    span.addEventListener('click', () => {
      span.classList.toggle('selected');
      applyFilters();
    });
    container.appendChild(span);
  });
}

function getSelectedSolutions() {
  return Array.from(document.querySelectorAll('#solution-list span.selected'))
    .map(el => el.textContent);
}

function getSelectedFilters() {
  const checked = Array.from(document.querySelectorAll('.filter-option:checked'));
  return checked.map(input => input.value);
}

function applyFilters() {
  const selectedTags = getSelectedFilters();
  const selectedSolutions = getSelectedSolutions();

  let filtered = allArticles;

  if (selectedTags.length > 0) {
    filtered = filtered.filter(article =>
      selectedTags.every(tag => article.tags.includes(tag))
    );
  }

  if (selectedSolutions.length > 0) {
    filtered = filtered.filter(article =>
      article.solutions && selectedSolutions.every(sol => article.solutions.includes(sol))
    );
  }

  renderArticles(filtered);
}


// Utility to load the topic slug from the URL
function getTopicFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('topic');
}

function getTopicDisplayName(slug) {
  const displayNames = {
    access: "Access Expansion",
    readmissions: "Hospital Readmissions",
    mortality: "Mortality Rates",
    overprescribing: "Overprescribing and Medication Safety",
    costs: "Healthcare Costs",
    fragment: "Fragmented Care and Care Integration",
    quality: "Quality of Care",
    chronic: "Chronic Care"


  };
  return displayNames[slug] || slug;
}


async function renderTopicPage() {
  const slug = getTopicFromURL();
  if (!slug) return;

  const displayName = await getTopicDisplayName(slug);
  document.getElementById('topic-title').innerText = displayName;

  fetch(`./data/${slug}.json`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('summary-text').innerText = data.summary || '';
      
        renderSolutions(data.articles); // ✅ Automatically sets up filters
        renderArticles(data.articles);
        allArticles = data.articles;
      
        // Enable tag filters
        document.querySelectorAll('.filter-option').forEach(input => {
          input.addEventListener('change', () => {
            applyFilters();
          });
        });
      });
      

      // Render articles
      renderArticles(data.articles);
      allArticles = data.articles;

      // Enable tag filters
      document.querySelectorAll('.filter-option').forEach(input => {
        input.addEventListener('change', () => {
          applyFilters();
        });
      });
    };


// Run on topic.html
if (window.location.pathname.includes('topic.html')) {
  renderTopicPage();
}
