/* ============================================================
   script.js  —  My Blog Michelle
   Animaciones y comportamientos globales del sitio.
   El flipbook tiene su propio JS embebido en diario.html.
============================================================ */

/* ----------------------------------------------------------
   1. CURSOR PERSONALIZADO
   Crea un cursor con halo que sigue al mouse en todo el sitio.
---------------------------------------------------------- */
(function initCursor() {
    const dot  = document.createElement('div');
    const halo = document.createElement('div');

    dot.style.cssText = `
        position: fixed; pointer-events: none; z-index: 99999;
        width: 8px; height: 8px; border-radius: 50%;
        background: #ffc2c2;
        transform: translate(-50%, -50%);
        transition: transform 0.08s ease;
        mix-blend-mode: difference;
    `;
    halo.style.cssText = `
        position: fixed; pointer-events: none; z-index: 99998;
        width: 36px; height: 36px; border-radius: 50%;
        border: 1.5px solid rgba(255,194,194,0.5);
        transform: translate(-50%, -50%);
        transition: left 0.14s ease, top 0.14s ease, width 0.2s, height 0.2s, opacity 0.2s;
    `;

    document.body.appendChild(dot);
    document.body.appendChild(halo);

    let mx = 0, my = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.left  = mx + 'px';
        dot.style.top   = my + 'px';
        halo.style.left = mx + 'px';
        halo.style.top  = my + 'px';
    });

    /* Halo se expande sobre links y botones */
    document.addEventListener('mouseover', e => {
        if (e.target.matches('a, button, .mood-btn, .flip-btn, .nav-buttons a, .polaroid-item')) {
            halo.style.width   = '58px';
            halo.style.height  = '58px';
            halo.style.opacity = '0.7';
            halo.style.borderColor = 'rgba(255,77,109,0.7)';
        }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.matches('a, button, .mood-btn, .flip-btn, .nav-buttons a, .polaroid-item')) {
            halo.style.width   = '36px';
            halo.style.height  = '36px';
            halo.style.opacity = '1';
            halo.style.borderColor = 'rgba(255,194,194,0.5)';
        }
    });
})();


/* ----------------------------------------------------------
   2. PARTÍCULAS DE CORAZONES FLOTANTES
   Al hacer clic en cualquier parte aparece un corazón que sube.
---------------------------------------------------------- */
(function initHearts() {
    const SYMBOLS = ['♡', '✦', '☆', '✿', '♪'];

    document.addEventListener('click', e => {
        /* no en botones de control para no interferir */
        if (e.target.matches('button, a, input, textarea')) return;

        const el = document.createElement('span');
        const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const size   = 14 + Math.random() * 14;
        const drift  = (Math.random() - 0.5) * 80;

        el.textContent = symbol;
        el.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top:  ${e.clientY}px;
            font-size: ${size}px;
            color: #ffc2c2;
            pointer-events: none;
            z-index: 99997;
            user-select: none;
            animation: floatUp 1.4s ease-out forwards;
            transform: translate(-50%, -50%);
            text-shadow: 0 0 8px #ff4d6d;
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    });

    /* Inyectar keyframe una sola vez */
    if (!document.getElementById('heartKF')) {
        const s = document.createElement('style');
        s.id = 'heartKF';
        s.textContent = `
            @keyframes floatUp {
                0%   { opacity: 1; transform: translate(calc(-50% + 0px), -50%) scale(1); }
                100% { opacity: 0; transform: translate(calc(-50% + ${0}px), -120px) scale(0.4); }
            }
        `;
        document.head.appendChild(s);
    }

    /* Versión con drift individual por elemento */
    const realKF = document.createElement('style');
    realKF.textContent = `
        @keyframes floatUp {
            0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(calc(-50% + var(--drift, 0px)), -130px) scale(0.3); }
        }
    `;
    document.head.appendChild(realKF);

    /* override con drift por elemento */
    document.addEventListener('click', e => {
        if (e.target.matches('button, a, input, textarea')) return;
        const last = document.body.lastElementChild;
        if (last && last.tagName === 'SPAN') {
            const d = (Math.random() - 0.5) * 90;
            last.style.setProperty('--drift', d + 'px');
        }
    });
})();


