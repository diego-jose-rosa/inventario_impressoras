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

    // --- Lógica Específica da Página ---
    const pageName = window.location.pathname.split('/').pop();

    if (pageName === '' || pageName === 'index.html' || pageName === 'index') {
        // --- Lógica da Página de Impressoras ---
        const addPrinterForm = document.getElementById('add-printer-form');
        const printerListContainer = document.getElementById('printer-list');

        if (addPrinterForm && printerListContainer) {
            console.log("Executando lógica da página de impressoras.");

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
                        loadPrinters();
                        addPrinterForm.reset();
                        closeMenu();
                    }
                })
                .catch(error => {
                    console.error('Erro na requisição:', error);
                    alert('Ocorreu um erro ao tentar salvar a impressora.');
                });
            });

            const loadPrinters = () => {
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
                printerListContainer.innerHTML = '';
                printers.forEach(addPrinterToDOM);
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

            loadPrinters();
        }
    } else if (pageName === 'computador' || pageName === 'computador.html') {
        // --- Lógica da Página de Computadores ---
        const addComputerForm = document.getElementById('add-computer-form');
        const computerListContainer = document.getElementById('computer-list');

        if (addComputerForm && computerListContainer) {
            console.log("Executando lógica da página de computadores.");

            const openMenuBtn = document.getElementById('open-side-menu');
            const closeMenuBtn = document.getElementById('close-side-menu');
            const sideMenu = document.getElementById('add-computer-menu');
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

            addComputerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(addComputerForm);
                
                fetch('/salvar_computador', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.erro) {
                        alert('Erro ao salvar computador: ' + data.erro);
                    } else {
                        loadComputers();
                        addComputerForm.reset();
                        closeMenu();
                    }
                })
                .catch(error => {
                    console.error('Erro na requisição:', error);
                    alert('Ocorreu um erro ao tentar salvar o computador.');
                });
            });

            const loadComputers = () => {
                fetch('/listar_computadores')
                    .then(response => response.json())
                    .then(data => {
                        if (data.erro) {
                            alert('Erro ao carregar computadores: ' + data.erro);
                        } else {
                            renderComputers(data);
                        }
                    })
                    .catch(error => {
                        console.error('Erro na requisição:', error);
                        alert('Ocorreu um erro ao tentar carregar os computadores.');
                    });
            };
            
            const renderComputers = (computers) => {
                computerListContainer.innerHTML = '';
                computers.forEach(addComputerToDOM);
            };

            const addComputerToDOM = (computer) => {
                const computerCard = document.createElement('div');
                computerCard.classList.add('computer-card');

                computerCard.innerHTML = `
                    <div class="computer-card-info">
                        <h3>${computer.marca}</h3>
                        <p><strong>Modelo:</strong> ${computer.modelo}</p>
                        <p><strong>Patrimônio:</strong> ${computer.patrimonio}</p>
                        <p><strong>Serial:</strong> ${computer.serialnumber}</p>
                        <p><strong>Setor:</strong> ${computer.setor}</p>
                    </div>
                `;

                computerListContainer.appendChild(computerCard);
            };

            loadComputers();
        }
    }
});