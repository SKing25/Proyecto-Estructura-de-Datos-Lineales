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
    // Obtiene el tema guardado en localStorage o cookies, por la propia paranoia de que localStorage puede no estar disponible en algunos navegadores antiguos o en modo incógnito.
    // Si no hay tema guardado, intenta obtenerlo de las cookies o del tema actual del documento.
    // Si no hay tema guardado en ningún lado, usa 'light' como valor por defecto.
    // Además, actualiza el tema actual del documento para reflejar el tema guardado.

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
    // Esta clase se encarga de optimizar la renderización de tablas y listas enlazadas
    // para mejorar el rendimiento y la experiencia del usuario.
    // Implementa técnicas como la renderización por lotes, indicadores de carga y observadores de intersección.

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
        // Si la tabla no existe o tiene menos de 10 filas, no hace nada
        // Si la tabla tiene más de 100 filas, muestra una advertencia y renderiza una vista resumida
        // Si la tabla tiene entre 10 y 100 filas, aplica una animación de entrada por lotes

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
            // Asegura que la tabla se muestre después de renderizar todas las filas
            // y aplica una transición suave para la visibilidad y opacidad
            
            table.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
            table.style.visibility = 'visible';
            table.style.opacity = '1';
            this.performanceMetrics.renderTime = performance.now() - this.performanceMetrics.startTime;
            console.log(`Tabla renderizada en ${this.performanceMetrics.renderTime.toFixed(2)}ms`);
        }, 100);
    }
    
    setupIntersectionObserver() {
        // Configura un IntersectionObserver para detectar cuando las tarjetas de operaciones y las tarjetas de contenido entran en el viewport
        // eso significa que se van a mostrar en pantalla, y les aplica una clase para animarlas.
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
        // Deshabilita el botón de envío y muestra un indicador de carga
        // Si el botón es un input, cambia su valor a "Procesando..."
        // Si es un botón, cambia su texto a "Procesando..."
        // Después de 10 segundos, vuelve a habilitar el botón y elimina el indicador de carga, evita errores, para que no metan demasiados datos que puedan colapsar el sistema
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
        // Crea un spinner de carga personalizado para mostrar mientras se procesan los datos
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-circle"></div>
            <span>Procesando datos...</span>
        `;
        return spinner;
    }


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
    // Esta clase se encarga de gestionar las partículas de fondo
    // dependiendo del tema actual (oscuro o claro).
    // Crea partículas temáticas como estrellas, meteoros, rayos de sol y nubes.
    // También maneja la animación de partículas al cambiar de tema,
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
        // Observa cambios en el atributo data-theme del body
        // y actualiza las partículas según el nuevo tema.

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
        // Limpia las partículas existentes y crea nuevas según el tema actual.
        if (!this.particlesContainer) return;
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
        for (let i = 0; i < 12; i++) this.createParticle('sunbeam', '☀️', true);
        for (let i = 0; i < 8; i++) this.createParticle('sunbeam', '☀️', false, false, true);
        for (let i = 0; i < 5; i++) this.createParticle('cloud', '☁️', false, false, false, true);
        for (let i = 0; i < 10; i++) this.createParticle('light-sparkle', '✨', true);
    }
    // Crea una partícula con las propiedades especificadas y la añade al contenedor de partículas.
    // Permite personalizar la clase, contenido, si es estática, meteorito, rayo de sol o nube.

    createParticle(className, content, isStatic = false, isMeteor = false, isSunbeam = false, isCloud = false) {
        // si isStatic es true, la partícula no se moverá y tendrá una animación de entrada diferente.
        if (!this.particlesContainer) return;
        const particle = document.createElement('div');
        particle.className = `particle ${className}`;
        particle.innerHTML = content;
        
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = isCloud ? (Math.random() * 30 + 10) + '%' : Math.random() * 100 + '%';
        
        if (isMeteor) {
            // si es un meteorito, se posiciona en la parte superior y se anima para caer.

            particle.style.left = (Math.random() * 120 - 20) + '%';
            particle.style.animationDelay = -Math.random() * 8 + 's';
            particle.style.animationDuration = (3 + Math.random() * 2) + 's';
            particle.style.transform = `rotate(${Math.random() * 360}deg)`;
        }
        
        if (isSunbeam) {
            // si es un rayo de sol, se posiciona en la parte superior y se anima para brillar.
            particle.style.animationDelay = -Math.random() * 6 + 's';
            particle.style.animationDuration = (5 + Math.random() * 3) + 's';
        }
        
        if (isStatic) {
            // si es estática, no se anima y se posiciona en una posición fija.
            particle.style.animationDelay = -Math.random() * (className === 'star' ? 3 : 4) + 's';
        }
        
        this.particlesContainer.appendChild(particle);
        this.particles.push(particle);
    }
    
    updateParticlesForTheme() {
        // Actualiza las partículas según el tema actual.
        const morphableParticles = [];
        const fadingParticles = [];
        
        this.particles.forEach((particle, index) => {
            // Si el índice es menor al 60% del total, se considera que la partícula puede ser morfable.
            index < Math.min(this.particles.length * 0.6, 8)
                ? morphableParticles.push(particle)
                : fadingParticles.push(particle);
        });
        
        morphableParticles.forEach((particle, index) => {
            // Se aplica una animación de morfado a las partículas morfables.
            setTimeout(() => this.morphParticle(particle, this.currentTheme), index * 150);
        });
        
        fadingParticles.forEach((particle, index) => {
            setTimeout(() => {
                // Se aplica una animación de desvanecimiento a las partículas que no se morfan.

                particle.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'; // transición suave y sedosa
                particle.style.opacity = '0'; // desvanecimiento
                particle.style.transform = 'scale(0) rotate(180deg)'; // rotación para un efecto más dinámico
                particle.style.filter = 'blur(5px)'; // desenfoque para un efecto más suave
            }, index * 100);
        });
        
        setTimeout(() => {
            // Después de un tiempo, se limpian las partículas que se han desvanecido y se crean nuevas partículas.
            this.cleanupAndCreateNew(fadingParticles, morphableParticles); // limpia las partículas desvanecidas y crea nuevas
        }, 1200);
    }
    
    cleanupAndCreateNew(fadingParticles, morphableParticles) { 
        // Limpia las partículas que se han desvanecido y actualiza la lista de partículas.
        fadingParticles.forEach(particle => particle.remove()); // elimina las partículas que se han desvanecido
        this.particles = morphableParticles; // actualiza la lista de partículas morfables
        this.createAdditionalParticles(); // crea nuevas partículas según el tema actual
    }
    
    morphParticle(particle, newTheme) {
        // Morfado de partículas al cambiar de tema.
        const newContent = this.getNewParticleContent(newTheme); // obtiene el nuevo contenido de la partícula según el tema
        const morphOverlay = document.createElement('div'); // crea un overlay para la morfación
        
        Object.assign(morphOverlay.style, {
            position: 'absolute', // posición absoluta para cubrir la partícula
            top: '0', // cubre desde la parte superior
            left: '0', // cubre desde la izquierda
            width: '100%', // cubre todo el ancho de la partícula
            height: '100%', // cubre todo el alto de la partícula
            opacity: '0', // comienza invisible
            transform: 'scale(0)', // comienza en escala 0
            transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)', // transición suave y sedosa
            fontSize: particle.style.fontSize, // mantiene el tamaño de fuente original
            pointerEvents: 'none' // Evita que la animacion, o los emojis en movimiento interfieran con los eventos del mouse
        });
        
        morphOverlay.innerHTML = newContent.content; // establece el nuevo contenido de la partícula
        morphOverlay.className = `particle ${newContent.className}`; // establece la clase de la partícula morfada
        particle.appendChild(morphOverlay); // añade el overlay a la partícula original
        
        this.executeParticleTransformation(particle, morphOverlay, newTheme); // ejecuta la transformación de la partícula
    } 
    
    getNewParticleContent(newTheme) {
        return newTheme === 'dark' // Si el nuevo tema es oscuro, crea partículas de estrellas o meteoros
            ? Math.random() > 0.5  // si es mayor al 50%, crea una estrella, si no, un meteorito
                ? { content: '✦', className: 'star' } // estrella
                : { content: '⭐', className: 'twinkle-star' } 
            : Math.random() > 0.5 // si no es tema oscuro, es decir, si es claro, si es mayor al 50%, crea un rayo de sol, si no, una chispa de luz
                ? { content: '☀️', className: 'sunbeam' } 
                : { content: '✨', className: 'light-sparkle' };
    }
    
    executeParticleTransformation(particle, morphOverlay, newTheme) {
        setTimeout(() => { 
            // Ejecuta la transformación de la partícula morfada.
            particle.style.transition = 'all 0.6s ease-out';
            particle.style.filter = 'blur(3px) brightness(0.3)';
            
            setTimeout(() => {
                // Aplica la transformación al overlay morfado.
                morphOverlay.style.opacity = '1';
                morphOverlay.style.transform = 'scale(1.2)';
                
                setTimeout(() => {
                    // Después de un tiempo, actualiza el contenido y la clase de la partícula original.
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
            // Aplica animaciones específicas para el tema oscuro.
            if (particle.classList.contains('star')) {
                // Si es una estrella, aplica una animación de parpadeo.
                particle.style.animationDelay = -Math.random() * 3 + 's';
            } else if (particle.classList.contains('twinkle-star')) {
                // Si es una estrella parpadeante, aplica una animación de parpadeo más rápida.
                particle.style.animationDelay = -Math.random() * 4 + 's';
            }
        } else {
            // Aplica animaciones específicas para el tema claro.
            if (particle.classList.contains('sunbeam')) {
                // Si es un rayo de sol, aplica una animación de brillo.
                particle.style.animationDelay = -Math.random() * 6 + 's';
                particle.style.animationDuration = (5 + Math.random() * 3) + 's';
            } else if (particle.classList.contains('light-sparkle')) {
                // Si es una chispa de luz, aplica una animación de brillo más rápida.
                particle.style.animationDelay = -Math.random() * 4 + 's';
                particle.style.animationDuration = (3 + Math.random() * 2) + 's';
            }
        }
    }
    
    createAdditionalParticles() {
        // Crea nuevas partículas según el tema actual.
        const currentCount = this.particles.length;
        const targetCount = this.currentTheme === 'dark' ? 25 : 23;
        const needsMore = targetCount - currentCount;
        // si needsMore es mayor a 0, crea nuevas partículas con un pequeño retraso para que no aparezcan todas al mismo tiempo.
        // needsMore es la diferencia entre el número de partículas actuales y el número de partículas objetivo.
        // cual es el número de partículas objetivo? 25 para el tema oscuro y 23 para el tema claro.
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
        // Crea una nueva partícula según el tema actual.

        const particle = document.createElement('div');
        particle.className = 'particle';
        
        if (this.currentTheme === 'dark') {
            // Si el tema es oscuro, crea estrellas o meteoros.
            if (Math.random() > 0.7) {
                // Si es mayor al 70%, crea un meteorito, si no, una estrella.
                // El meteorito tiene una animación de caída y rotación. pero por temas de emoji se convirtio en una Luna y no le cambiare el nombre.
                particle.className += ' meteor';
                particle.innerHTML = '🌒';
                particle.style.animationDelay = -Math.random() * 8 + 's';
                particle.style.animationDuration = (3 + Math.random() * 2) + 's';
            } else {
                // Si no, crea una estrella o una estrella parpadeante.
                particle.className += ' star';
                particle.innerHTML = '✦';
                particle.style.animationDelay = -Math.random() * 3 + 's';
            }
        } else {
            // Si el tema es claro, crea rayos de sol o nubes.
            if (Math.random() > 0.6) {
                // Si es mayor al 60%, crea un rayo de sol, si no, una nube.
                particle.className += ' cloud';
                particle.innerHTML = '☁️';
                particle.style.top = (Math.random() * 40 + 10) + '%';
                particle.style.animationDelay = -Math.random() * 10 + 's';
                particle.style.animationDuration = (8 + Math.random() * 4) + 's';
            } else {
                // Si no, crea un rayo de sol o una chispa de luz.
                particle.className += ' light-sparkle';
                particle.innerHTML = '✨';
                particle.style.animationDelay = -Math.random() * 4 + 's';
                particle.style.animationDuration = (3 + Math.random() * 2) + 's';
            }
        }
        // Posiciona la partícula en una posición aleatoria dentro del contenedor de partículas.
        particle.style.left = Math.random() * 100 + '%';
        // Si la partícula no es una nube, la posiciona en una altura aleatoria.
        if (!particle.classList.contains('cloud')) {
            // Si no es una nube, la posiciona en una altura aleatoria.
            particle.style.top = Math.random() * 100 + '%';
        }
        
        return particle;
    }
    
    animateParticleEntrance(particle) {
        // Anima la entrada de la partícula al contenedor de partículas.
        particle.style.opacity = '0'; // comienza con opacidad 0
        particle.style.transform = 'scale(0)'; // comienza en escala 0
        particle.style.filter = 'blur(3px)'; // comienza con desenfoque
        
        this.particlesContainer.appendChild(particle); // añade la partícula al contenedor de partículas
        this.particles.push(particle); // añade la partícula a la lista de partículas
        
        setTimeout(() => { // Después de un pequeño retraso, aplica la animación de entrada.
            particle.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'; // transición suave y sedosa
            particle.style.opacity = '1'; // opacidad 1, que con el anterior blur y scale, se ve como si entrara
            particle.style.transform = 'scale(1)'; // escala 1, que con el anterior blur y scale, se ve como si se agrandara, como si viniera desde el eje z
            particle.style.filter = 'blur(0px)'; // como ya no esta lejos, pues ya no tiene desenfoque
        }, 50);
    }
    
    clearParticles() {
        // Limpia todas las partículas del contenedor de partículas.
        this.particles.forEach(particle => particle.remove());
        // Elimina todas las partículas del contenedor de partículas.
        this.particles = [];
    }
}

// ================================
// MÓDULO: CarouselManager
// ================================
class CarouselManager {
    // Esta clase se encarga de gestionar el carrusel de tarjetas de contenido.
    // Permite navegar entre tarjetas, seleccionar estructuras y manejar la auto-reproducción del carrusel.
    // Se usa para no crear 3 index en html diferentes solo para cada tipo de EDL, así usando solo una y cambiando el contenido de las tarjetas, se puede reutilizar el mismo código para todos los tipos de EDL.

    constructor() {

        this.currentSlide = 0;
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.selectBtn = document.getElementById('selectBtn');
        this.autoSlideInterval = null;
        this.init();
    }

    init() {
        // Inicializa el carrusel, actualiza los elementos del carrusel, configura los event listeners y genera los indicadores.
        this.updateCarouselElements();
        this.setupEventListeners();
        this.generateIndicators();
        this.startAutoSlide();
    }

    updateCarouselElements() {
        // Actualiza los elementos del carrusel, obteniendo las tarjetas de contenido y el track del carrusel.
        this.cards = document.querySelectorAll('.edl-content:not(.hidden) .card');
        this.track = document.getElementById('carouselTrack');
        this.indicatorsContainer = document.getElementById('indicators');
        this.currentSlide = 0; // Reinicia el índice de la diapositiva actual a 0 al actualizar los elementos del carrusel.
    }

    generateIndicators() { // Genera los indicadores del carrusel basados en el número de tarjetas.
        this.indicatorsContainer.innerHTML = ''; // Limpia los indicadores existentes.
        this.cards.forEach((_, index) => { // Itera sobre las tarjetas y crea un indicador para cada una.
            const indicator = document.createElement('div'); // Crea un nuevo elemento div para el indicador.
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`; // Marca el primer indicador como activo.
            indicator.addEventListener('click', () => this.goToSlide(index)); // Añade un event listener para que al hacer clic en el indicador, vaya a la diapositiva correspondiente.
            this.indicatorsContainer.appendChild(indicator); // Añade el indicador al contenedor de indicadores.
        });
    }

    setupEventListeners() {
        // Configura los event listeners para los botones de navegación y el botón de selección.
        this.nextBtn?.addEventListener('click', () => this.nextSlide()); // Añade un event listener al botón de siguiente para avanzar a la siguiente diapositiva.
        this.prevBtn?.addEventListener('click', () => this.prevSlide()); // Añade un event listener al botón de anterior para retroceder a la diapositiva anterior.
        // Añade un event listener al botón de selección para seleccionar la estructura actual.
        this.selectBtn?.addEventListener('click', () => this.selectCurrentStructure());

        if (this.track) {
            // Añade event listeners al track del carrusel para detener y reanudar la auto-reproducción al pasar el mouse.
            // Esto permite que el carrusel se detenga cuando el usuario interactúa con él, mejorando la experiencia de usuario.
            // Y si efectivamente esto me molesto cuando no lo tenia, ya que el carrusel seguía avanzando mientras leía el contenido de las tarjetas, y no me dejaba leer tranquilo, ISH.

            this.track.addEventListener('mouseenter', () => this.stopAutoSlide());
            this.track.addEventListener('mouseleave', () => this.startAutoSlide());
        }
    }

    updateCarousel() { // Actualiza el carrusel, mostrando la tarjeta activa y actualizando los indicadores.
        const activeContent = document.querySelector('.edl-content:not(.hidden)'); // Obtiene el contenido activo del carrusel, que es el contenedor de las tarjetas de contenido.
        if (!activeContent) return; // Si no hay contenido activo, no hace nada.
        const cardWidth = 100 / this.cards.length; // Calcula el ancho de cada tarjeta como un porcentaje del total, para que todas las tarjetas se ajusten en una sola fila.
        
        this.cards.forEach((card, index) => { // Itera sobre las tarjetas y actualiza su estado.
            card.classList.toggle('active', index === this.currentSlide); // Marca la tarjeta actual como activa.
            card.style.minWidth = `${cardWidth}%`; // Establece el ancho mínimo de la tarjeta como un porcentaje del total, para que todas las tarjetas se ajusten en una sola fila.
        });

        this.indicatorsContainer.querySelectorAll('.indicator').forEach((indicator, index) => {
            // Actualiza los indicadores del carrusel, marcando el indicador correspondiente a la tarjeta actual como activo.
            indicator.classList.toggle('active', index === this.currentSlide);
        });

        if (activeContent) activeContent.style.transform = `translateX(-${this.currentSlide * 100}%)`;
        // Desplaza el contenido activo del carrusel para mostrar la tarjeta actual.
        // Esto se hace para que la tarjeta actual quede centrada en el carrusel, y las demás tarjetas queden a la izquierda o derecha de la tarjeta actual.
        // Un error que tuve al principio fue que no hacia esto, y las tarjetas se mostraban las 3 juntas, y no se podía ver bien el contenido de cada tarjeta, ya que todas estaban a la vista al mismo tiempo.

    }

    nextSlide() {
        // Avanza a la siguiente tarjeta del carrusel, actualizando el índice de la tarjeta actual y llamando a updateCarousel para reflejar el cambio.
        if (this.cards.length === 0) return; // Si no hay tarjetas, no hace nada.
        this.currentSlide = (this.currentSlide + 1) % this.cards.length; // Incrementa el índice de la tarjeta actual, y lo reinicia a 0 si llega al final de la lista de tarjetas.
        this.updateCarousel(); // Llama a updateCarousel para reflejar el cambio en el carrusel.
    }

    prevSlide() {
        // Retrocede a la tarjeta anterior del carrusel, actualizando el índice de la tarjeta actual y llamando a updateCarousel para reflejar el cambio.
        this.currentSlide = (this.currentSlide - 1 + this.cards.length) % this.cards.length; // Decrementa el índice de la tarjeta actual, y lo reinicia al final de la lista si es menor que 0.
        this.updateCarousel();
    }

    goToSlide(index) { // Permite ir a una tarjeta específica del carrusel, actualizando el índice de la tarjeta actual y llamando a updateCarousel para reflejar el cambio.
        // Esto con los botoncitos de los indicadores del carrusel, que permiten ir a una tarjeta específica del carrusel.
       // if (index < 0 || index >= this.cards.length) return; Si el índice está fuera de rango, no hace nada. esto es comentario porque dado que son botones contados, no puede ser que el usuario meta un número que no sea válido, ya que los botones están creados según la cantidad de tarjetas que hay.
       // no es algo automatico, sino que es algo manual, ya que los botones están creados según la cantidad de tarjetas que hay.
        this.currentSlide = index;
        this.updateCarousel();
    }
    
    selectCurrentStructure() {
        // Selecciona la estructura actual del carrusel, redirigiendo al usuario a la URL de la tarjeta activa.
        const activeCard = this.cards[this.currentSlide]; // Obtiene la tarjeta activa del carrusel, que es la tarjeta que está actualmente visible en el carrusel.
        const url = activeCard?.dataset.url; // Obtiene la URL de la tarjeta activa, que es un atributo data-url de la tarjeta.
        
        if (url && !activeCard.classList.contains('coming-soon')) {
            window.location.href = url; // Redirige al usuario a la URL de la tarjeta activa, si existe y no es una tarjeta de "próximamente" (Próximamente probablemente dejara de existir en la version final del código así que, almenos quedara como recuerdo que existio).

        }
    }
    
    startAutoSlide() { // Inicia la auto-reproducción del carrusel, avanzando automáticamente a la siguiente tarjeta cada 5 segundos.
        this.stopAutoSlide(); // Detiene cualquier auto-reproducción existente antes de iniciar una nueva.
        this.autoSlideInterval = setInterval(() => this.nextSlide(), 5000); // Avanza automáticamente a la siguiente tarjeta cada 5 segundos.
    }
    
    stopAutoSlide() { // Detiene la auto-reproducción del carrusel, si está en curso, lo que permite al usuario interactuar con el carrusel sin que avance automáticamente.
        // Esto es útil para que el usuario pueda leer el contenido de las tarjetas sin que el carrusel avance automáticamente. 
        // Si esto no estuviera, el carrusel seguiría avanzando automáticamente siempre, es decir, que no se detendría nunca, y eso no es lo que queremos, ya que el usuario podría estar leyendo el contenido de las tarjetas y no podría hacerlo si el carrusel sigue avanzando automáticamente.
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
    // Esta clase se encarga de aplicar efectos visuales a las listas de estructuras de datos.
    // Dependiendo del tipo de lista (simple, doble o circular), aplica diferentes estilos y animaciones a las filas de la tabla.
    constructor() {
        this.init();
    }
    
    init() {
        // Inicializa los efectos visuales de la lista, configurando los efectos según el tipo de lista actual.
        this.setupListEffects();
    }
    
    setupListEffects() {
        // Configura los efectos visuales de la lista según el tipo de lista actual.
        // Obtiene la tabla de la lista y las filas de la tabla.
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
        // Determina el tipo de lista actual según la URL de la página.
        // Esto se hace para saber qué tipo de lista se está visualizando actualmente, ya que cada tipo de lista tiene efectos visuales diferentes.
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
        // Configura los efectos visuales para una lista circular, donde el primer y último elemento están conectados.
        // Esto es útil para representar estructuras de datos circulares, como las listas circulares.
        // En este caso, se aplica un borde especial al primer y último elemento, y se anima la entrada de las filas.
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
        // Anima la entrada de las filas de la tabla, aplicando una transición suave y un efecto de deslizamiento.
        row.style.opacity = '0'; // comienza con opacidad 0
        row.style.transform = `translateX(${translateX}px)`; // comienza con una traslación en el eje X
         
        setTimeout(() => { // Después de un pequeño retraso, aplica la animación de entrada.
            // Aplica la transición y la transformación para que la fila entre de forma suave y sedosa.
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, Math.min(index * 50, 2000)); // El tiempo máximo de animación es de 2 segundos, para evitar que la animación sea demasiado larga.
    }
    
    animateCircularEntrance(row, index) {
        // Anima la entrada de las filas de la tabla en una lista circular, aplicando una transición suave y un efecto de rotación.
        row.style.opacity = '0';
        row.style.transform = 'scale(0.8) rotate(-10deg)';
        
        setTimeout(() => { // Después de un pequeño retraso, aplica la animación de entrada.
            // Aplica la transición y la transformación para que la fila entre de forma suave y sedosa.
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
    // Esta clase contiene métodos utilitarios para manejar eventos y efectos visuales en la aplicación.

    static showInfo() {
        // Muestra u oculta el panel de información, que contiene detalles sobre la estructura de datos seleccionada.
        // Esto es útil para mostrar información adicional al usuario sobre la estructura de datos seleccionada, como su descripción, operaciones disponibles, etc.
        const infoPanel = document.getElementById('infoPanel');
        if (infoPanel) {
            // Si el panel de información existe, alterna su visibilidad.
            // Esto permite al usuario ver más información sobre la estructura de datos seleccionada, como su descripción, operaciones disponibles, etc.
            infoPanel.style.display = infoPanel.style.display === 'block' ? 'none' : 'block';
        }
    }
    
    static addHoverEffects() {
        // Añade efectos de hover a las tarjetas de operaciones, para mejorar la experiencia del usuario al interactuar con las tarjetas.
        // Esto es útil para que el usuario pueda ver que puede interactuar con las tarjetas, y que al hacer hover sobre ellas, se vean más grandes y con una sombra más pronunciada.
        const operationCards = document.querySelectorAll('.operation-card');
        operationCards.forEach(card => {
            // Añade un event listener para el evento mouseenter, que se activa cuando el mouse entra en la tarjeta.
            // Esto permite que la tarjeta se vea más grande y con una sombra más pronunciada al hacer hover sobre ella.
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px) scale(1.02)'; // Aplica una transformación para que la tarjeta se vea más grande y con una sombra más pronunciada al hacer hover sobre ella.
                this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'; // Aplica una sombra más pronunciada para que la tarjeta se vea más grande y con una sombra más pronunciada al hacer hover sobre ella.
            });
            
            card.addEventListener('mouseleave', function() {
                // Añade un event listener para el evento mouseleave, que se activa cuando el mouse sale de la tarjeta.
                // Esto permite que la tarjeta vuelva a su tamaño original y sombra normal al dejar de hacer hover sobre ella.
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            });
        });
    }
    
    static enhanceButtons() {
        // Añade un efecto de "ripple" a los botones de envío y botones, para mejorar la experiencia del usuario al interactuar con los botones.
        // Pero que es un efecto de "ripple"? es un efecto visual que simula ondas que se propagan desde el punto donde se hace clic, creando una sensación de interacción más dinámica y atractiva.
        const buttons = document.querySelectorAll('input[type="submit"], button');
        buttons.forEach(btn => {
            // Añade un event listener para el evento click, que se activa cuando se hace clic en el botón.
            btn.addEventListener('click', function(e) {
                // Crea un elemento span que representará el efecto de "ripple".
                // Este elemento span se posicionará en el lugar donde se hizo clic, y tendrá un tamaño que cubre todo el botón.
              // La e Previene el comportamiento por defecto del botón, como enviar un formulario.
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);

                
                ripple.style.width = ripple.style.height = size + 'px'; // Establece el ancho y alto del efecto de "ripple" para que cubra todo el botón.
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px'; // Calcula la posición horizontal del efecto de "ripple" basado en la posición del clic y el tamaño del botón.
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px'; // Calcula la posición vertical del efecto de "ripple" basado en la posición del clic y el tamaño del botón.
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
        // Esta clase se encarga de gestionar la selección de tipos de EDL (Estructuras de Datos Lineales) y actualizar el contenido del carrusel y la información relacionada.
        this.edlSelector = document.getElementById('edlType');
        this.headerDescription = document.getElementById('headerDescription');
        this.infoPanelTitle = document.getElementById('infoPanelTitle');
        this.infoPanelContent = document.getElementById('infoPanelContent');
        this.visualItems = document.querySelectorAll('.edl-visual-item');
        
        this.edlConfigs = {
            // Configuración de las EDL, que contiene la descripción, título de información y contenido de información para cada tipo de EDL.
            // Cada tipo de EDL tiene su propia configuración, que se usa para actualizar el contenido del carrusel y la información relacionada.
            // cosa antes mencionada, que se usa para no tener que repetir el mismo código en cada página de EDL, y así poder reutilizar el mismo código para todos los tipos de EDL.
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
        // Configura los event listeners para el selector de EDL y los elementos visuales.
        // Esto permite que al cambiar el tipo de EDL, se actualice el contenido del carrusel y la información relacionada.
        this.edlSelector.addEventListener('change', () => this.changeEDLType(this.edlSelector.value));
        
        this.visualItems.forEach(item => {
            // Añade un event listener a cada elemento visual de EDL, que permite seleccionar el tipo de EDL al hacer clic en el elemento.
            // Esto permite que al hacer clic en un elemento visual de EDL, se cambie el tipo de EDL seleccionado y se actualice el contenido del carrusel y la información relacionada.
            item.addEventListener('click', () => {
                // Al hacer clic en un elemento visual, actualiza el selector de EDL y cambia el tipo de EDL.
                // Esto permite que al hacer clic en un elemento visual de EDL, se cambie el tipo de EDL seleccionado y se actualice el contenido del carrusel y la información relacionada.
                const value = item.getAttribute('data-value');
                this.edlSelector.value = value;
                this.edlSelector.dispatchEvent(new Event('change', { bubbles: true }));
                this.visualItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }
    
    changeEDLType(type) {
        // Cambia el tipo de EDL seleccionado, actualizando el contenido del carrusel y la información relacionada.
        // Esto permite que al cambiar el tipo de EDL, se actualice el contenido del carrusel y la información relacionada.

        document.querySelectorAll('.edl-content').forEach(content => content.classList.add('hidden'));
        
        const selectedContent = document.getElementById(`${type}-content`);
        if (selectedContent) selectedContent.classList.remove('hidden'); // Si existe el contenido seleccionado, lo muestra.
        
        if (window.carousel) { // Si el carrusel está inicializado, actualiza los elementos del carrusel y genera los indicadores.
            // Esto permite que al cambiar el tipo de EDL, se actualice el contenido del carrusel y la información relacionada.
            window.carousel.updateCarouselElements();
            window.carousel.generateIndicators();
            window.carousel.updateCarousel();
        }
        
        const config = this.edlConfigs[type];
        if (config) { // Si hay una configuración para el tipo de EDL seleccionado, actualiza la descripción del encabezado y el contenido del panel de información.
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
class SearchManager { // Esta clase se encarga de gestionar la búsqueda en las listas de estructuras de datos.
    // Permite buscar en las listas de estructuras de datos y mantener la paginación al realizar una búsqueda.
    constructor() {
        this.searchForms = document.querySelectorAll('form[action*="/buscar"]');
        this.init();
    }
    
    init() { // Inicializa el gestor de búsqueda, configurando los event listeners para los formularios de búsqueda.
        // Configura los event listeners para los formularios de búsqueda, que permiten buscar en las listas de estructuras de datos.
        this.searchForms.forEach(form => { // Itera sobre todos los formularios de búsqueda y añade un event listener para el evento submit.
            form.addEventListener('submit', (e) => { // Añade un event listener para el evento submit, que se activa cuando se envía el formulario de búsqueda.
                e.preventDefault(); // Previene el comportamiento por defecto del formulario, que sería recargar la página.
                this.handleSearch(form); // Llama al método handleSearch para manejar la búsqueda.
            });
        });
    }
    
    handleSearch(form) {
        // Maneja la búsqueda en el formulario, enviando los datos del formulario y actualizando la página con los resultados de la búsqueda.
        const formData = new FormData(form); // Obtiene los datos del formulario, que son los parámetros de búsqueda introducidos por el usuario.
        const searchValue = formData.get('valor'); // Obtiene el valor de búsqueda introducido por el usuario.
        const currentPage = new URLSearchParams(window.location.search).get('page') || 1; // Obtiene el número de página actual de la URL, o 1 si no está presente.
        
        // Conservar parámetros de paginación en la búsqueda
        const action = `${form.getAttribute('action')}?page=${currentPage}`;
        
        fetch(action, {
            // Envía los datos del formulario al servidor para realizar la búsqueda, y actualiza la página con los resultados de la búsqueda.
            method: 'POST',
            // Establece el método de la solicitud como POST, ya que estamos enviando datos al servidor.
            body: formData
        })
        .then(response => response.text()) // Convierte la respuesta del servidor a texto, que es el HTML de la página con los resultados de la búsqueda.
        .then(html => { // Actualiza el contenido de la página con los resultados de la búsqueda.
            // Actualiza el contenido de la página con los resultados de la búsqueda, reemplazando el contenido actual del documento con el HTML recibido del servidor.
            document.documentElement.innerHTML = html;
        })
        .catch(error => { // Maneja cualquier error que ocurra durante la búsqueda, mostrando un mensaje de error en la consola.
            console.error('Error en la búsqueda:', error);
        });
    }
}



// Espera a que el DOM esté completamente cargado antes de inicializar los módulos y aplicar las utilidades.
// Esto asegura que todos los elementos del DOM estén disponibles antes de intentar acceder a ellos o manipularlos.

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