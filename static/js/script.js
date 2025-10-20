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
        const mainContent = document.querySelector('main');

        const openMenu = () => {
            sideMenu.classList.add('open');
            overlay.classList.add('active');
            mainContent.classList.add('shifted');
        };

        const closeMenu = () => {
            sideMenu.classList.remove('open');
            overlay.classList.remove('active');
            mainContent.classList.remove('shifted');
        };

        openMenuBtn.addEventListener('click', openMenu);
        closeMenuBtn.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);

        addPrinterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log("Formulário enviado.");

            const formData = new FormData(addPrinterForm);
            
            fetch('/salvar_impressora', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.erro) {
                    alert('Erro ao salvar impressora: ' + data.erro);
                } else {
                    console.log("Impressora salva no banco de dados.");
                    loadPrinters(); // Recarrega a lista de impressoras
                    addPrinterForm.reset();
                    closeMenu();
                }
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                alert('Ocorreu um erro ao tentar salvar a impressora.');
            });
        });

        // Carrega as impressoras do backend
        const loadPrinters = () => {
            console.log("Carregando impressoras do backend...");
            fetch('/listar_impressoras')
                .then(response => response.json())
                .then(data => {
                    if (data.erro) {
                        alert('Erro ao carregar impressoras: ' + data.erro);
                    } else {
                        renderPrinters(data);
                    }
                })
                .catch(error => {
                    console.error('Erro na requisição:', error);
                    alert('Ocorreu um erro ao tentar carregar as impressoras.');
                });
        };
        
        const renderPrinters = (printers) => {
            console.log("Renderizando impressoras na página...");
            printerListContainer.innerHTML = '';
            printers.forEach((printer) => {
                addPrinterToDOM(printer);
            });
            console.log("Renderização concluída.");
        };

        const addPrinterToDOM = (printer) => {
            const printerCard = document.createElement('a');
            printerCard.classList.add('printer-card');
            
            if (printer.ip) {
                printerCard.href = printer.ip.startsWith('http') ? printer.ip : `http://${printer.ip}`;
            }
            printerCard.target = '_blank';
            printerCard.rel = 'noopener noreferrer';

            printerCard.innerHTML = `
                <div class="printer-card-image">
                    <button class="delete-btn" data-id="${printer.id}">&times;</button>
                    <img src="/static/imagens/impressora.png" alt="Imagem da Impressora">
                </div>
                <div class="printer-card-info">
                    <h3>${printer.nome}</h3>
                    <p><strong>Modelo:</strong> ${printer.modelo}</p>
                    <p><strong>Setor:</strong> ${printer.setor}</p>
                    <p><strong>IP:</strong> ${printer.ip}</p>
                </div>
            `;

            const deleteBtn = printerCard.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const printerId = e.target.dataset.id;
                
                if (confirm(`Tem certeza que deseja excluir a impressora "${printer.nome}"?`)) {
                    fetch(`/impressora/excluir/${printerId}`, {
                        method: 'DELETE'
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.erro) {
                            alert('Erro ao excluir impressora: ' + data.erro);
                        } else {
                            console.log("Impressora excluída do banco de dados.");
                            loadPrinters();
                        }
                    })
                    .catch(error => {
                        console.error('Erro na requisição:', error);
                        alert('Ocorreu um erro ao tentar excluir a impressora.');
                    });
                }
            });

            printerListContainer.appendChild(printerCard);
        };

        // Carrega as impressoras ao iniciar a página
        loadPrinters();
    } else {
        console.log("Erro: Formulário 'add-printer-form' ou contêiner 'printer-list' não encontrado. A lógica da página de impressoras não será executada.");
    }
});