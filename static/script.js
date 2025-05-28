// ================================
// FUNCIONALIDADES GLOBALES
// ================================

// Esta madre controla el tema claro/oscuro de toda la página
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.body = document.body;
        this.init();
    }
    
    init() {
        if (!this.themeToggle) return;
        
        // Cargar el tema que tenía guardado el usuario o usar claro por defecto
        const savedTheme = this.getSavedTheme() || 'light';
        this.applyTheme(savedTheme);
        
        // Pa' cuando el usuario le dé click al botón del tema
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
    }
    
    // Esta función busca el tema guardado en varios lugares por si acaso
    getSavedTheme() {
        try {
            // Primero intenta localStorage, luego cookies, luego variable global
            return localStorage.getItem('theme') || this.getCookieTheme() || window.currentTheme || 'light';
        } catch (e) {
            // Si localStorage está bloqueado, usa alternativas
            return this.getCookieTheme() || window.currentTheme || 'light';
        }
    }
    
    // Guarda el tema en múltiples lugares pa' que no se pierda
    saveTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            // Si no puede usar localStorage, guarda en cookies
            console.warn('localStorage no disponible, usando cookies');
            this.setCookieTheme(theme);
        }
        
        // También lo guarda en una variable global como respaldo
        window.currentTheme = theme;
    }
    
    // Lee el tema desde las cookies
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
    
    // Guarda el tema en cookies que duran 30 días
    setCookieTheme(theme) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (30 * 24 * 60 * 60 * 1000));
        document.cookie = `theme=${theme};expires=${expires.toUTCString()};path=/`;
    }
    
    // Aplica el tema a toda la página
    applyTheme(theme) {
        this.body.setAttribute('data-theme', theme);
        this.themeToggle.className = `theme-toggle ${theme}`;
        this.saveTheme(theme);
    }
    
    // Cambia entre tema claro y oscuro
    toggleTheme() {
        const currentTheme = this.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
}

// Esta clase optimiza el renderizado cuando hay muchos elementos en listas
class ListOptimizer {
    constructor() {
        this.isOptimizing = false;
        this.renderQueue = [];
        this.performanceMetrics = {
            startTime: 0,
            renderTime: 0
        };
        this.init();
    }
    
    init() {
        this.optimizeTableRendering();
        this.addLoadingIndicators();
        this.setupIntersectionObserver(); // Mejora: lazy loading
    }
    
    // Renderiza las tablas grandes por lotes pa' que no se cuelgue el navegador
    optimizeTableRendering() {
        const table = document.querySelector('table');
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        const rows = tbody?.querySelectorAll('tr');
        
        // Solo optimiza si hay más de 10 filas
        if (!rows || rows.length < 10) return;
        
        this.performanceMetrics.startTime = performance.now();
        
        // Oculta la tabla mientras se renderiza
        table.style.visibility = 'hidden';
        table.style.opacity = '0';
        
        // Renderiza por lotes pa' mantener fluidez
        this.renderRowsInBatches(rows, table);
    }
    
    // Renderiza las filas en grupos pequeños usando requestAnimationFrame
    renderRowsInBatches(rows, table) {
        const batchSize = Math.min(20, Math.ceil(rows.length / 10)); // Mejora: tamaño dinámico
        let currentIndex = 0;
        
        const renderBatch = () => {
            const endIndex = Math.min(currentIndex + batchSize, rows.length);
            
            // Renderiza un lote de filas
            for (let i = currentIndex; i < endIndex; i++) {
                const row = rows[i];
                row.style.opacity = '0';
                row.style.transform = 'translateY(10px)';
                
                // Anima cada fila con un pequeño delay
                setTimeout(() => {
                    row.style.transition = 'all 0.3s ease';
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                }, (i - currentIndex) * 25); // Mejora: delay más rápido
            }
            
            currentIndex = endIndex;
            
            // Si quedan más filas, continúa en el siguiente frame
            if (currentIndex < rows.length) {
                requestAnimationFrame(renderBatch);
            } else {
                // Cuando termina, muestra la tabla
                this.finishTableRender(table);
            }
        };
        
        requestAnimationFrame(renderBatch);
    }
    
