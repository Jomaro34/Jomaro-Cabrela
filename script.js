const url = 'Dicionario.pdf';
let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5,
    canvas = document.getElementById('pdf-render'),
    ctx = canvas.getContext('2d');

// Carregar PDF
pdfjsLib.getDocument(url).promise.then(doc => {
  pdfDoc = doc;
  document.getElementById('page-count').textContent = pdfDoc.numPages;
  renderPage(pageNum);
});

// Renderizar página
function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then(page => {
    let viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    let renderContext = { canvasContext: ctx, viewport: viewport };
    let renderTask = page.render(renderContext);

    renderTask.promise.then(() => {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });

  document.getElementById('page-num').textContent = num;
}

// Navegar entre páginas
function queueRenderPage(num) {
  if (pageRendering) pageNumPending = num;
  else renderPage(num);
}

document.getElementById('prev-page').addEventListener('click', () => {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
});

document.getElementById('next-page').addEventListener('click', () => {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
});

// Pesquisa simples
document.getElementById('search-btn').addEventListener('click', async () => {
  let term = document.getElementById('search').value.trim().toLowerCase();
  if (!term) return alert('Escreva algo para pesquisar');

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    let page = await pdfDoc.getPage(i);
    let textContent = await page.getTextContent();
    let textItems = textContent.items.map(item => item.str).join(' ').toLowerCase();
    if (textItems.includes(term)) {
      pageNum = i;
      queueRenderPage(pageNum);
      alert(`Palavra encontrada na página ${i}`);
      return;
    }
  }
  alert('Palavra não encontrada');
});
