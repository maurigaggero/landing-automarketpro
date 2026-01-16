// Fade-in & reveal on scroll
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add(
                entry.target.classList.contains("reveal")
                    ? "reveal-visible"
                    : "fade-in-visible"
            );
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll(".fade-in, .reveal").forEach(el => observer.observe(el));


// Mobile menu
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");

    // Animación hamburguesa
    menuBtn.children[0].classList.toggle("rotate-45");
    menuBtn.children[1].classList.toggle("opacity-0");
    menuBtn.children[2].classList.toggle("-rotate-45");
});

const header = document.getElementById("ghia-header");

window.addEventListener("scroll", () => {
    if (window.scrollY > 10) {
        header.classList.add("scrolled-header");
    } else {
        header.classList.remove("scrolled-header");
    }
});

// Counters
const counters = document.querySelectorAll(".counter");
const speed = 80;

counters.forEach(counter => {
    const animate = () => {
        const target = +counter.getAttribute("data-target");
        const value = +counter.innerText;
        const step = Math.ceil(target / speed);

        if (value < target) {
            counter.innerText = value + step;
            requestAnimationFrame(animate);
        } else {
            counter.innerText = target;
        }
    };

    const onScroll = () => {
        const rect = counter.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            animate();
            window.removeEventListener("scroll", onScroll);
        }
    };

    window.addEventListener("scroll", onScroll);
});


// Parallax (smooth)
window.addEventListener("scroll", () => {
    const scroll = window.pageYOffset;
    document.querySelectorAll(".parallax-bg").forEach(bg => {
        bg.style.backgroundPositionY = scroll * 0.4 + "px";
    });
});


/**
 * CONFIGURACIÓN GLOBAL Y EVENTOS
 */
document.addEventListener('DOMContentLoaded', () => {
    initStepCarousel();
    renderVerificados();
    initScrollEffects();
    initMobileMenu();
});

/**
 * 1. LÓGICA DEL CARRUSEL "PASO A PASO"
 */
function initStepCarousel() {
    const stepSlider = document.getElementById('carouselSlider');
    const stepDots = document.querySelectorAll('.step-dot');
    
    if (!stepSlider || stepDots.length === 0) return;

    let currentStepSlide = 0;
    const totalStepSlides = stepDots.length;
    let autoPlayInterval;

    function updateStepSlider() {
        stepSlider.style.transform = `translateX(-${currentStepSlide * 100}%)`;
        
        stepDots.forEach((dot, index) => {
            if (index === currentStepSlide) {
                dot.classList.replace('bg-gray-300', 'bg-blue-600');
            } else {
                dot.classList.replace('bg-blue-600', 'bg-gray-300');
            }
        });
    }

    // Definir funciones en el objeto window para que el HTML las encuentre
    window.moveStepSlider = (direction) => {
        currentStepSlide = (currentStepSlide + direction + totalStepSlides) % totalStepSlides;
        updateStepSlider();
        resetAutoPlay(); // Reinicia el tiempo si el usuario hace click
    };

    window.goToStepSlide = (index) => {
        currentStepSlide = index;
        updateStepSlider();
        resetAutoPlay();
    };

    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            currentStepSlide = (currentStepSlide + 1) % totalStepSlides;
            updateStepSlider();
        }, 5000);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    // Iniciar
    startAutoPlay();

    // Pausar al pasar el mouse
    stepSlider.parentElement.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    stepSlider.parentElement.addEventListener('mouseleave', startAutoPlay);
}

/**
 * 2. LÓGICA DE VEHÍCULOS VERIFICADOS (API)
 */
async function getVerificados(limit = 12) {
    try {
        const res = await fetch(`https://automarketpro.azurewebsites.net/api/verificacion?pageNumber=1&pageSize=${limit}`);
        const data = await res.json();
        return data.items || [];
    } catch (err) {
        console.error('Error al obtener verificaciones:', err);
        return [];
    }
}

async function renderVerificados() {
    const container = document.getElementById('carouselVerificados');
    if (!container) return;

    container.innerHTML = "";
    container.className = "flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 custom-scrollbar";

    const verificaciones = await getVerificados(12);

    verificaciones.forEach(v => {
        const imgUrl = (v.rutaArchivos && v.rutaArchivos.length > 0) ? v.rutaArchivos[0] : 'placeholder.jpg';
        const div = document.createElement('div');
        div.className = "w-[280px] sm:w-[300px] md:w-[220px] flex-shrink-0 snap-start bg-white rounded-2xl overflow-hidden shadow-lg transition-all carousel-card";
        
        div.innerHTML = `
            <a href="https://app.automarketpro.com.ar/verificados" class="block">
                <div class="w-full h-52 bg-gray-100 overflow-hidden">
                    <img src="${imgUrl}" class="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500" alt="${v.marca}">
                </div>
                <div class="p-3">
                    <h6 class="font-bold text-gray-800 truncate text-sm">${v.marca} ${v.modelo}</h6>
                    <p class="text-gray-500 text-xs">${v.anio} • ${Number(v.kilometraje).toLocaleString()} km</p>
                </div>
            </a>
        `;
        container.appendChild(div);
    });

    container.addEventListener("scroll", () => {
        const cards = container.querySelectorAll(".carousel-card");
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const offset = (window.innerWidth / 2 - rect.left) * 0.03;
            card.style.transform = `perspective(900px) rotateY(${offset}deg)`;
        });
    });
}

/**
 * 3. EFECTOS VISUALES Y MENÚ
 */
function initScrollEffects() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(
                    entry.target.classList.contains("reveal") ? "reveal-visible" : "fade-in-visible"
                );
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll(".fade-in, .reveal").forEach(el => observer.observe(el));

    const header = document.getElementById("ghia-header");
    window.addEventListener("scroll", () => {
        if (header) header.classList.toggle("scrolled-header", window.scrollY > 10);
        
        document.querySelectorAll(".parallax-bg").forEach(bg => {
            bg.style.backgroundPositionY = window.pageYOffset * 0.4 + "px";
        });
    });
}

function initMobileMenu() {
    const menuBtn = document.getElementById("menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    if (!menuBtn || !mobileMenu) return;

    menuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
        menuBtn.children[0].classList.toggle("rotate-45");
        menuBtn.children[1].classList.toggle("opacity-0");
        menuBtn.children[2].classList.toggle("-rotate-45");
    });
}