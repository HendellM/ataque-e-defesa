const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // anima só uma vez
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));