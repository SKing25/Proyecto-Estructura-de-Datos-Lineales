// ================================
// MÓDULO: ThemeManager
// ================================
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.body = document.body;
        this.init();
    }
    
    init() {
        if (!this.themeToggle) return;
        
        const savedTheme = this.getSavedTheme() || 'light';
        this.applyTheme(savedTheme);
        
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }
    
    getSavedTheme() {
        try {
            return localStorage.getItem('theme') || this.getCookieTheme() || window.currentTheme || 'light';
        } catch (e) {
            return this.getCookieTheme() || window.currentTheme || 'light';
        }
    }
    
    saveTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.warn('localStorage no disponible, usando cookies');
            this.setCookieTheme(theme);
        }
        window.currentTheme = theme;
    }
    
    getCookieTheme() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'theme') return value;
        }
        return null;
    }
    
    setCookieTheme(theme) {
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

// ================================
// MÓDULO: ListOptimizer
// ================================
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
        this.setupIntersectionObserver();
    }
    
    optimizeTableRendering() {
        const table = document.querySelector('table');
        if (!table) return;
        
        const tbody = table.querySelector('tbody');
        const rows = tbody?.querySelectorAll('tr');
        if (!rows || rows.length < 10) return;
        
        this.performanceMetrics.startTime = performance.now();
        table.style.visibility = 'hidden';
        table.style.opacity = '0';
        
        this.renderRowsInBatches(rows, table);
    }
    
    renderRowsInBatches(rows, table) {
        const batchSize = Math.min(20, Math.ceil(rows.length / 10));
        let currentIndex = 0;
        
        const renderBatch = () => {
            const endIndex = Math.min(currentIndex + batchSize, rows.length);
            
            for (let i = currentIndex; i < endIndex; i++) {
                const row = rows[i];
                row.style.opacity = '0';
                row.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    row.style.transition = 'all 0.3s ease';
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                }, (i - currentIndex) * 25);
            }
            
            currentIndex = endIndex;
            
            if (currentIndex < rows.length) {
                requestAnimationFrame(renderBatch);
            } else {
                this.finishTableRender(table);
            }
        };
        
        requestAnimationFrame(renderBatch);
    }
    
    finishTableRender(table) {
        setTimeout(() => {
            table.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
            table.style.visibility = 'visible';
            table.style.opacity = '1';
            this.performanceMetrics.renderTime = performance.now() - this.performanceMetrics.startTime;
            console.log(`Tabla renderizada en ${this.performanceMetrics.renderTime.toFixed(2)}ms`);
        }, 100);
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.1, rootMargin: '50px' });
        
        document.querySelectorAll('.operation-card, .card').forEach(el => {
            observer.observe(el);
        });
    }
    
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
    
    showFormLoading(submitBtn, form) {
        const originalText = submitBtn.value || submitBtn.textContent;
        submitBtn.disabled = true;
        
        submitBtn.tagName === 'INPUT' 
            ? submitBtn.value = 'Procesando...' 
            : submitBtn.textContent = 'Procesando...';
        
        const spinner = this.createLoadingSpinner();
        form.appendChild(spinner);
        
        setTimeout(() => {
            if (submitBtn.disabled) {
                submitBtn.disabled = false;
                submitBtn.tagName === 'INPUT' 
                    ? submitBtn.value = originalText 
                    : submitBtn.textContent = originalText;
                spinner.remove();
            }
        }, 10000);
    }
    
    createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-circle"></div>
            <span>Procesando datos...</span>
        `;
        return spinner;
    }

// En la clase ListOptimizer, agrega:
optimizeTableRendering() {
    const table = document.querySelector('table');
    if (!table) return;
    
    // Solo optimiza si hay más de 100 filas
    if (table.rows.length > 100) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'performance-warning';
        infoDiv.innerHTML = `
            <i class="fas fa-info-circle"></i>
            Tabla demasiado grande (${table.rows.length} filas). 
            Mostrando solo vista resumida.
        `;
        table.parentNode.insertBefore(infoDiv, table);
        
        // Ocultar tabla completa
        table.style.display = 'none';
        
        // Crear tabla resumida
        this.createSummaryView(table);
    }
}

createSummaryView(fullTable) {
    const summaryContainer = document.createElement('div');
    summaryContainer.className = 'table-summary';
    
    // Cabecera
    const headerRow = fullTable.rows[0];
    let headerHTML = '<tr>';
    for (let i = 0; i < headerRow.cells.length; i++) {
        headerHTML += `<th>${headerRow.cells[i].textContent}</th>`;
    }
    headerHTML += '</tr>';
    
    // Primeros elementos
    let bodyHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (fullTable.rows[i]) {
            bodyHTML += '<tr>';
            for (let j = 0; j < fullTable.rows[i].cells.length; j++) {
                bodyHTML += `<td>${fullTable.rows[i].cells[j].textContent}</td>`;
            }
            bodyHTML += '</tr>';
        }
    }
    
    // Separador
    bodyHTML += `<tr><td colspan="${headerRow.cells.length}" style="text-align: center">⋮</td></tr>`;
    
    // Últimos elementos
    for (let i = Math.max(fullTable.rows.length - 5, 6); i < fullTable.rows.length; i++) {
        bodyHTML += '<tr>';
        for (let j = 0; j < fullTable.rows[i].cells.length; j++) {
            bodyHTML += `<td>${fullTable.rows[i].cells[j].textContent}</td>`;
        }
        bodyHTML += '</tr>';
    }
    
    // Tabla resumida
    const summaryTable = document.createElement('table');
    summaryTable.className = 'summary-view';
    summaryTable.innerHTML = `<thead>${headerHTML}</thead><tbody>${bodyHTML}</tbody>`;
    
    summaryContainer.appendChild(summaryTable);
    fullTable.parentNode.appendChild(summaryContainer);
}
}

// ================================
// MÓDULO: ParticleManager
// ================================
class ParticleManager {
    constructor() {
        this.particlesContainer = document.querySelector('.background-particles');
        this.particles = [];
        this.currentTheme = 'light';
        this.init();
    }
    
    init() {
        if (!this.particlesContainer) return;
        this.currentTheme = document.body.getAttribute('data-theme') || 'light';
        this.createThemedParticles();
        this.observeThemeChanges();
    }
    
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
        
        observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    }
    
    createThemedParticles() {
        this.clearParticles();
        this.currentTheme === 'dark' 
            ? this.createStarsAndMeteors() 
            : this.createSunbeamsAndClouds();
    }
    
    createStarsAndMeteors() {
        // Creación de estrellas y meteoros
        for (let i = 0; i < 15; i++) this.createParticle('star', '✦', true);
        for (let i = 0; i < 4; i++) this.createParticle('meteor', '🌒', false, true);
        for (let i = 0; i < 6; i++) this.createParticle('twinkle-star', '⭐', true);
    }
    
    createSunbeamsAndClouds() {
        // Creación de rayos de sol y nubes
        for (let i = 0; i < 8; i++) this.createParticle('sunbeam', '☀️', false, false, true);
        for (let i = 0; i < 5; i++) this.createParticle('cloud', '☁️', false, false, false, true);
        for (let i = 0; i < 10; i++) this.createParticle('light-sparkle', '✨', true);
    }
    
    createParticle(className, content, isStatic = false, isMeteor = false, isSunbeam = false, isCloud = false) {
        const particle = document.createElement('div');
        particle.className = `particle ${className}`;
        particle.innerHTML = content;
        
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = isCloud ? (Math.random() * 30 + 10) + '%' : Math.random() * 100 + '%';
        
        if (isMeteor) {
            particle.style.left = (Math.random() * 120 - 20) + '%';
            particle.style.animationDelay = -Math.random() * 8 + 's';
            particle.style.animationDuration = (3 + Math.random() * 2) + 's';
            particle.style.transform = `rotate(${Math.random() * 360}deg)`;
        }
        
        if (isSunbeam) {
            particle.style.animationDelay = -Math.random() * 6 + 's';
            particle.style.animationDuration = (5 + Math.random() * 3) + 's';
        }
        
        if (isStatic) {
            particle.style.animationDelay = -Math.random() * (className === 'star' ? 3 : 4) + 's';
        }
        
        this.particlesContainer.appendChild(particle);
        this.particles.push(particle);
    }
    
    updateParticlesForTheme() {
        const morphableParticles = [];
        const fadingParticles = [];
        
        this.particles.forEach((particle, index) => {
            index < Math.min(this.particles.length * 0.6, 8)
                ? morphableParticles.push(particle)
                : fadingParticles.push(particle);
        });
        
        morphableParticles.forEach((particle, index) => {
            setTimeout(() => this.morphParticle(particle, this.currentTheme), index * 150);
        });
        
        fadingParticles.forEach((particle, index) => {
            setTimeout(() => {
                particle.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                particle.style.opacity = '0';
                particle.style.transform = 'scale(0) rotate(180deg)';
                particle.style.filter = 'blur(5px)';
            }, index * 100);
        });
        
        setTimeout(() => {
            this.cleanupAndCreateNew(fadingParticles, morphableParticles);
        }, 1200);
    }
    
    cleanupAndCreateNew(fadingParticles, morphableParticles) {
        fadingParticles.forEach(particle => particle.remove());
        this.particles = morphableParticles;
        this.createAdditionalParticles();
    }
    
    morphParticle(particle, newTheme) {
        const newContent = this.getNewParticleContent(newTheme);
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
        
        morphOverlay.innerHTML = newContent.content;
        morphOverlay.className = `particle ${newContent.className}`;
        particle.appendChild(morphOverlay);
        
        this.executeParticleTransformation(particle, morphOverlay, newTheme);
    }
    
    getNewParticleContent(newTheme) {
        return newTheme === 'dark'
            ? Math.random() > 0.5 
                ? { content: '✦', className: 'star' } 
                : { content: '⭐', className: 'twinkle-star' }
            : Math.random() > 0.5
                ? { content: '☀️', className: 'sunbeam' } 
                : { content: '✨', className: 'light-sparkle' };
    }
    
    executeParticleTransformation(particle, morphOverlay, newTheme) {
        setTimeout(() => {
            particle.style.transition = 'all 0.6s ease-out';
            particle.style.filter = 'blur(3px) brightness(0.3)';
            
            setTimeout(() => {
                morphOverlay.style.opacity = '1';
                morphOverlay.style.transform = 'scale(1.2)';
                
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
    
    createAdditionalParticles() {
        const currentCount = this.particles.length;
        const targetCount = this.currentTheme === 'dark' ? 25 : 23;
        const needsMore = targetCount - currentCount;
        
        if (needsMore > 0) {
            for (let i = 0; i < needsMore; i++) {
                setTimeout(() => {
                    const particle = this.createNewParticleForTheme();
                    this.animateParticleEntrance(particle);
                }, i * 200 + Math.random() * 300);
            }
        }
    }
    
    createNewParticleForTheme() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        if (this.currentTheme === 'dark') {
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
                particle.style.top = (Math.random() * 40 + 10) + '%';
                particle.style.animationDelay = -Math.random() * 10 + 's';
                particle.style.animationDuration = (8 + Math.random() * 4) + 's';
            } else {
                particle.className += ' light-sparkle';
                particle.innerHTML = '✨';
                particle.style.animationDelay = -Math.random() * 4 + 's';
                particle.style.animationDuration = (3 + Math.random() * 2) + 's';
            }
        }
        
        particle.style.left = Math.random() * 100 + '%';
        if (!particle.classList.contains('cloud')) {
            particle.style.top = Math.random() * 100 + '%';
        }
        
        return particle;
    }
    
    animateParticleEntrance(particle) {
        particle.style.opacity = '0';
        particle.style.transform = 'scale(0)';
        particle.style.filter = 'blur(3px)';
        
        this.particlesContainer.appendChild(particle);
        this.particles.push(particle);
        
        setTimeout(() => {
            particle.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            particle.style.opacity = '1';
            particle.style.transform = 'scale(1)';
            particle.style.filter = 'blur(0px)';
        }, 50);
    }
    
    clearParticles() {
        this.particles.forEach(particle => particle.remove());
        this.particles = [];
    }
}

// ================================
// MÓDULO: CarouselManager
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

        if (activeContent) activeContent.style.transform = `translateX(-${this.currentSlide * 100}%)`;
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
        this.stopAutoSlide();
        this.autoSlideInterval = setInterval(() => this.nextSlide(), 5000);
    }
    
    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
}

// ================================
// MÓDULO: ListVisualEffects
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
            case 'simple': this.setupSimpleListEffects(rows); break;
            case 'doble': this.setupDoubleListEffects(rows); break;
            case 'circular': this.setupCircularListEffects(rows); break;
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
        const shouldAnimate = rows.length < 100;
        
        rows.forEach((row, index) => {
            if (index < rows.length - 1) {
                row.style.borderRight = '3px solid #667eea';
                row.title = 'Este elemento apunta al siguiente';
            } else {
                row.style.borderRight = '3px solid #f093fb';
                row.title = 'Último elemento (apunta a NULL)';
            }
            
            if (shouldAnimate) this.animateRowEntrance(row, index);
        });
    }
    
    setupDoubleListEffects(rows) {
        const shouldAnimate = rows.length < 100;
        
        rows.forEach((row, index) => {
            if (index > 0) row.style.borderLeft = '3px solid #764ba2';
            if (index < rows.length - 1) row.style.borderRight = '3px solid #667eea';
            row.title = 'Elemento con navegación bidireccional';
            
            if (shouldAnimate) this.animateRowEntrance(row, index, index % 2 === 0 ? -20 : 20);
        });
    }
    
    setupCircularListEffects(rows) {
        const shouldAnimate = rows.length < 100;
        
        rows.forEach((row, index) => {
            row.style.borderRadius = '8px';
            row.title = 'Parte de la estructura circular';
            
            if (index === 0) {
                row.style.borderLeft = '3px solid #f093fb';
                row.style.borderTop = '3px solid #f093fb';
            }
            if (index === rows.length - 1) {
                row.style.borderRight = '3px solid #667eea';
                row.style.borderBottom = '3px solid #667eea';
            }
            
            if (shouldAnimate) this.animateCircularEntrance(row, index);
        });
    }
    
    animateRowEntrance(row, index, translateX = -20) {
        row.style.opacity = '0';
        row.style.transform = `translateX(${translateX}px)`;
        
        setTimeout(() => {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, Math.min(index * 50, 2000));
    }
    
    animateCircularEntrance(row, index) {
        row.style.opacity = '0';
        row.style.transform = 'scale(0.8) rotate(-10deg)';
        
        setTimeout(() => {
            row.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            row.style.opacity = '1';
            row.style.transform = 'scale(1) rotate(0deg)';
        }, Math.min(index * 100, 2000));
    }
}

// ================================
// MÓDULO: Utils
// ================================
class Utils {
    static showInfo() {
        const infoPanel = document.getElementById('infoPanel');
        if (infoPanel) {
            infoPanel.style.display = infoPanel.style.display === 'block' ? 'none' : 'block';
        }
    }
    
    static addHoverEffects() {
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
        const buttons = document.querySelectorAll('input[type="submit"], button');
        buttons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                ripple.classList.add('ripple');
                
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }
}

// ================================
// MÓDULO: EDLSelector
// ================================
class EDLSelector {
    constructor() {
        this.edlSelector = document.getElementById('edlType');
        this.headerDescription = document.getElementById('headerDescription');
        this.infoPanelTitle = document.getElementById('infoPanelTitle');
        this.infoPanelContent = document.getElementById('infoPanelContent');
        this.visualItems = document.querySelectorAll('.edl-visual-item');
        
        this.edlConfigs = {
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
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.changeEDLType('listas');
    }
    
    setupEventListeners() {
        this.edlSelector.addEventListener('change', () => this.changeEDLType(this.edlSelector.value));
        
        this.visualItems.forEach(item => {
            item.addEventListener('click', () => {
                const value = item.getAttribute('data-value');
                this.edlSelector.value = value;
                this.edlSelector.dispatchEvent(new Event('change', { bubbles: true }));
                this.visualItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }
    
    changeEDLType(type) {
        document.querySelectorAll('.edl-content').forEach(content => content.classList.add('hidden'));
        
        const selectedContent = document.getElementById(`${type}-content`);
        if (selectedContent) selectedContent.classList.remove('hidden');
        
        if (window.carousel) {
            window.carousel.updateCarouselElements();
            window.carousel.generateIndicators();
            window.carousel.updateCarousel();
        }
        
        const config = this.edlConfigs[type];
        if (config) {
            this.headerDescription.textContent = config.description;
            this.infoPanelTitle.textContent = config.infoTitle;
            this.infoPanelContent.innerHTML = config.infoContent;
        }
    }
}

// ================================
// INICIALIZACIÓN PRINCIPAL
// ================================


// Actualizar el sistema de búsqueda para mantener la paginación
class SearchManager {
    constructor() {
        this.searchForms = document.querySelectorAll('form[action*="/buscar"]');
        this.init();
    }
    
    init() {
        this.searchForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSearch(form);
            });
        });
    }
    
    handleSearch(form) {
        const formData = new FormData(form);
        const searchValue = formData.get('valor');
        const currentPage = new URLSearchParams(window.location.search).get('page') || 1;
        
        // Conservar parámetros de paginación en la búsqueda
        const action = `${form.getAttribute('action')}?page=${currentPage}`;
        
        fetch(action, {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(html => {
            document.documentElement.innerHTML = html;
        })
        .catch(error => {
            console.error('Error en la búsqueda:', error);
        });
    }
}





document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todos los módulos
    new ThemeManager();
    new ParticleManager();
    window.carousel = new CarouselManager();
    new ListOptimizer(); 
    new ListVisualEffects();
    new EDLSelector();
    new SearchManager();
    
    // Aplicar utilidades
    Utils.addHoverEffects();
    Utils.enhanceButtons();
    
    // Hacer disponible la función showInfo globalmente
    window.showInfo = Utils.showInfo;
    
    // Insertar estilos globales
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to { transform: scale(4); opacity: 0; }
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
        table { will-change: opacity, visibility; }
        tbody tr { will-change: opacity, transform; }
        
        /* Reducir animaciones en listas grandes */
        @media (max-height: 800px) {
            .particle { animation-duration: 8s !important; }
        }
    `;
    document.head.appendChild(styleSheet);
});