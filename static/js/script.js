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

    if (pageName === '' || pageName === 'index.html' || pageName === 'index' || pageName === 'impressora') {
        let allPrinters = []; // Declare allPrinters here
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
                const printerId = document.getElementById('printer-id').value;
                let url = '/salvar_impressora';
                let method = 'POST';
                let successMessage = 'Impressora salva com sucesso!';
                let errorMessage = 'Erro ao salvar impressora: ';
                let confirmMessage = 'Tem certeza que deseja salvar as alterações?';

                if (printerId) {
                    url = '/atualizar_impressora'; // New endpoint for updating
                    method = 'PUT'; // Or POST, depending on API design
                    successMessage = 'Impressora atualizada com sucesso!';
                    errorMessage = 'Erro ao atualizar impressora: ';
                }

                if (printerId && !confirm(confirmMessage)) {
                    return; // User cancelled the edit
                }
                
                fetch(url, {
                    method: method,
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.erro) {
                        alert(errorMessage + data.erro);
                    } else {
                        alert(successMessage); // Show success message
                        loadPrinters();
                        addPrinterForm.reset();
                        // Reset form title and button text after submission
                        document.querySelector('#add-printer-menu h2').textContent = 'Adicionar Impressora';
                        addPrinterForm.querySelector('button[type="submit"]').textContent = 'Salvar';
                        document.getElementById('printer-id').value = ''; // Clear hidden ID
                        closeMenu();
                    }
                })
                .catch(error => {
                    console.error('Erro na requisição:', error);
                    alert('Ocorreu um erro na requisição.');
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
                            allPrinters = data; // Store the fetched data
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
            
            // Carregar impressoras quando a página é carregada
            loadPrinters();

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
                        <button class="edit-btn" data-id="${printer.id}">Editar</button>
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

                const editBtn = printerCard.querySelector('.edit-btn');
                editBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const printerId = e.target.dataset.id;
                    const printerToEdit = allPrinters.find(p => p.id == printerId);

                    if (printerToEdit) {
                        document.getElementById('printer-id').value = printerToEdit.id;
                        document.getElementById('printer-name').value = printerToEdit.nome;
                        document.getElementById('printer-model').value = printerToEdit.modelo;
                        document.getElementById('printer-sector').value = printerToEdit.setor;
                        document.getElementById('printer-ip').value = printerToEdit.ip;

                        document.querySelector('#add-printer-menu h2').textContent = 'Editar Impressora';
                        addPrinterForm.querySelector('button[type="submit"]').textContent = 'Atualizar';

                        openMenu();
                    }
                });
            };

            loadPrinters();
        }
        } else if (pageName === 'unidadeimagem' || pageName === 'unidadeimagem.html') {
            // --- Lógica da Página de Unidades de Imagem ---
            const addImagingUnitForm = document.getElementById('add-imaging-unit-form');
            const imagingUnitTableBody = document.querySelector('#imaging-unit-table tbody');
    
            if (addImagingUnitForm && imagingUnitTableBody) {
                console.log("Executando lógica da página de unidades de imagem.");
    
                const openMenuBtn = document.getElementById('open-side-menu');
                const closeMenuBtn = document.getElementById('close-side-menu');
                const sideMenu = document.getElementById('add-imaging-unit-menu');
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
    
                addImagingUnitForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(addImagingUnitForm);
                    
                    fetch('/salvar_unidadeimagem', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.erro) {
                            alert('Erro ao salvar unidade de imagem: ' + data.erro);
                        } else {
                            alert('Unidade de imagem salva com sucesso!');
                            loadImagingUnits();
                            addImagingUnitForm.reset();
                            closeMenu();
                        }
                    })
                    .catch(error => {
                        console.error('Erro na requisição:', error);
                        alert('Ocorreu um erro ao tentar salvar a unidade de imagem.');
                    });
                });
    
                const loadImagingUnits = () => {
                    fetch('/inventario/unidadeimagem')
                        .then(response => response.json())
                        .then(data => {
                            if (data.erro) {
                                alert('Erro ao carregar unidades de imagem: ' + data.erro);
                            } else {
                                renderImagingUnits(data);
                            }
                        })
                        .catch(error => {
                            console.error('Erro na requisição:', error);
                            alert('Ocorreu um erro ao tentar carregar as unidades de imagem.');
                        });
                };
                
                const renderImagingUnits = (imagingUnits) => {
                    imagingUnitTableBody.innerHTML = '';
                    if (imagingUnits.length === 0) {
                        imagingUnitTableBody.innerHTML = '<tr><td colspan="4">Nenhuma unidade de imagem cadastrada.</td></tr>';
                        return;
                    }
                    imagingUnits.forEach(unit => {
                        const row = `
                            <tr>
                                <td>${unit.modelo}</td>
                                <td>${unit.quantidade_novo}</td>
                                <td>${unit.quantidade_usado}</td>
                                <td>
                                    <button class="btn-small btn-add" data-id="${unit.id}" data-type="unidadeimagem" data-column="quantidade_novo">+</button>
                                    <button class="btn-small btn-remove" data-id="${unit.id}" data-type="unidadeimagem" data-column="quantidade_novo">-</button>
                                    <button class="btn-small btn-add" data-id="${unit.id}" data-type="unidadeimagem" data-column="quantidade_usado">+U</button>
                                    <button class="btn-small btn-remove" data-id="${unit.id}" data-type="unidadeimagem" data-column="quantidade_usado">-U</button>
                                </td>
                            </tr>
                        `;
                        imagingUnitTableBody.innerHTML += row;
                    });
                    // Add event listeners for the add/remove buttons
                    imagingUnitTableBody.querySelectorAll('.btn-add, .btn-remove').forEach(button => {
                        button.addEventListener('click', handleInventoryUpdate);
                    });
                };
    
                loadImagingUnits();
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
        } else if (pageName === 'toner' || pageName === 'toner.html') {
        // --- Lógica da Página de Toners ---
        const addTonerForm = document.getElementById('add-toner-form');
        const tonerTableBody = document.querySelector('#toner-table tbody');

        if (addTonerForm && tonerTableBody) {
            console.log("Executando lógica da página de toners.");

            const openMenuBtn = document.getElementById('open-side-menu');
            const closeMenuBtn = document.getElementById('close-side-menu');
            const sideMenu = document.getElementById('add-toner-menu');
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

            addTonerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(addTonerForm);
                
                fetch('/salvar_toner', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.erro) {
                        alert('Erro ao salvar toner: ' + data.erro);
                    } else {
                        alert('Toner salvo com sucesso!');
                        loadToners();
                        addTonerForm.reset();
                        closeMenu();
                    }
                })
                .catch(error => {
                    console.error('Erro na requisição:', error);
                    alert('Ocorreu um erro ao tentar salvar o toner.');
                });
            });

            const loadToners = () => {
                fetch('/inventario/toner')
                    .then(response => response.json())
                    .then(data => {
                        if (data.erro) {
                            alert('Erro ao carregar toners: ' + data.erro);
                        } else {
                            renderToners(data);
                        }
                    })
                    .catch(error => {
                        console.error('Erro na requisição:', error);
                        alert('Ocorreu um erro ao tentar carregar os toners.');
                    });
            };
            
            const renderToners = (toners) => {
                tonerTableBody.innerHTML = '';
                if (toners.length === 0) {
                    tonerTableBody.innerHTML = '<tr><td colspan="4">Nenhum toner cadastrado.</td></tr>';
                    return;
                }
                toners.forEach(toner => {
                    const row = `
                        <tr>
                            <td>${toner.modelo}</td>
                            <td>${toner.quantidade_novo}</td>
                            <td>${toner.quantidade_usado}</td>
                            <td>
                                <button class="btn-small btn-add" data-id="${toner.id}" data-type="toner" data-column="quantidade_novo">+</button>
                                <button class="btn-small btn-remove" data-id="${toner.id}" data-type="toner" data-column="quantidade_novo">-</button>
                                <button class="btn-small btn-add" data-id="${toner.id}" data-type="toner" data-column="quantidade_usado">+U</button>
                                <button class="btn-small btn-remove" data-id="${toner.id}" data-type="toner" data-column="quantidade_usado">-U</button>
                            </td>
                        </tr>
                    `;
                    tonerTableBody.innerHTML += row;
                });
                // Add event listeners for the add/remove buttons
                tonerTableBody.querySelectorAll('.btn-add, .btn-remove').forEach(button => {
                    button.addEventListener('click', handleInventoryUpdate);
                });
            };

            loadToners();
        }
    } else if (pageName === 'unidadeimagem' || pageName === 'unidadeimagem.html') {
        // --- Lógica da Página de Unidades de Imagem ---
        const addImagingUnitForm = document.getElementById('add-imaging-unit-form');
        const imagingUnitTableBody = document.querySelector('#imaging-unit-table tbody');

        if (addImagingUnitForm && imagingUnitTableBody) {
            console.log("Executando lógica da página de unidades de imagem.");

            const openMenuBtn = document.getElementById('open-side-menu');
            const closeMenuBtn = document.getElementById('close-side-menu');
            const sideMenu = document.getElementById('add-imaging-unit-menu');
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

            addImagingUnitForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(addImagingUnitForm);
                
                fetch('/salvar_unidadeimagem', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.erro) {
                        alert('Erro ao salvar unidade de imagem: ' + data.erro);
                    } else {
                        alert('Unidade de imagem salva com sucesso!');
                        loadImagingUnits();
                        addImagingUnitForm.reset();
                        closeMenu();
                    }
                })
                .catch(error => {
                    console.error('Erro na requisição:', error);
                    alert('Ocorreu um erro ao tentar salvar a unidade de imagem.');
                });
            });

            const loadImagingUnits = () => {
                fetch('/inventario/unidadeimagem')
                    .then(response => response.json())
                    .then(data => {
                        if (data.erro) {
                            alert('Erro ao carregar unidades de imagem: ' + data.erro);
                        } else {
                            renderImagingUnits(data);
                        }
                    })
                    .catch(error => {
                        console.error('Erro na requisição:', error);
                        alert('Ocorreu um erro ao tentar carregar as unidades de imagem.');
                    });
            };
            
            const renderImagingUnits = (imagingUnits) => {
                imagingUnitTableBody.innerHTML = '';
                if (imagingUnits.length === 0) {
                    imagingUnitTableBody.innerHTML = '<tr><td colspan="4">Nenhuma unidade de imagem cadastrada.</td></tr>';
                    return;
                }
                imagingUnits.forEach(unit => {
                    const row = `
                        <tr>
                            <td>${unit.modelo}</td>
                            <td>${unit.quantidade_novo}</td>
                            <td>${unit.quantidade_usado}</td>
                            <td>
                                <button class="btn-small btn-add" data-id="${unit.id}" data-type="unidadeimagem" data-column="quantidade_novo">+</button>
                                <button class="btn-small btn-remove" data-id="${unit.id}" data-type="unidadeimagem" data-column="quantidade_novo">-</button>
                                <button class="btn-small btn-add" data-id="${unit.id}" data-type="unidadeimagem" data-column="quantidade_usado">+U</button>
                                <button class="btn-small btn-remove" data-id="${unit.id}" data-type="unidadeimagem" data-column="quantidade_usado">-U</button>
                            </td>
                        </tr>
                    `;
                    imagingUnitTableBody.innerHTML += row;
                });
                // Add event listeners for the add/remove buttons
                imagingUnitTableBody.querySelectorAll('.btn-add, .btn-remove').forEach(button => {
                    button.addEventListener('click', handleInventoryUpdate);
                });
            };

            loadImagingUnits();
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

    // --- Lógica para o Modal de Inventário (Toner e Unidade de Imagem) ---
    const inventoryModal = document.getElementById('inventory-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const inventoryForm = document.getElementById('inventory-form');
    const modalTitle = document.getElementById('modal-title');
    const itemIdInput = document.getElementById('item-id');
    const itemTypeInput = document.getElementById('item-type');
    const actionTypeInput = document.getElementById('action-type');
    const itemQuantityInput = document.getElementById('item-quantity');
    const itemConditionSelect = document.getElementById('item-condition');
    const confirmActionButton = document.getElementById('confirm-action');

    let currentUpdateCallback = null; // To store the callback for inventory update

    const openInventoryModal = (id, type, action, column) => {
        itemIdInput.value = id;
        itemTypeInput.value = type;
        actionTypeInput.value = action;
        itemConditionSelect.value = column.includes('novo') ? 'new' : 'used';
        modalTitle.textContent = `${action === 'add' ? 'Adicionar' : 'Remover'} ${type === 'toner' ? 'Toner' : 'Unidade de Imagem'}`;
        inventoryModal.style.display = 'block';
    };

    const closeInventoryModal = () => {
        inventoryModal.style.display = 'none';
        inventoryForm.reset();
    };

    closeModalBtn.addEventListener('click', closeInventoryModal);
    window.addEventListener('click', (event) => {
        if (event.target === inventoryModal) {
            closeInventoryModal();
        }
    });

    confirmActionButton.addEventListener('click', () => {
        const id = itemIdInput.value;
        const type = itemTypeInput.value;
        const action = actionTypeInput.value;
        const quantity = parseInt(itemQuantityInput.value);
        const condition = itemConditionSelect.value;
        const column = `quantidade_${condition === 'new' ? 'novo' : 'usado'}`;

        if (isNaN(quantity) || quantity <= 0) {
            alert('Por favor, insira uma quantidade válida.');
            return;
        }

        // Call the appropriate update function based on type
        if (type === 'toner') {
            updateTonerInventory(id, column, quantity, action);
        } else if (type === 'unidadeimagem') {
            updateImagingUnitInventory(id, column, quantity, action);
        }
        closeInventoryModal();
    });

    // Function to handle inventory updates (add/remove)
    const handleInventoryUpdate = (e) => {
        const button = e.target;
        const id = button.dataset.id;
        const type = button.dataset.type;
        const column = button.dataset.column;
        const action = button.classList.contains('btn-add') ? 'add' : 'remove';

        openInventoryModal(id, type, action, column);
    };

    const updateTonerInventory = (id, column, quantity, action) => {
        fetch('/inventario/atualizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id,
                tipo: 'toner',
                coluna: column,
                quantidade: quantity,
                action: action // Pass action to backend
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                alert('Erro ao atualizar inventário de toner: ' + data.erro);
            } else {
                alert(data.mensagem);
                loadToners(); // Reload toners after update
            }
        })
        .catch(error => {
            console.error('Erro na requisição:', error);
            alert('Ocorreu um erro ao tentar atualizar o inventário de toner.');
        });
    };

    const updateImagingUnitInventory = (id, column, quantity, action) => {
        fetch('/inventario/atualizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: id,
                tipo: 'unidadeimagem',
                coluna: column,
                quantidade: quantity,
                action: action // Pass action to backend
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.erro) {
                alert('Erro ao atualizar inventário de unidade de imagem: ' + data.erro);
            } else {
                alert(data.mensagem);
                loadImagingUnits(); // Reload imaging units after update
            }
        })
        .catch(error => {
            console.error('Erro na requisição:', error);
            alert('Ocorreu um erro ao tentar atualizar o inventário de unidade de imagem.');
        });
    };