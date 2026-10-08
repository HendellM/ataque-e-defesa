const epis = [];  


// ↓ ADICIONE SEUS EPIs AQUI ↓

adicionarEpi({
    nome: 'Naverdatchi',
    funcao: 'Algúem muito arrogantchi...',
    imagens: [
        'components/imgs/img-objeto/naverdatchi.jpg',
        'components/imgs/img-objeto/falagalera.png',
        'components/imgs/img-objeto/naverdatchi-moicano.jpg'
    ],
    video: 'https://youtube.com/shorts/aBw7CfayTN4?si=-HeuX8ZqjDjKSbim'
})
// ↑ ADICIONE SEUS EPIs AQUI ↑

/* =====================================================
   2) FUNÇÕES AUXILIARES
   ===================================================== */
function normalizar(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function gerarId(texto) {
    return normalizar(texto).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function adicionarEpi({ nome, funcao, imagens = [], imagem = '', video = '', id = '' }) {
    // "imagem" (uma só) continua funcionando, para não quebrar cadastros antigos
    const lista = imagem ? [imagem, ...imagens] : [...imagens];
    epis.push({ id: id || gerarId(nome), nome, funcao, imagens: lista, video });
}

/* =====================================================
   3) ELEMENTOS DA PÁGINA
   ===================================================== */
const grid = document.getElementById('grid-epis');
const listaBusca = document.getElementById('lista-epis');
const formBusca = document.getElementById('form-busca');
const inputBusca = document.getElementById('busca');
const semResultados = document.getElementById('sem-resultados');
const semEpis = document.getElementById('sem-epis');
const avisoQr = document.getElementById('aviso-qr');
const avisoQrNome = document.getElementById('aviso-qr-nome');

const placeholderImg = `
    <div class="epi-img-vazia">
        <i class="bi bi-image"></i>
        <span>Imagem em breve</span>
    </div>`;

/* =====================================================
   4) CRIAÇÃO DAS FICHAS
   ===================================================== */
function htmlImagens(epi) {
    const { imagens, nome, id } = epi;

    if (imagens.length === 0) return placeholderImg;

    if (imagens.length === 1) {
        return `<img src="${imagens[0]}" alt="${nome}" loading="lazy">`;
    }

    // 2 ou mais imagens: carrossel do Bootstrap
    const cid = `carrossel-${id}`;

    const itens = imagens.map((src, k) => `
        <div class="carousel-item ${k === 0 ? 'active' : ''}">
            <img src="${src}" alt="${nome} - imagem ${k + 1}" loading="lazy">
        </div>`).join('');

    const bolinhas = imagens.map((_, k) => `
        <button type="button" data-bs-target="#${cid}" data-bs-slide-to="${k}"
                class="${k === 0 ? 'active' : ''}" ${k === 0 ? 'aria-current="true"' : ''}
                aria-label="Imagem ${k + 1}"></button>`).join('');

    return `
        <div id="${cid}" class="carousel slide">
            <div class="carousel-indicators">${bolinhas}</div>
            <div class="carousel-inner">${itens}</div>
            <button class="carousel-control-prev" type="button" data-bs-target="#${cid}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Anterior</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#${cid}" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Próxima</span>
            </button>
        </div>`;
}

function renderizar() {
    grid.innerHTML = '';
    listaBusca.innerHTML = '';

    epis.forEach((epi, i) => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-xl-4 epi-col fade-in';
        col.style.setProperty('--delay', `${(i % 3) * 0.12}s`);
        col.dataset.id = epi.id;
        col.dataset.busca = normalizar(`${epi.nome} ${epi.funcao}`);

        col.innerHTML = `
            <article class="epi-card" id="epi-${epi.id}">
                <span class="epi-numero">Nº ${String(i + 1).padStart(2, '0')}</span>

                <div class="epi-img">${htmlImagens(epi)}</div>

                <div class="epi-corpo">
                    <h3 class="epi-nome">${epi.nome}</h3>
                    <p class="epi-label">Função principal</p>
                    <p class="epi-funcao">${epi.funcao}</p>

                    <div class="epi-acoes">
                        <button type="button" class="btn btn-video" data-id="${epi.id}" ${epi.video ? '' : 'disabled'}>
                            <i class="bi bi-play-circle-fill me-2"></i>${epi.video ? 'Ver em uso' : 'Vídeo em breve'}
                        </button>
                        <button type="button" class="btn btn-link-qr" data-id="${epi.id}" title="Copiar link deste objeto (para o QR Code)">
                            <i class="bi bi-qr-code"></i>
                        </button>
                    </div>
                </div>
            </article>`;

        grid.appendChild(col);

        const opcao = document.createElement('option');
        opcao.value = epi.nome;
        listaBusca.appendChild(opcao);
    });

    semEpis.classList.toggle('d-none', epis.length > 0);
}

/* imagem que não carrega vira "Imagem em breve" */
grid.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        const temp = document.createElement('div');
        temp.innerHTML = placeholderImg;
        e.target.replaceWith(temp.firstElementChild);
    }
}, true);

