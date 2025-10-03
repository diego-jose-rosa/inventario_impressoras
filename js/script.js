document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM carregado. Iniciando script.");

    // --- Navegação Principal (Hamburguer) ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // --- Destaque do Link Ativo ---
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-links a');
    
    links.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });

    // --- Lógica da Página de Impressoras ---
    const addPrinterForm = document.getElementById('add-printer-form');
    const printerListContainer = document.getElementById('printer-list');

    console.log("Procurando por formulário e contêiner de impressora...");
    if (addPrinterForm && printerListContainer) {
        console.log("Elementos encontrados! Executando lógica da página de impressoras.");

        const openMenuBtn = document.getElementById('open-side-menu');
        const closeMenuBtn = document.getElementById('close-side-menu');
        const sideMenu = document.getElementById('add-printer-menu');
        const overlay = document.getElementById('overlay');

        const openMenu = () => {
            sideMenu.classList.add('open');
            overlay.classList.add('active');
        };

        const closeMenu = () => {
            sideMenu.classList.remove('open');
            overlay.classList.remove('active');
        };

        openMenuBtn.addEventListener('click', openMenu);
        closeMenuBtn.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);

        // Carregar impressoras do localStorage
        const printers = JSON.parse(localStorage.getItem('printers')) || [];
        console.log("Impressoras carregadas do localStorage:", printers);

        const renderPrinters = () => {
            console.log("Renderizando impressoras na página...");
            printerListContainer.innerHTML = '';
            printers.forEach((printer, index) => {
                addPrinterToDOM(printer, index);
            });
            console.log("Renderização concluída.");
        };

        const addPrinterToDOM = (printer, index) => {
            const printerCard = document.createElement('a');
            printerCard.classList.add('printer-card');
            
            if (printer.ip) {
                printerCard.href = printer.ip.startsWith('http') ? printer.ip : `http://${printer.ip}`;
            }
            printerCard.target = '_blank';
            printerCard.rel = 'noopener noreferrer';

            printerCard.innerHTML = `
                <div class="printer-card-image">
                    <button class="delete-btn" data-index="${index}">&times;</button>
                    <img src="imagens/impressora.png" alt="Imagem da Impressora">
                </div>
                <div class="printer-card-info">
                    <h3>${printer.name}</h3>
                    <p><strong>Modelo:</strong> ${printer.model}</p>
                    <p><strong>Setor:</strong> ${printer.sector}</p>
                    <p><strong>IP:</strong> ${printer.ip}</p>
                </div>
            `;

            const deleteBtn = printerCard.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Impede a navegação ao clicar no X
                e.stopPropagation(); // Impede que o clique se propague para o card

                const printerIndex = parseInt(e.target.dataset.index, 10);
                
                // Confirmação antes de excluir
                if (confirm(`Tem certeza que deseja excluir a impressora "${printers[printerIndex].name}"?`)) {
                    printers.splice(printerIndex, 1); // Remove do array
                    localStorage.setItem('printers', JSON.stringify(printers)); // Atualiza o localStorage
                    renderPrinters(); // Renderiza a lista novamente
                }
            });

            printerListContainer.appendChild(printerCard);
        };

        addPrinterForm.addEventListener('submit', (e) => {
            console.log("Formulário enviado.");
            e.preventDefault();

            const newPrinter = {
                name: e.target.elements['printer-name'].value,
                model: e.target.elements['printer-model'].value,
                sector: e.target.elements['printer-sector'].value,
                ip: e.target.elements['printer-ip'].value,
            };
            console.log("Nova impressora:", newPrinter);

            printers.push(newPrinter);
            localStorage.setItem('printers', JSON.stringify(printers));
            console.log("Impressora salva no localStorage.");
            
            renderPrinters(); // Re-renderiza a lista inteira para manter os índices corretos

            addPrinterForm.reset();
            closeMenu();
        });

        // Renderiza as impressoras já salvas ao carregar a página
        renderPrinters();
    } else {
        console.log("Erro: Formulário 'add-printer-form' ou contêiner 'printer-list' não encontrado. A lógica da página de impressoras não será executada.");
    }
});