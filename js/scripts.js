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


document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar componentes básicos
    initScrollEffects();
    initMobileMenu();
    initStepCarousel();
    renderVerificados();
});

/**
 * EFECTOS VISUALES (Fade-in, Reveal, Header, Parallax)
 */
function initScrollEffects() {
    // Observer para animaciones de entrada
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const isReveal = entry.target.classList.contains("reveal");
                entry.target.classList.add(isReveal ? "reveal-visible" : "fade-in-visible");
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll(".fade-in, .reveal").forEach(el => observer.observe(el));

    // Scroll Events: Header, Parallax y Counters
    const header = document.getElementById("ghia-header");
    const counters = document.querySelectorAll(".counter");
    let countersDone = false;

    window.addEventListener("scroll", () => {
        const scrollY = window.scrollY;

        // Header glass effect
        if (header) header.classList.toggle("scrolled-header", scrollY > 10);
        
        // Parallax suave
        document.querySelectorAll(".parallax-bg").forEach(bg => {
            bg.style.backgroundPositionY = (scrollY * 0.4) + "px";
        });

        // Counters (solo se ejecutan una vez)
        if (!countersDone) {
            counters.forEach(counter => {
                const rect = counter.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    animateCounter(counter);
                    countersDone = true; 
                }
            });
        }
    }, { passive: true });
}

function animateCounter(counter) {
    const target = +counter.getAttribute("data-target");
    const speed = 80;
    const animate = () => {
        const value = +counter.innerText;
        const step = Math.ceil(target / speed);
        if (value < target) {
            counter.innerText = Math.min(value + step, target);
            requestAnimationFrame(animate);
        }
    };
    animate();
}

/**
 * CARRUSEL VERIFICADOS (API + Efecto 3D Safari Friendly)
 */
async function renderVerificados() {
    const container = document.getElementById('carouselVerificados');
    if (!container) return;

    try {
        const res = await fetch('https://automarketpro.azurewebsites.net/api/verificacion?pageNumber=1&pageSize=12');
        const data = await res.json();
        const items = data.items || [];

        container.innerHTML = items.map(v => {
            const imgUrl = (v.rutaArchivos && v.rutaArchivos.length > 0) ? v.rutaArchivos[0] : 'placeholder.jpg';
            return `
                <div class="w-[280px] sm:w-[300px] md:w-[240px] snap-start bg-white rounded-2xl overflow-hidden shadow-lg carousel-card">
                    <a href="https://app.automarketpro.com.ar/verificados" class="block">
                        <div class="w-full h-48 bg-gray-100 overflow-hidden">
                            <img src="${imgUrl}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="${v.marca}">
                        </div>
                        <div class="p-4">
                            <h6 class="font-bold text-gray-800 truncate text-sm">${v.marca} ${v.modelo}</h6>
                            <p class="text-gray-500 text-xs">${v.anio} • ${Number(v.kilometraje).toLocaleString()} km</p>
                        </div>
                    </a>
                </div>
            `;
        }).join('');

        // Efecto de rotación optimizado
        container.addEventListener("scroll", () => {
            requestAnimationFrame(() => {
                const cards = container.querySelectorAll(".carousel-card");
                const centerX = window.innerWidth / 2;
                
                cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const cardCenter = rect.left + rect.width / 2;
                    const offset = (centerX - cardCenter) * 0.02; // Sensibilidad
                    const rotation = Math.max(Math.min(offset, 12), -12); // Límite de 12 grados
                    
                    // translateZ(0) es el truco mágico para Safari
                    card.style.transform = `perspective(1000px) rotateY(${rotation}deg) translateZ(0)`;
                });
            });
        }, { passive: true });

    } catch (err) {
        console.error('Error:', err);
    }
}

/**
 * PASO A PASO Y MENÚ MOBILE
 */
function initStepCarousel() {
    const slider = document.getElementById('carouselSlider');
    const dots = document.querySelectorAll('.step-dot');
    if (!slider || dots.length === 0) return;

    let current = 0;
    
    window.moveStepSlider = (dir) => {
        current = (current + dir + dots.length) % dots.length;
        update();
    };

    window.goToStepSlide = (idx) => {
        current = idx;
        update();
    };

    function update() {
        slider.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((dot, i) => {
            dot.classList.toggle('bg-blue-600', i === current);
            dot.classList.toggle('bg-gray-300', i !== current);
        });
    }
    
    setInterval(() => window.moveStepSlider(1), 5000);
}

function initMobileMenu() {
    const btn = document.getElementById("menu-btn");
    const menu = document.getElementById("mobile-menu");
    if (!btn || !menu) return;

    btn.addEventListener("click", () => {
        menu.classList.toggle("hidden");
        btn.children[0].classList.toggle("rotate-45");
        btn.children[1].classList.toggle("opacity-0");
        btn.children[2].classList.toggle("-rotate-45");
    });
}