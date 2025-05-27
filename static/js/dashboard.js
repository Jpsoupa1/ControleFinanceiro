// Aguardar o carregamento completo da página
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Dashboard carregado!")
  definirDataHoraAtual()
  configurarModais()
  configurarMenuUsuario()
})

// Função para definir data/hora atual
function definirDataHoraAtual() {
  const now = new Date()
  const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  const dateInput = document.getElementById("purchase-date")
  if (dateInput) {
    dateInput.value = localDateTime
  }
}

// Configurar modais
function configurarModais() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        fecharModal(modal.id)
      }
    })
  })
}

// Configurar menu do usuário
function configurarMenuUsuario() {
  // Fechar menu ao clicar fora
  document.addEventListener("click", (e) => {
    const menuToggle = document.getElementById("menu-toggle")
    const userDropdown = document.getElementById("user-dropdown")

    if (!menuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
      fecharMenuUsuario()
    }
  })
}

// Função para toggle do menu do usuário
function toggleUserMenu() {
  const menuToggle = document.getElementById("menu-toggle")
  const userDropdown = document.getElementById("user-dropdown")

  menuToggle.classList.toggle("active")
  userDropdown.classList.toggle("active")
}

// Função para fechar menu do usuário
function fecharMenuUsuario() {
  const menuToggle = document.getElementById("menu-toggle")
  const userDropdown = document.getElementById("user-dropdown")

  menuToggle.classList.remove("active")
  userDropdown.classList.remove("active")
}

// Funções do menu dropdown
function abrirPerfil() {
  fecharMenuUsuario()
  mostrarNotificacao("👤 Abrindo perfil do usuário...", "info")
  // Aqui você pode implementar a abertura do modal de perfil
}

function abrirConfiguracoes() {
  fecharMenuUsuario()
  mostrarNotificacao("⚙️ Abrindo configurações...", "info")
  // Aqui você pode implementar a abertura do modal de configurações
}

function abrirAjuda() {
  fecharMenuUsuario()
  mostrarNotificacao("❓ Abrindo central de ajuda...", "info")
  // Aqui você pode implementar a abertura da ajuda
}

function abrirSobre() {
  fecharMenuUsuario()
  mostrarNotificacao("ℹ️ Planeja+ Pro v1.0 - Desenvolvido com ❤️", "info")
}

// Função para abrir modal
function abrirModal(modalId) {
  console.log("📂 Abrindo modal:", modalId)
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.add("active")
    modal.style.display = "flex"

    // Focar no primeiro input
    const firstInput = modal.querySelector("input, select, textarea")
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 50)
    }
  }
}

// Função para fechar modal
function fecharModal(modalId) {
  console.log("📁 Fechando modal:", modalId)
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.remove("active")
    setTimeout(() => {
      modal.style.display = "none"
    }, 200)
  }
}

// Função para mostrar relatório
function mostrarRelatorio() {
  mostrarNotificacao("📊 Funcionalidade de relatório em desenvolvimento!", "info")
}

// Função para mostrar configurações
function mostrarConfiguracoes() {
  mostrarNotificacao("⚙️ Configurações em desenvolvimento!", "info")
}