/* =====================================================
   5) ANIMAÇÃO FADE-IN (aparece de baixo)
   ===================================================== */
const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 })
    : null;

function observarFade() {
    document.querySelectorAll('.fade-in:not(.visible)').forEach((el) => {
        observer ? observer.observe(el) : el.classList.add('visible');
    });
}

/* =====================================================
   6) MODAL DE VÍDEO
   ===================================================== */
const modalEl = document.getElementById('modalVideo');
const modalCorpo = document.getElementById('modalVideoCorpo');
const modalTitulo = document.getElementById('modalVideoTitulo');
const modalVideo = new bootstrap.Modal(modalEl);

function linkDeVideo(url) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

function abrirVideo(epi) {
    modalTitulo.textContent = epi.nome;
    const ehArquivo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(epi.video);
    const src = linkDeVideo(epi.video);

    modalCorpo.innerHTML = ehArquivo
        ? `<video src="${src}" controls autoplay playsinline></video>`
        : `<iframe src="${src}" title="Vídeo: ${epi.nome}"
                   allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;

    modalVideo.show();
}

/* ao fechar, limpa o conteúdo para o vídeo parar de tocar */
modalEl.addEventListener('hidden.bs.modal', () => { modalCorpo.innerHTML = ''; });

/* =====================================================
   7) IR DIRETO AO OBJETO (busca e QR Code)
   ===================================================== */
function irParaEpi(id) {
    const card = document.getElementById('epi-' + id);
    if (!card) return false;

    const col = card.closest('.epi-col');
    if (col.classList.contains('d-none')) {
        inputBusca.value = '';
        filtrar('');
    }
    col.classList.add('visible');

    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.remove('destaque');
    void card.offsetWidth; // reinicia a animação
    card.classList.add('destaque');
    setTimeout(() => card.classList.remove('destaque'), 3500);
    return true;
}

/* ---------- Busca ---------- */
function filtrar(termo) {
    const t = normalizar(termo.trim());
    let visiveis = 0;

    grid.querySelectorAll('.epi-col').forEach((col) => {
        const mostrar = !t || col.dataset.busca.includes(t);
        col.classList.toggle('d-none', !mostrar);
        if (mostrar) {
            visiveis++;
            col.classList.add('visible');
        }
    });

    semResultados.classList.toggle('d-none', visiveis > 0 || epis.length === 0);
}

inputBusca.addEventListener('input', () => filtrar(inputBusca.value));

formBusca.addEventListener('submit', (e) => {
    e.preventDefault();
    filtrar(inputBusca.value);
    const primeiro = grid.querySelector('.epi-col:not(.d-none)');
    if (primeiro) irParaEpi(primeiro.dataset.id);
});

/* ---------- QR Code: epis.html#id (ou epis.html?item=id) ---------- */
function verificarQr() {
    const params = new URLSearchParams(location.search);
    const id = params.get('item') || decodeURIComponent(location.hash.slice(1));
    const epi = epis.find((e) => e.id === id);
    if (!epi) return;

    avisoQrNome.textContent = epi.nome;
    avisoQr.classList.remove('d-none');
    setTimeout(() => irParaEpi(epi.id), 400);
}

document.getElementById('aviso-qr-fechar').addEventListener('click', () => {
    avisoQr.classList.add('d-none');
    history.replaceState(null, '', location.pathname);
    document.querySelectorAll('.epi-card.destaque').forEach((c) => c.classList.remove('destaque'));
});

window.addEventListener('hashchange', verificarQr);

/* =====================================================
   8) CLIQUES NAS FICHAS (vídeo e copiar link)
   ===================================================== */
function linkDoEpi(id) {
    return location.href.split('#')[0].split('?')[0] + '#' + id;
}

async function copiarLink(id, botao) {
    const link = linkDoEpi(id);
    try {
        await navigator.clipboard.writeText(link);
        const original = botao.innerHTML;
        botao.innerHTML = '<i class="bi bi-check2"></i>';
        setTimeout(() => { botao.innerHTML = original; }, 1500);
    } catch {
        window.prompt('Copie o link deste objeto (use para gerar o QR Code):', link);
    }
}

grid.addEventListener('click', (e) => {
    const btnVideo = e.target.closest('.btn-video');
    if (btnVideo) {
        const epi = epis.find((x) => x.id === btnVideo.dataset.id);
        if (epi && epi.video) abrirVideo(epi);
        return;
    }

    const btnLink = e.target.closest('.btn-link-qr');
    if (btnLink) copiarLink(btnLink.dataset.id, btnLink);
});

/* =====================================================
   9) INICIAR
   ===================================================== */
renderizar();
observarFade();
verificarQr();