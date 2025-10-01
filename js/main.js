const contentEl = document.getElementById('content');
const navLinks = document.querySelectorAll('nav a, #siteTitle'); 
const PAGES_DIR = 'pages'; // 相対パス

async function loadPage(page) {
  contentEl.innerHTML = '<p>読み込み中…</p>';
  try {
    const res = await fetch(`${PAGES_DIR}/${page}.html`, { cache: 'no-store' });
    if (!res.ok) {
      showNotFound();
      return;
    }
    const html = await res.text();
    contentEl.innerHTML = html;
    afterInsert(page);
  } catch (err) {
    console.error(err);
    showNotFound();
  }
}

function showNotFound() {
  contentEl.innerHTML = `<section><h2>404 Not Found</h2><p>ページが見つかりません。</p></section>`;
}

function afterInsert(page) {
  if (page === 'contact') {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form);
      document.getElementById('result').innerHTML = `
        <p>送信完了！</p>
        <p>名前: ${escapeHtml(data.get('name'))}</p>
        <p>メール: ${escapeHtml(data.get('email'))}</p>
        <p>メッセージ: ${escapeHtml(data.get('message'))}</p>
      `;
      form.reset();
    });
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
}

// ナビゲーション
navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const page = link.dataset.page;
    if (!page) return;
    
    // 💡 修正点 1: 'home' ページの場合は URL を '/' に設定
    const path = page === 'home' ? '/' : page; 
    
    history.pushState({ page }, '', path); // ルート絶対パスを避ける
    loadPage(page);
  });
});

// popstate
window.addEventListener('popstate', e => {
  // 💡 修正点 2: e.state.page がない場合や URL が '/' の場合は 'home' を設定
  let page;
  if (e.state?.page) {
    page = e.state.page;
  } else {
    // URL のパス名からページ名を取得。パスが空（ルート '/'）の場合は 'home'
    page = location.pathname.split('/').pop() || 'home';
  }
  
  loadPage(page);
});

// 初期表示
(function init() {
  // 💡 修正点 3: location.pathname が '/' や空の場合は 'home' を使用
  const path = location.pathname.split('/').pop();
  let page = (path === '' || path === 'index.html') ? 'home' : path;
  
  loadPage(page);
})();