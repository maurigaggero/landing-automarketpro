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

// Verificados

const carousel = document.getElementById("carouselVerificados");

carousel.addEventListener("scroll", () => {
    const cards = carousel.querySelectorAll(".carousel-card");
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const offset = (window.innerWidth / 2 - rect.left) * 0.03;
        card.style.transform = `perspective(900px) rotateY(${offset}deg)`;
    });
});

async function getVerificados(limit = 12) {
    try {
        const res = await fetch('https://automarketpro.azurewebsites.net/api/verificacion?pageNumber=1&pageSize=' + limit);
        const data = await res.json();

        return data.items || [];

    } catch (err) {
        console.error('Error al obtener verificaciones:', err);
        return [];
    }
}

async function renderVerificados() {
    const container = document.getElementById('carouselVerificados');
    container.innerHTML = "";

    const verificaciones = await getVerificados(12);

    if (verificaciones.length === 0) {
        container.innerHTML = `
            <p class="text-center text-gray-500 mt-3 w-full">
                No hay vehículos disponibles en este momento.
            </p>`;
        return;
    }

    verificaciones.forEach(v => {
        const div = document.createElement('div');
        div.className = `
            bg-white rounded-2xl overflow-hidden shadow-lg
            hover:shadow-2xl hover:-translate-y-[3px]
            transition-all duration-300 cursor-pointer flex-shrink-0 snap-start
            w-[90%] sm:w-[300px] md:w-[220px]
        `;

        const link = document.createElement('a');
        link.href = `https://app.automarketpro.com.ar/verificados`;
        link.style.textDecoration = 'none';
        link.style.color = 'inherit';

        link.innerHTML = `
            <img src="${v.rutaArchivos[0]}" class="h-72 w-full object-cover" alt="Foto de ${v.dominio}">
            <div class="p-3">
                <h6 class="font-semibold text-gray-900 mb-1">${v.marca} ${v.modelo}</h6>
                <small class="text-gray-500">${v.anio} - ${v.kilometraje} km</small>
            </div>
        `;

        div.appendChild(link);
        container.appendChild(div);
    });
};

document.addEventListener('DOMContentLoaded', renderVerificados);