   // función separada pa' finalizar el renderizado
    finishTableRender(table) {
        setTimeout(() => {
            table.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
            table.style.visibility = 'visible';
            table.style.opacity = '1';
            
            // Métricas de rendimiento
            this.performanceMetrics.renderTime = performance.now() - this.performanceMetrics.startTime;
            console.log(`Tabla renderizada en ${this.performanceMetrics.renderTime.toFixed(2)}ms`);
        }, 100);
    }
    
    // Mejora: Intersection Observer pa' lazy loading
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        // Observa elementos que pueden beneficiarse de lazy loading
        document.querySelectorAll('.operation-card, .card').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Agrega indicadores de carga a los formularios
    addLoadingIndicators() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
                if (submitBtn && !submitBtn.disabled) {
                    this.showFormLoading(submitBtn, form);
                }
            });
        });
    }
    
    // función separada pa' el loading de formularios
    showFormLoading(submitBtn, form) {
        const originalText = submitBtn.value || submitBtn.textContent;
        submitBtn.disabled = true;
        
        if (submitBtn.tagName === 'INPUT') {
            submitBtn.value = 'Procesando...';
        } else {
            submitBtn.textContent = 'Procesando...';
        }
        
        // Muestra spinner
        const spinner = this.createLoadingSpinner();
        form.appendChild(spinner);
        
        // Auto-reset después de 10 segundos por si acaso 
        setTimeout(() => {
            if (submitBtn.disabled) {
                submitBtn.disabled = false;
                if (submitBtn.tagName === 'INPUT') {
                    submitBtn.value = originalText;
                } else {
                    submitBtn.textContent = originalText;
                }
                if (spinner.parentNode) {
                    spinner.remove();
                }
            }
        }, 10000);
    }
    
    // función separada pa' crear el mensaje de carga de datos
    
    createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-circle"></div>
            <span>Procesando datos...</span>
        `;
        return spinner;
    }
}

// Esta clase maneja las partículas de fondo que cambian según el tema
class ParticleManager {
    constructor() {
        this.particlesContainer = document.querySelector('.background-particles');
        this.particles = [];
        this.currentTheme = 'light';
        this.animationId = null; // Mejora: controlar animaciones
        this.init();
    }
    
    init() {
        if (!this.particlesContainer) return;
        this.currentTheme = document.body.getAttribute('data-theme') || 'light';
        this.createThemedParticles();
        this.observeThemeChanges();
    }
    
    // Observa cuando cambia el tema pa' actualizar las partículas
    observeThemeChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    const newTheme = document.body.getAttribute('data-theme') || 'light';
                    if (newTheme !== this.currentTheme) {
                        this.currentTheme = newTheme;
                        this.updateParticlesForTheme();
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
    
    // Crea las partículas según el tema actual
    createThemedParticles() {
        this.clearParticles();
        
        if (this.currentTheme === 'dark') {
            this.createStarsAndMeteors(); // Pa' tema oscuro: estrellas y meteoros
        } else {
            this.createSunbeamsAndClouds(); // Pa' tema claro: rayos de sol y nubes
        }
    }
    
    // Crea efectos nocturnos: estrellas, meteoros y brillos
    createStarsAndMeteors() {
        // Estrellas estáticas que brillan
        for (let i = 0; i < 15; i++) {
            const star = this.createParticle('star', '✦');
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = -Math.random() * 3 + 's';
            this.addParticle(star);
        }
        
        // Meteoros que cruzan la pantalla
        for (let i = 0; i < 4; i++) {
            const meteor = this.createParticle('meteor', '🌒');
            meteor.style.left = (Math.random() * 120 - 20) + '%';
            meteor.style.animationDelay = -Math.random() * 8 + 's';
            meteor.style.animationDuration = (3 + Math.random() * 2) + 's';
            meteor.style.transform = `rotate(${Math.random() * 360}deg)`;
            this.addParticle(meteor);
        }
        
        // Estrellas con efectos de centelleo
        for (let i = 0; i < 6; i++) {
            const twinkleStar = this.createParticle('twinkle-star', '⭐');
            twinkleStar.style.left = Math.random() * 100 + '%';
            twinkleStar.style.top = Math.random() * 100 + '%';
            twinkleStar.style.animationDelay = -Math.random() * 4 + 's';
            this.addParticle(twinkleStar);
        }
    }
    
    // Crea efectos diurnos: sol, nubes y destellos
    createSunbeamsAndClouds() {
        // Rayos de sol que se mueven lentamente
        for (let i = 0; i < 8; i++) {
            const sunbeam = this.createParticle('sunbeam', '☀️');
            sunbeam.style.left = Math.random() * 100 + '%';
            sunbeam.style.animationDelay = -Math.random() * 6 + 's';
            sunbeam.style.animationDuration = (5 + Math.random() * 3) + 's';
            this.addParticle(sunbeam);
        }
        
        // Nubes que flotan horizontalmente
        for (let i = 0; i < 5; i++) {
            const cloud = this.createParticle('cloud', '☁️');
            cloud.style.left = (Math.random() * 120 - 20) + '%';
            cloud.style.top = (Math.random() * 30 + 10) + '%';
            cloud.style.animationDelay = -Math.random() * 10 + 's';
            cloud.style.animationDuration = (8 + Math.random() * 4) + 's';
            this.addParticle(cloud);
        }
        
        // Destellos de luz dorada
        for (let i = 0; i < 10; i++) {
            const sparkle = this.createParticle('light-sparkle', '✨');
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.animationDelay = -Math.random() * 4 + 's';
            sparkle.style.animationDuration = (3 + Math.random() * 2) + 's';
            this.addParticle(sparkle);
        }
    }
    
    // Mejora: función helper pa' crear partículas
    createParticle(className, content) {
        const particle = document.createElement('div');
        particle.className = `particle ${className}`;
        particle.innerHTML = content;
        return particle;
    }
    
    // función helper pa' agregar partículas
    addParticle(particle) {
        this.particlesContainer.appendChild(particle);
        this.particles.push(particle);
    }
    
    // Transición suave cuando cambia el tema - esto está chingón
    updateParticlesForTheme() {
        const morphDuration = 1200;
        const newTheme = this.currentTheme;
        
        // Separa las partículas: unas se transforman, otras desaparecen
        const morphableParticles = [];
        const fadingParticles = [];
        
        this.particles.forEach((particle, index) => {
            // 60% se transforman, 40% desaparecen
            if (index < Math.min(this.particles.length * 0.6, 8)) {
                morphableParticles.push(particle);
            } else {
                fadingParticles.push(particle);
            }
        });
        
        // Fase 1: Transforma algunas partículas con efecto morphing
        morphableParticles.forEach((particle, index) => {
            setTimeout(() => {
                this.morphParticle(particle, newTheme);
            }, index * 150);
        });
        
        // Fase 2: Desvanece las partículas restantes
        fadingParticles.forEach((particle, index) => {
            setTimeout(() => {
                particle.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                particle.style.opacity = '0';
                particle.style.transform = 'scale(0) rotate(180deg)';
                particle.style.filter = 'blur(5px)';
            }, index * 100);
        });
        
        // Fase 3: Limpia y crea partículas nuevas
        setTimeout(() => {
            this.cleanupAndCreateNew(fadingParticles, morphableParticles, newTheme);
        }, morphDuration);
    }
    
    // función separada pa' cleanup
    cleanupAndCreateNew(fadingParticles, morphableParticles, newTheme) {
        // bye bye partículas que se desvanecieron
        fadingParticles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        
        // Actualiza la lista de partículas activas
        this.particles = morphableParticles;
        
        // Crea partículas adicionales si es necesario
        this.createAdditionalParticles(newTheme);
    }
    
    
    morphParticle(particle, newTheme) {
        // Crea un overlay pa' la transición
        const morphOverlay = document.createElement('div');
        Object.assign(morphOverlay.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            opacity: '0',
            transform: 'scale(0)',
            transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            fontSize: particle.style.fontSize,
            pointerEvents: 'none'
        });
        
        // Decide qué mostrar según el tema
        const newContent = this.getNewParticleContent(newTheme);
        morphOverlay.innerHTML = newContent.content;
        morphOverlay.className = `particle ${newContent.className}`;
        
        particle.appendChild(morphOverlay);
        
        // Ejecuta la transformación en etapas
        this.executeParticleTransformation(particle, morphOverlay, newTheme);
    }
    
    // función separada pa' obtener contenido nuevo
    getNewParticleContent(newTheme) {
        if (newTheme === 'dark') {
            return Math.random() > 0.5 
                ? { content: '✦', className: 'star' }
                : { content: '⭐', className: 'twinkle-star' };
        } else {
            return Math.random() > 0.5
                ? { content: '☀️', className: 'sunbeam' }
                : { content: '✨', className: 'light-sparkle' };
        }
    }
    
    // Mejora: función separada pa' ejecutar la transformación
    executeParticleTransformation(particle, morphOverlay, newTheme) {
        setTimeout(() => {
            // Fase 1: Desvanece contenido original
            particle.style.transition = 'all 0.6s ease-out';
            particle.style.filter = 'blur(3px) brightness(0.3)';
            
            // Fase 2: Muestra nuevo contenido
            setTimeout(() => {
                morphOverlay.style.opacity = '1';
                morphOverlay.style.transform = 'scale(1.2)';
                
                // Fase 3: Reemplaza completamente
                setTimeout(() => {
                    particle.innerHTML = morphOverlay.innerHTML;
                    particle.className = morphOverlay.className;
                    particle.style.filter = 'blur(0px) brightness(1)';
                    particle.style.transition = 'all 0.4s ease-out';
                    
                    this.applyThemeSpecificAnimation(particle, newTheme);
                }, 300);
            }, 200);
        }, 100);
    }
    
    // Aplica animaciones específicas según el tema
    applyThemeSpecificAnimation(particle, theme) {
        if (theme === 'dark') {
            if (particle.classList.contains('star')) {
                particle.style.animationDelay = -Math.random() * 3 + 's';
            } else if (particle.classList.contains('twinkle-star')) {
                particle.style.animationDelay = -Math.random() * 4 + 's';
            }
        } else {
            if (particle.classList.contains('sunbeam')) {
                particle.style.animationDelay = -Math.random() * 6 + 's';
                particle.style.animationDuration = (5 + Math.random() * 3) + 's';
            } else if (particle.classList.contains('light-sparkle')) {
                particle.style.animationDelay = -Math.random() * 4 + 's';
                particle.style.animationDuration = (3 + Math.random() * 2) + 's';
            }
        }
    }
    
    // Crea partículas adicionales y completar el efecto
    createAdditionalParticles(theme) {
        const currentCount = this.particles.length;
        const targetCount = theme === 'dark' ? 25 : 23;
        const needsMore = targetCount - currentCount;
        
        if (needsMore > 0) {
            for (let i = 0; i < needsMore; i++) {
                setTimeout(() => {
                    const particle = this.createNewParticleForTheme(theme);
                    this.animateParticleEntrance(particle);
                }, i * 200 + Math.random() * 300);
            }
        }
    }
    
    // función separada pa crear partículas nuevas
    createNewParticleForTheme(theme) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        if (theme === 'dark') {
            if (Math.random() > 0.7) {
                particle.className += ' meteor';
                particle.innerHTML = '🌒';
                particle.style.animationDelay = -Math.random() * 8 + 's';
                particle.style.animationDuration = (3 + Math.random() * 2) + 's';
            } else {
                particle.className += ' star';
                particle.innerHTML = '✦';
                particle.style.animationDelay = -Math.random() * 3 + 's';
            }
        } else {
            if (Math.random() > 0.6) {
                particle.className += ' cloud';
                particle.innerHTML = '☁️';
                particle.style.top = (Math.random() * 30 + 10) + '%';
                particle.style.animationDelay = -Math.random() * 10 + 's';
                particle.style.animationDuration = (8 + Math.random() * 4) + 's';
            } else {
                particle.className += ' light-sparkle';
                particle.innerHTML = '✨';
                particle.style.animationDelay = -Math.random() * 4 + 's';
                particle.style.animationDuration = (3 + Math.random() * 2) + 's';
            }
        }
        
        // Posicionamiento
        particle.style.left = Math.random() * 100 + '%';
        if (!particle.classList.contains('cloud')) {
            particle.style.top = Math.random() * 100 + '%';
        }
        
        return particle;
    }
    
    // función separada pa' animar entrada
    animateParticleEntrance(particle) {
        // Estado inicial
        particle.style.opacity = '0';
        particle.style.transform = 'scale(0)';
        particle.style.filter = 'blur(3px)';
        
        this.particlesContainer.appendChild(particle);
        this.particles.push(particle);
        
        // Anima entrada
        setTimeout(() => {
            particle.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            particle.style.opacity = '1';
            particle.style.transform = 'scale(1)';
            particle.style.filter = 'blur(0px)';
        }, 50);
    }
    
    // Limpia todas las partículas
    clearParticles() {
        this.particles.forEach(particle => {
            if (particle && particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        this.particles = [];
    }
    
    // función pa' pausar/reanudar animaciones
    pauseAnimations() {
        this.particles.forEach(particle => {
            particle.style.animationPlayState = 'paused';
        });
    }
    
    resumeAnimations() {
        this.particles.forEach(particle => {
            particle.style.animationPlayState = 'running';
        });
    }
}

// ================================
// FUNCIONALIDADES DEL CARRUSEL (INDEX)
// ================================
class CarouselManager {
    constructor() {
        this.currentSlide = 0;
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.selectBtn = document.getElementById('selectBtn');
        this.autoSlideInterval = null;
        this.init();
    }

    init() {
        this.updateCarouselElements();
        this.setupEventListeners();
        this.generateIndicators();
        this.startAutoSlide();
    }

    updateCarouselElements() {
        this.cards = document.querySelectorAll('.edl-content:not(.hidden) .card');
        this.track = document.getElementById('carouselTrack');
        this.indicatorsContainer = document.getElementById('indicators');
        this.currentSlide = 0;
    }

    generateIndicators() {
        this.indicatorsContainer.innerHTML = '';
        this.cards.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.addEventListener('click', () => this.goToSlide(index));
            this.indicatorsContainer.appendChild(indicator);
        });
    }

    setupEventListeners() {
        this.nextBtn?.removeEventListener('click', this.nextSlide);
        this.prevBtn?.removeEventListener('click', this.prevSlide);
        
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        this.prevBtn?.addEventListener('click', () => this.prevSlide());
        this.selectBtn?.addEventListener('click', () => this.selectCurrentStructure());

        if (this.track) {
            this.track.addEventListener('mouseenter', () => this.stopAutoSlide());
            this.track.addEventListener('mouseleave', () => this.startAutoSlide());
        }
    }

    updateCarousel() {
        const activeContent = document.querySelector('.edl-content:not(.hidden)');
        const cardWidth = 100 / this.cards.length;
        
        this.cards.forEach((card, index) => {
            card.classList.toggle('active', index === this.currentSlide);
            card.style.minWidth = `${cardWidth}%`;
        });

        this.indicatorsContainer.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });

        if (activeContent) {
            activeContent.style.transform = `translateX(-${this.currentSlide * 100}%)`;
        }
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.cards.length;
        this.updateCarousel();
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.cards.length) % this.cards.length;
        this.updateCarousel();
    }

    goToSlide(index) {
        this.currentSlide = index;
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
     window.carousel = new CarouselManager();
    new ListOptimizer(); 
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


// ================================


  // Funcionalidad específica para el selector de EDL
        document.addEventListener('DOMContentLoaded', function() {
            const edlSelector = document.getElementById('edlType');
            const headerDescription = document.getElementById('headerDescription');
            const infoPanelTitle = document.getElementById('infoPanelTitle');
            const infoPanelContent = document.getElementById('infoPanelContent');
            
            // Configuraciones para cada tipo de EDL
            const edlConfigs = {
                listas: {
                    description: "Selecciona una lista enlazada para comenzar",
                    infoTitle: "Acerca de las Listas Enlazadas",
                    infoContent: `
                        <p>Las listas enlazadas son estructuras de datos lineales donde los elementos se conectan mediante punteros.</p>
                        <ul style="text-align: left; margin-top: 1rem;">
                            <li><strong>Lista Simple:</strong> Ideal para inserción frecuente al final</li>
                            <li><strong>Lista Doble:</strong> Mejor para navegación bidireccional</li>
                            <li><strong>Lista Circular:</strong> Perfecta para algoritmos de Round Robin</li>
                        </ul>
                    `
                },
                pilas: {
                    description: "Selecciona una implementación de pila para comenzar",
                    infoTitle: "Acerca de las Pilas",
                    infoContent: `
                        <p>Las pilas son estructuras de datos LIFO (Last In, First Out) donde el último elemento añadido es el primero en salir.</p>
                        <ul style="text-align: left; margin-top: 1rem;">
                            <li><strong>Pila con Lista:</strong> Implementación dinámica usando lista enlazada</li>
                            <li><strong>Pila con Arreglo:</strong> Implementación estática usando arreglo (próximamente)</li>
                        </ul>
                    `
                },
                colas: {
                    description: "Selecciona una implementación de cola para comenzar",
                    infoTitle: "Acerca de las Colas",
                    infoContent: `
                        <p>Las colas son estructuras de datos FIFO (First In, First Out) donde el primer elemento añadido es el primero en salir.</p>
                        <ul style="text-align: left; margin-top: 1rem;">
                            <li><strong>Cola Simple:</strong> Implementación básica FIFO (próximamente)</li>
                            <li><strong>Cola Circular:</strong> Optimiza el uso de memoria (próximamente)</li>
                            <li><strong>Cola de Prioridad:</strong> Elementos ordenados por prioridad (próximamente)</li>
                        </ul>
                    `
                }
            };
            
            // Función para cambiar el tipo de EDL
            function changeEDLType(type) {
    document.querySelectorAll('.edl-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    const selectedContent = document.getElementById(type + '-content');
    if (selectedContent) {
        selectedContent.classList.remove('hidden');
    }
    
    // Actualizar carrusel
    if (window.carousel) {
        window.carousel.updateCarouselElements();
        window.carousel.generateIndicators();
        window.carousel.updateCarousel();
    }
    
    // Actualizar contenido informativo
    const config = edlConfigs[type];
    if (config) {
        headerDescription.textContent = config.description;
        infoPanelTitle.textContent = config.infoTitle;
        infoPanelContent.innerHTML = config.infoContent;
    }
}
            
            // Event listener para el selector
            edlSelector.addEventListener('change', function() {
                changeEDLType(this.value);
            });
            
            // Inicializar con listas por defecto
            changeEDLType('listas');
        });

        const visualItems = document.querySelectorAll('.edl-visual-item');
const realSelect = document.getElementById('edlType');

visualItems.forEach(item => {
  item.addEventListener('click', () => {
    const value = item.getAttribute('data-value');

    // Setear el valor del select oculto
    realSelect.value = value;

    // Disparar manualmente el evento "change" para activar el carrusel
    const event = new Event('change', { bubbles: true });
    realSelect.dispatchEvent(event);

    // Marcar visualmente el ítem activo
    visualItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});
