// Mobile Menu Toggle
function toggleMobileMenu() {
    const toggle = document.querySelector(".mobile-menu-toggle")
    const menu = document.querySelector(".nav-menu")
  
    toggle.classList.toggle("active")
    menu.classList.toggle("active")
  }
  
  // Smooth Scrolling for Navigation Links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
  
  // Navbar Background on Scroll
  window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar")
    if (window.scrollY > 50) {
      navbar.style.background = "rgba(255, 255, 255, 0.98)"
      navbar.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)"
    } else {
      navbar.style.background = "rgba(255, 255, 255, 0.95)"
      navbar.style.boxShadow = "none"
    }
  })
  
  // Form Enhancement
  document.querySelector(".signup-form")?.addEventListener("submit", function (e) {
    const email = this.querySelector('input[type="email"]').value
    if (email) {
      // Passa o email como parâmetro para a página de registro
      const url = new URL(this.action, window.location.origin)
      url.searchParams.set("email", email)
      window.location.href = url.toString()
      e.preventDefault()
    }
  })
  
  // Intersection Observer for Animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)
  
  // Observe feature cards
  document.querySelectorAll(".feature-card").forEach((card) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(30px)"
    card.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(card)
  })
  
  // Loading Animation
  window.addEventListener("load", () => {
    document.body.classList.add("loaded")
  })
  
  // Parallax Effect for Hero Background
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset
    const parallax = document.querySelector(".hero-bg-elements")
    if (parallax) {
      const speed = scrolled * 0.5
      parallax.style.transform = `translateY(${speed}px)`
    }
  })
  
  // Email Validation
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }
  
  // Enhanced Form Validation
  document.querySelector(".email-input")?.addEventListener("input", function () {
    const email = this.value
    const submitBtn = document.querySelector(".btn-signup")
  
    if (validateEmail(email)) {
      this.style.borderColor = "#10b981"
      submitBtn.disabled = false
      submitBtn.style.opacity = "1"
    } else {
      this.style.borderColor = "#e5e7eb"
      submitBtn.disabled = true
      submitBtn.style.opacity = "0.7"
    }
  })
  
  // Console Welcome Message
  console.log(`
  🎉 Bem-vindo ao Planeja+ Pro!
  💎 Sua jornada para a liberdade financeira começa aqui.
  🚀 Desenvolvido com ❤️ para transformar suas finanças.
  `)
  