// Sistema de notificações otimizado
function mostrarNotificacao(mensagem, tipo = "info") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${tipo}`
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <span>${getNotificationIcon(tipo)}</span>
      <span>${mensagem}</span>
    </div>
  `

  // Estilos otimizados
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    padding: 16px 24px;
    color: #2d3748;
    font-weight: 600;
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    max-width: 400px;
  `

  document.body.appendChild(notification)

  // Animar entrada
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 50)

  // Remover após 3 segundos
  setTimeout(() => {
    notification.style.transform = "translateX(400px)"
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

function getNotificationIcon(tipo) {
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  }
  return icons[tipo] || "ℹ️"
}

// Função para confirmar exclusão de categoria
function confirmarExclusaoCategoria(categoriaId, categoriaNome) {
  console.log("🗑️ Confirmação para excluir categoria:", categoriaId, categoriaNome)

  const modal = document.getElementById("delete-confirmation-modal")
  const messageDiv = document.getElementById("delete-message")
  const confirmBtn = document.getElementById("confirm-delete-btn")

  messageDiv.innerHTML = `
    <p><strong>Categoria:</strong> ${categoriaNome}</p>
    <br>
    <p>⚠️ <strong>ATENÇÃO:</strong></p>
    <ul style="text-align: left; margin: 16px 0; padding-left: 20px;">
      <li>Esta ação não pode ser desfeita</li>
      <li>Todas as transações relacionadas também serão excluídas</li>
      <li>Os dados serão removidos permanentemente</li>
    </ul>
    <p>Tem certeza que deseja continuar?</p>
  `

  confirmBtn.onclick = () => {
    fecharModal("delete-confirmation-modal")
    executarExclusaoCategoria(categoriaId, categoriaNome)
  }

  abrirModal("delete-confirmation-modal")
}

// Função para executar exclusão de categoria
function executarExclusaoCategoria(categoriaId, categoriaNome) {
  console.log("🗑️ Executando exclusão da categoria:", categoriaId)

  const categoriaCard = document.getElementById(`categoria-${categoriaId}`)

  if (categoriaCard) {
    categoriaCard.classList.add("loading")
    const botoes = categoriaCard.querySelectorAll("button")
    botoes.forEach((btn) => {
      btn.disabled = true
    })
  }

  mostrarNotificacao("⏳ Excluindo categoria...", "info")

  const formData = new FormData()
  formData.append("categoria_id", categoriaId)

  fetch("/delete_category", {
    method: "POST",
    body: formData,
    credentials: "same-origin",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        if (categoriaCard) {
          categoriaCard.style.transition = "all 0.3s ease"
          categoriaCard.style.opacity = "0"
          categoriaCard.style.transform = "scale(0.8)"

          setTimeout(() => {
            categoriaCard.remove()

            const grid = document.getElementById("categories-grid")
            if (grid && grid.children.length === 0) {
              grid.innerHTML = `
                <div class="empty-state">
                  <span class="empty-icon">🏷️</span>
                  <p>Nenhuma categoria criada ainda</p>
                  <button class="btn-secondary interactive-element" type="button" onclick="abrirModal('add-category-modal')">
                    ✨ Criar primeira categoria
                  </button>
                </div>
              `
            }
          }, 300)
        }

        mostrarNotificacao(data.message, "success")

        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        throw new Error(data.error || "Erro desconhecido")
      }
    })
    .catch((error) => {
      console.error("❌ Erro:", error)
      mostrarNotificacao("❌ Erro ao excluir categoria: " + error.message, "error")

      if (categoriaCard) {
        categoriaCard.classList.remove("loading")
        const botoes = categoriaCard.querySelectorAll("button")
        botoes.forEach((btn) => {
          btn.disabled = false
        })
      }
    })
}

// Função para confirmar exclusão de transação
function confirmarExclusaoTransacao(transacaoId) {
  const modal = document.getElementById("delete-confirmation-modal")
  const messageDiv = document.getElementById("delete-message")
  const confirmBtn = document.getElementById("confirm-delete-btn")

  messageDiv.innerHTML = `
    <p><strong>Transação ID:</strong> ${transacaoId}</p>
    <br>
    <p>⚠️ Esta ação não pode ser desfeita.</p>
    <p>Tem certeza que deseja excluir esta transação?</p>
  `

  confirmBtn.onclick = () => {
    fecharModal("delete-confirmation-modal")
    executarExclusaoTransacao(transacaoId)
  }

  abrirModal("delete-confirmation-modal")
}

// Função para executar exclusão de transação
function executarExclusaoTransacao(transacaoId) {
  const transacaoRow = document.getElementById(`compra-${transacaoId}`)

  if (transacaoRow) {
    transacaoRow.classList.add("loading")
  }

  mostrarNotificacao("⏳ Excluindo transação...", "info")

  const formData = new FormData()
  formData.append("purchase_id", transacaoId)

  fetch("/delete_purchase", {
    method: "POST",
    body: formData,
    credentials: "same-origin",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      if (data.success) {
        if (transacaoRow) {
          transacaoRow.style.transition = "all 0.3s ease"
          transacaoRow.style.opacity = "0"

          setTimeout(() => {
            transacaoRow.remove()
          }, 300)
        }

        mostrarNotificacao(data.message, "success")

        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        throw new Error(data.error || "Erro desconhecido")
      }
    })
    .catch((error) => {
      console.error("❌ Erro:", error)
      mostrarNotificacao("❌ Erro ao excluir transação: " + error.message, "error")

      if (transacaoRow) {
        transacaoRow.classList.remove("loading")
      }
    })
}

// Função para editar categoria
function editarCategoria(categoriaId, categoriaNome) {
  mostrarNotificacao("✏️ Funcionalidade de edição em desenvolvimento!", "info")
}

// Função para adicionar transação
function adicionarTransacao(event) {
  event.preventDefault()

  const valor = Number.parseFloat(document.getElementById("purchase-value").value)
  const categoriaId = Number.parseInt(document.getElementById("purchase-category").value)
  const descricao = document.getElementById("purchase-description").value
  const dataHora = document.getElementById("purchase-date").value

  if (!valor || valor <= 0) {
    mostrarNotificacao("❌ Por favor, insira um valor válido maior que zero.", "error")
    return
  }

  if (!categoriaId) {
    mostrarNotificacao("❌ Por favor, selecione uma categoria.", "error")
    return
  }

  if (!dataHora) {
    mostrarNotificacao("❌ Por favor, selecione uma data e hora.", "error")
    return
  }

  const submitBtn = event.target.querySelector('button[type="submit"]')
  const textoOriginal = submitBtn.textContent
  submitBtn.textContent = "⏳ Salvando..."
  submitBtn.disabled = true

  const formData = new FormData()
  formData.append("amount", valor)
  formData.append("categoria_id", categoriaId)
  formData.append("descricao", descricao || "")
  formData.append("purchase_time", dataHora)

  fetch("/add_purchase", {
    method: "POST",
    body: formData,
    credentials: "same-origin",
  })
    .then((response) => {
      if (response.ok) {
        mostrarNotificacao("✅ Transação adicionada com sucesso!", "success")
        fecharModal("add-purchase-modal")
        event.target.reset()
        definirDataHoraAtual()

        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        throw new Error("Erro ao adicionar transação")
      }
    })
    .catch((error) => {
      console.error("Erro:", error)
      mostrarNotificacao("❌ Erro ao adicionar transação. Tente novamente.", "error")
    })
    .finally(() => {
      submitBtn.textContent = textoOriginal
      submitBtn.disabled = false
    })
}

// Função para adicionar categoria
function adicionarCategoria(event) {
  event.preventDefault()

  const nome = document.getElementById("category-name").value.trim()

  if (!nome) {
    mostrarNotificacao("❌ Por favor, digite o nome da categoria.", "error")
    return
  }

  if (nome.length < 2) {
    mostrarNotificacao("❌ O nome da categoria deve ter pelo menos 2 caracteres.", "error")
    return
  }

  const submitBtn = event.target.querySelector('button[type="submit"]')
  const textoOriginal = submitBtn.textContent
  submitBtn.textContent = "⏳ Criando..."
  submitBtn.disabled = true

  const formData = new FormData()
  formData.append("nome", nome)

  fetch("/add_category", {
    method: "POST",
    body: formData,
    credentials: "same-origin",
  })
    .then((response) => {
      if (response.ok) {
        mostrarNotificacao("✅ Categoria criada com sucesso!", "success")
        fecharModal("add-category-modal")
        event.target.reset()

        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        throw new Error("Erro ao criar categoria")
      }
    })
    .catch((error) => {
      console.error("Erro:", error)
      mostrarNotificacao("❌ Erro ao criar categoria. Tente novamente.", "error")
    })
    .finally(() => {
      submitBtn.textContent = textoOriginal
      submitBtn.disabled = false
    })
}
