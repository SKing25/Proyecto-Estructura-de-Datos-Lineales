// ================================
// FUNCIONALIDADES GLOBALES
// ================================

// Funcionalidad del Toggle de Tema
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.body = document.body;
        this.init();
    }
    
    init() {
        if (!this.themeToggle) return;
        
        // Cargar tema guardado o usar tema claro por defecto
        const savedTheme = this.getSavedTheme() || 'light';
        this.applyTheme(savedTheme);
        
        // Event listener para el toggle
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }
    
    getSavedTheme() {
        // Intentar usar localStorage, si falla usar sessionStorage o cookies
        try {
            return localStorage.getItem('theme') || this.getCookieTheme() || 'light';
        } catch (e) {
            return this.getCookieTheme() || window.currentTheme || 'light';
        }
    }
    
    saveTheme(theme) {
        // Guardar en múltiples lugares para persistencia
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            // Si localStorage falla, usar cookies
            this.setCookieTheme(theme);
        }
        
        // También guardar en variable global como respaldo
        window.currentTheme = theme;
    }
    
    getCookieTheme() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'theme') {
                return value;
            }
        }
        return null;
    }
    
    setCookieTheme(theme) {
        // Guardar por 30 días
        const expires = new Date();
        expires.setTime(expires.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = `theme=${theme};expires=${expires.toUTCString()};path=/`;
    }
    
    applyTheme(theme) {
        this.body.setAttribute('data-theme', theme);
        this.themeToggle.className = `theme-toggle ${theme}`;
        this.saveTheme(theme);
    }
    
    toggleTheme() {
        const currentTheme = this.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
}

// Gestión de Renderizado Optimizado para Listas Grandes
class ListOptimizer {
    constructor() {
        this.isOptimizing = false;
        this.renderQueue = [];
        this.init();
    }
    
    init() {
        this.optimizeTableRendering();
        this.addLoadingIndicators();
    }
    
    optimizeTableRendering() {
        const table = document.querySelector('table');
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        const rows = tbody?.querySelectorAll('tr');
        
        if (!rows || rows.length < 10) return; // Solo optimizar si hay muchas filas
        
        // Ocultar tabla durante el renderizado
        table.style.visibility = 'hidden';
        table.style.opacity = '0';
        
        // Usar requestAnimationFrame para renderizado por lotes
        this.renderRowsInBatches(rows, table);
    }
    
    renderRowsInBatches(rows, table) {
        const batchSize = 20; // Renderizar 20 filas por lote
        let currentIndex = 0;
        
        const renderBatch = () => {
            const endIndex = Math.min(currentIndex + batchSize, rows.length);
            
            for (let i = currentIndex; i < endIndex; i++) {
                const row = rows[i];
                row.style.opacity = '0';
                row.style.transform = 'translateY(10px)';
                
                // Aplicar animación gradual
                setTimeout(() => {
                    row.style.transition = 'all 0.3s ease';
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                }, (i - currentIndex) * 50);
            }
            
            currentIndex = endIndex;
            
            if (currentIndex < rows.length) {
                requestAnimationFrame(renderBatch);
            } else {
                // Mostrar tabla cuando termine
                setTimeout(() => {
                    table.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
                    table.style.visibility = 'visible';
                    table.style.opacity = '1';
                }, 200);
            }
        };
        
        requestAnimationFrame(renderBatch);
    }
    
    addLoadingIndicators() {
        // Agregar indicador de carga para operaciones lentas
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('input[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.value = 'Procesando...';
                    
                    // Mostrar spinner
                    this.showLoadingSpinner(form);
                }
            });
        });
    }
    
    showLoadingSpinner(container) {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-circle"></div>
            <span>Procesando datos...</span>
        `;
        container.appendChild(spinner);
    }
}
class ParticleManager {
    constructor() {
        this.particlesContainer = document.querySelector('.background-particles');
        this.init();
    }
    
    init() {
        if (!this.particlesContainer) return;
        this.createRandomParticles();
    }
    
    createRandomParticles() {
        // Crear partículas adicionales dinámicamente
        const particleCount = Math.floor(Math.random() * 6) + 6; // Entre 6 y 12 partículas
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = -Math.random() * 6 + 's';
            particle.style.animationDuration = (4 + Math.random() * 4) + 's';
            this.particlesContainer.appendChild(particle);
        }
    }
}

// ================================
// FUNCIONALIDADES DEL CARRUSEL (INDEX)
// ================================

class CarouselManager {
    constructor() {
        this.currentSlide = 0;
        this.cards = document.querySelectorAll('.card');
        this.indicators = document.querySelectorAll('.indicator');
        this.track = document.getElementById('carouselTrack');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.selectBtn = document.getElementById('selectBtn');
        this.autoSlideInterval = null;
        
        this.init();
    }
    
    init() {
        if (!this.track || this.cards.length === 0) return;
        
        // Event listeners para los botones
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
        this.selectBtn?.addEventListener('click', () => this.selectCurrentStructure());
        
        // Event listeners para los indicadores
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.currentSlide = index;
                this.updateCarousel();
            });
        });
        
        // Iniciar auto-slide
        this.startAutoSlide();
        
        // Pausar auto-slide al hacer hover
        this.track.addEventListener('mouseenter', () => this.stopAutoSlide());
        this.track.addEventListener('mouseleave', () => this.startAutoSlide());
    }
    
    updateCarousel() {
        this.cards.forEach((card, index) => {
            card.classList.toggle('active', index === this.currentSlide);
        });
        
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
        
        this.track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    }
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.cards.length;
        this.updateCarousel();
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.cards.length) % this.cards.length;
        this.updateCarousel();
    }
    
    selectCurrentStructure() {
        const activeCard = this.cards[this.currentSlide];
        const url = activeCard?.dataset.url;
        
        if (url && !activeCard.classList.contains('coming-soon')) {
            window.location.href = url;
        }
    }
    
    startAutoSlide() {
        this.stopAutoSlide(); // Limpiar cualquier intervalo existente
        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }
    
    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
}

// ================================
// EFECTOS VISUALES PARA LISTAS
// ================================

class ListVisualEffects {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupListEffects();
    }
    
    setupListEffects() {
        const table = document.querySelector('table');
        if (!table) return;
        
        const rows = table.querySelectorAll('tbody tr');
        const currentPage = this.getCurrentPageType();
        
        switch(currentPage) {
            case 'simple':
                this.setupSimpleListEffects(rows);
                break;
            case 'doble':
                this.setupDoubleListEffects(rows);
                break;
            case 'circular':
                this.setupCircularListEffects(rows);
                break;
        }
    }
    
    getCurrentPageType() {
        const url = window.location.pathname;
        if (url.includes('lista-simple')) return 'simple';
        if (url.includes('lista-doble')) return 'doble';
        if (url.includes('lista-circular')) return 'circular';
        return 'unknown';
    }
    
    setupSimpleListEffects(rows) {
        // Optimización: No aplicar animaciones si hay demasiadas filas
        const shouldAnimate = rows.length < 100;
        
        rows.forEach((row, index) => {
            if (index < rows.length - 1) {
                row.style.borderRight = '3px solid #667eea';
                row.title = 'Este elemento apunta al siguiente';
            } else {
                row.style.borderRight = '3px solid #f093fb';
                row.title = 'Último elemento (apunta a NULL)';
            }
            
            if (shouldAnimate) {
                // Animación de entrada solo para listas pequeñas
                row.style.opacity = '0';
                row.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    row.style.transition = 'all 0.3s ease';
                    row.style.opacity = '1';
                    row.style.transform = 'translateX(0)';
                }, Math.min(index * 50, 2000)); // Máximo 2 segundos de delay
            }
        });
    }
    
    setupDoubleListEffects(rows) {
        const shouldAnimate = rows.length < 100;
        
        rows.forEach((row, index) => {
            // Indicar conexiones bidireccionales
            if (index > 0) {
                row.style.borderLeft = '3px solid #764ba2';
            }
            if (index < rows.length - 1) {
                row.style.borderRight = '3px solid #667eea';
            }
            row.title = 'Elemento con navegación bidireccional';
            
            if (shouldAnimate) {
                // Animación de entrada alternada solo para listas pequeñas
                row.style.opacity = '0';
                row.style.transform = index % 2 === 0 ? 'translateX(-20px)' : 'translateX(20px)';
                
                setTimeout(() => {
                    row.style.transition = 'all 0.4s ease';
                    row.style.opacity = '1';
                    row.style.transform = 'translateX(0)';
                }, Math.min(index * 75, 2000));
            }
        });
    }
    
    setupCircularListEffects(rows) {
        const shouldAnimate = rows.length < 100;
        
        rows.forEach((row, index) => {
            row.style.borderRadius = '8px';
            row.title = 'Parte de la estructura circular';
            
            // Efecto circular visual
            if (index === 0) {
                row.style.borderLeft = '3px solid #f093fb';
                row.style.borderTop = '3px solid #f093fb';
            }
            if (index === rows.length - 1) {
                row.style.borderRight = '3px solid #667eea';
                row.style.borderBottom = '3px solid #667eea';
            }
            
            if (shouldAnimate) {
                // Animación circular solo para listas pequeñas
                row.style.opacity = '0';
                row.style.transform = 'scale(0.8) rotate(-10deg)';
                
                setTimeout(() => {
                    row.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                    row.style.opacity = '1';
                    row.style.transform = 'scale(1) rotate(0deg)';
                }, Math.min(index * 100, 2000));
            }
        });
    }
}

// ================================
// UTILIDADES GENERALES
// ================================

class Utils {
    static showInfo() {
        const infoPanel = document.getElementById('infoPanel');
        if (infoPanel) {
            infoPanel.style.display = infoPanel.style.display === 'block' ? 'none' : 'block';
        }
    }
    
    static addHoverEffects() {
        // Agregar efectos hover a las tarjetas de operación
        const operationCards = document.querySelectorAll('.operation-card');
        operationCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)';
                this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            });
        });
    }
    
    static enhanceButtons() {
        // Mejorar la interactividad de los botones
        const buttons = document.querySelectorAll('input[type="submit"], button');
        buttons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                // Efecto ripple
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');
                
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });
    }
}

// ================================
// INICIALIZACIÓN
// ================================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todos los managers
    new ThemeManager();
    new ParticleManager();
    new CarouselManager();
    new ListOptimizer(); // Nuevo optimizador
    new ListVisualEffects();
    
    // Aplicar utilidades
    Utils.addHoverEffects();
    Utils.enhanceButtons();
    
    // Hacer disponible la función showInfo globalmente
    window.showInfo = Utils.showInfo;
});

// Agregar estilos para el efecto ripple y optimizaciones
const rippleStyles = `
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
}

@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

button, input[type="submit"] {
    position: relative;
    overflow: hidden;
}

.operation-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.loading-spinner {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
}

.spinner-circle {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Optimización para tablas grandes */
table {
    will-change: opacity, visibility;
}

tbody tr {
    will-change: opacity, transform;
}

/* Reducir animaciones en listas grandes */
@media (max-height: 800px) {
    .particle {
        animation-duration: 8s !important;
    }
}
`;

// Insertar estilos en el documento
const styleSheet = document.createElement('style');
styleSheet.textContent = rippleStyles;
document.head.appendChild(styleSheet);