/* ----------------------------------------------------------
   3. ANIMACIÓN DE ENTRADA (Intersection Observer)
   Las ventanas .retro-window aparecen con fade-in al hacer scroll.
---------------------------------------------------------- */
(function initReveal() {
    const style = document.createElement('style');
    style.textContent = `
        .retro-window {
            opacity: 0;
            transform: translateY(22px);
            transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .retro-window.revealed {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver(entries => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                /* escalonado suave */
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, i * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.retro-window').forEach(el => observer.observe(el));
})();


/* ----------------------------------------------------------
   4. MARQUEE HOVER-PAUSE
   La cinta de videos se pausa al pasar el mouse.
---------------------------------------------------------- */
(function initMarquee() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
})();


/* ----------------------------------------------------------
   5. EFECTO GLITCH en el nombre del header
   Cada ~6 segundos, el título hace un glitch breve.
---------------------------------------------------------- */
(function initGlitch() {
    const name = document.querySelector('.sparkle-name');
    if (!name) return;

    /* Inyectar keyframes de glitch */
    const s = document.createElement('style');
    s.textContent = `
        @keyframes glitchPop {
            0%  { text-shadow: 0 0 10px #ff3366, 0 0 20px #ff0033, 0 0 40px #cc0000, 0 0 80px #65010E; clip-path: none; }
            10% { text-shadow: 4px 0 0 #ff0033, -4px 0 0 #00ffff; clip-path: inset(20% 0 60% 0); transform: translate(-2px,0) skewX(-5deg); }
            20% { text-shadow: -4px 0 0 #ff0033, 4px 0 0 #00ffff; clip-path: inset(50% 0 30% 0); transform: translate(3px,0); }
            30% { clip-path: none; transform: translate(0,0) skewX(0deg); }
            100%{ text-shadow: 0 0 10px #ff3366, 0 0 20px #ff0033, 0 0 40px #cc0000, 0 0 80px #65010E; }
        }
        .glitching {
            animation: glitchPop 0.35s linear forwards;
        }
    `;
    document.head.appendChild(s);

    function triggerGlitch() {
        name.classList.add('glitching');
        name.addEventListener('animationend', () => name.classList.remove('glitching'), { once: true });
    }

    setInterval(triggerGlitch, 5800 + Math.random() * 3000);
})();


/* ----------------------------------------------------------
   6. POLAROID TILT en la galería
   Las polaroids se inclinan hacia el cursor al hacer hover.
---------------------------------------------------------- */
(function initPolaroidTilt() {
    document.querySelectorAll('.polaroid-item').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r    = card.getBoundingClientRect();
            const cx   = r.left + r.width  / 2;
            const cy   = r.top  + r.height / 2;
            const dx   = (e.clientX - cx) / (r.width  / 2);
            const dy   = (e.clientY - cy) / (r.height / 2);
            const rotX =  dy * -8;
            const rotY =  dx *  8;
            card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.06)`;
        });
        card.addEventListener('mouseleave', () => {
            /* recupera la rotación aleatoria original */
            card.style.transform = '';
        });
    });
})();


/* ----------------------------------------------------------
   7. SONIDO DE PÁGINA (Web Audio API)
   Genera un "whoosh" suave al girar páginas del diario.
   Solo si estamos en diario.html.
---------------------------------------------------------- */
(function initPageSound() {
    if (!document.getElementById('book')) return;   /* solo en diario */

    let ctx = null;

    function getCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        return ctx;
    }

    function playFlip() {
        try {
            const c      = getCtx();
            const buf    = c.createBuffer(1, c.sampleRate * 0.25, c.sampleRate);
            const data   = buf.getChannelData(0);

            /* ruido de papel: ruido blanco con envolvente decay */
            for (let i = 0; i < data.length; i++) {
                const t    = i / c.sampleRate;
                const env  = Math.exp(-t * 18);          /* decay rápido */
                data[i]    = (Math.random() * 2 - 1) * env * 0.35;
            }

            const src    = c.createBufferSource();
            src.buffer   = buf;

            /* Filtro pasa-bajos para que suene más a papel y menos a ruido */
            const filter = c.createBiquadFilter();
            filter.type  = 'lowpass';
            filter.frequency.value = 1800;

            src.connect(filter);
            filter.connect(c.destination);
            src.start();
        } catch(e) { /* AudioContext bloqueado: silencio */ }
    }

    /* Enganchar a los botones del flipbook */
    const nb = document.getElementById('nextBtn');
    const pb = document.getElementById('prevBtn');
    if (nb) nb.addEventListener('click', playFlip);
    if (pb) pb.addEventListener('click', playFlip);

    /* También con las teclas */
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') playFlip();
    });
})();

