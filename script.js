const url = 'Dicionario.pdf';
let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.2,
    canvas = document.getElementById('pdf-render'),
    ctx = canvas.getContext('2d');

async function renderPage(num) {
    pageRendering = true;
    try {
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const renderContext = { canvasContext: ctx, viewport: viewport };
        await page.render(renderContext).promise;
        pageRendering = false;
        if (pageNumPending !== null) {
            renderPage(pageNumPending);
            pageNumPending = null;
        }
        document.getElementById('page-num').textContent = num;
    } catch (err) {
        alert('Erro ao renderizar a página: ' + err);
    }
}

function queueRenderPage(num) {
    if (pageRendering) pageNumPending = num;
    else renderPage(num);
}

// Carregar PDF
pdfjsLib.getDocument(url).promise.then(doc => {
    pdfDoc = doc;
    document.getElementById('page-count').textContent = pdfDoc.numPages;
    renderPage(pageNum);
}).catch(err => {
    alert('Erro ao carregar PDF: ' + err);
});

// Navegação
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

// Pesquisa
document.getElementById('search-btn').addEventListener('click', async () => {
    const term = document.getElementById('search').value.trim().toLowerCase();
    if (!term) return alert('Escreva algo para pesquisar');

    for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map(item => item.str).join(' ').toLowerCase();
        if (textItems.includes(term)) {
            pageNum = i;
            queueRenderPage(pageNum);
            alert(`Palavra encontrada na página ${i}`);
            return;
        }
    }
    alert('Palavra não encontrada');
});

