/**
 * ROMANTIC WOMEN'S DAY - 3D ENVELOPE & SCROLLABLE CARD ENGINE
 */

(function () {
    'use strict';

    /* ==========================================================================
       CANVAS CÁNH HOA & BỤI SAO VẬT LÝ (PETAL & SPARKLE ENGINE)
       ========================================================================== */

    const canvas = document.getElementById('petalsCanvas');
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const SAKURA_COLORS = [
        'rgba(255, 183, 197, 0.85)',
        'rgba(255, 192, 203, 0.85)',
        'rgba(255, 218, 224, 0.85)',
        'rgba(255, 160, 180, 0.85)',
    ];

    const ROSE_COLORS = [
        'rgba(225, 45, 85, 0.85)',
        'rgba(240, 70, 105, 0.85)',
        'rgba(195, 25, 65, 0.85)',
        'rgba(255, 100, 130, 0.85)',
    ];

    const GOLD_COLORS = [
        'rgba(255, 225, 130, 0.95)',
        'rgba(255, 245, 180, 0.95)',
        'rgba(255, 215, 0, 0.9)',
        'rgba(255, 255, 255, 0.95)',
    ];

    class Particle {
        constructor(x, y, isBurst = false) {
            this.reset(x, y, isBurst);
        }

        reset(x, y, isBurst = false) {
            this.isBurst = isBurst;
            this.type = Math.random() < 0.25 ? 'sparkle' : Math.random() < 0.65 ? 'sakura' : 'rose';

            this.x = x !== undefined ? x : Math.random() * width;
            this.y = y !== undefined ? y : (isBurst ? y : -20 - Math.random() * 50);

            if (this.type === 'sparkle') {
                this.size = 2 + Math.random() * 3.5;
                this.color = GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)];
            } else if (this.type === 'sakura') {
                this.size = 9 + Math.random() * 8;
                this.color = SAKURA_COLORS[Math.floor(Math.random() * SAKURA_COLORS.length)];
            } else {
                this.size = 11 + Math.random() * 9;
                this.color = ROSE_COLORS[Math.floor(Math.random() * ROSE_COLORS.length)];
            }

            if (isBurst) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 3.0 + Math.random() * 8;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed - 2.5;
                this.friction = 0.96;
                this.gravity = 0.08;
            } else {
                this.vx = (Math.random() - 0.5) * 1.5;
                this.vy = 1.0 + Math.random() * 1.8;
                this.friction = 1;
                this.gravity = 0;
            }

            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.04;
            this.flipAngle = Math.random() * Math.PI * 2;
            this.flipSpeed = 0.02 + Math.random() * 0.04;

            this.oscillationSpeed = 0.015 + Math.random() * 0.02;
            this.oscillationDistance = 25 + Math.random() * 30;
            this.initialX = this.x;
            this.time = Math.random() * 100;

            this.opacity = 0.4 + Math.random() * 0.6;
            this.fadeSpeed = isBurst ? 0.005 + Math.random() * 0.008 : 0;
        }

        update(windX) {
            this.time += this.oscillationSpeed;
            this.rotation += this.rotationSpeed;
            this.flipAngle += this.flipSpeed;

            if (this.isBurst) {
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.vy += this.gravity;
                this.x += this.vx;
                this.y += this.vy;
                this.opacity -= this.fadeSpeed;
            } else {
                this.x = this.initialX + Math.sin(this.time) * this.oscillationDistance + windX;
                this.initialX += this.vx * 0.2;
                this.y += this.vy;

                if (this.y > height + 30) {
                    this.reset();
                }
            }
        }

        draw(ctx) {
            if (this.opacity <= 0) return;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            const flip = Math.cos(this.flipAngle);
            ctx.scale(1, flip);

            ctx.globalAlpha = Math.max(0, this.opacity);

            if (this.type === 'sparkle') {
                ctx.fillStyle = this.color;
                ctx.shadowColor = '#fff7b2';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-this.size * 2, 0);
                ctx.lineTo(this.size * 2, 0);
                ctx.moveTo(0, -this.size * 2);
                ctx.lineTo(0, this.size * 2);
                ctx.stroke();
            } else {
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.type === 'rose' ? 'rgba(230, 40, 80, 0.4)' : 'rgba(255, 180, 200, 0.4)';
                ctx.shadowBlur = 8;

                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                ctx.bezierCurveTo(-this.size * 0.8, -this.size * 0.5, -this.size * 0.8, this.size * 0.5, 0, this.size);
                ctx.bezierCurveTo(this.size * 0.8, this.size * 0.5, this.size * 0.8, -this.size * 0.5, 0, -this.size);
                ctx.fill();

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(0, -this.size * 0.7);
                ctx.lineTo(0, this.size * 0.7);
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    const PARTICLE_COUNT = Math.min(65, Math.floor((width * height) / 18000));
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = new Particle();
        p.y = Math.random() * height;
        particles.push(p);
    }

    const burstParticles = [];
    let globalWind = 0;
    let windTime = 0;

    function animate() {
        ctx.clearRect(0, 0, width, height);

        windTime += 0.01;
        globalWind = Math.sin(windTime) * 35;

        for (let i = 0; i < particles.length; i++) {
            particles[i].update(globalWind);
            particles[i].draw(ctx);
        }

        for (let i = burstParticles.length - 1; i >= 0; i--) {
            burstParticles[i].update(globalWind * 0.5);
            burstParticles[i].draw(ctx);
            if (burstParticles[i].opacity <= 0) {
                burstParticles.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    function createFlowerBurst(x, y, count = 30) {
        for (let i = 0; i < count; i++) {
            burstParticles.push(new Particle(x, y, true));
        }
    }

    // Chạm/Click bất kỳ đâu để bung hoa
    window.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('#envelopeContainer') || e.target.closest('.card-scroll-body')) {
            return;
        }
        createFlowerBurst(e.clientX, e.clientY, 30);
        playChimeSound();
    });

    window.addEventListener('touchstart', (e) => {
        if (e.target.closest('button') || e.target.closest('#envelopeContainer') || e.target.closest('.card-scroll-body')) {
            return;
        }
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            createFlowerBurst(touch.clientX, touch.clientY, 25);
            playChimeSound();
        }
    }, { passive: true });


    /* ==========================================================================
       HIỆU ỨNG MỞ PHONG BÌ & HIỆN THIỆP 3D
       ========================================================================== */

    const envelopeContainer = document.getElementById('envelopeContainer');
    const envelopeBox = document.getElementById('envelopeBox');
    const cardWrapper = document.getElementById('cardWrapper');
    const closeCardBtn = document.getElementById('closeCardBtn');
    const cardScrollBody = document.getElementById('cardScrollBody');
    const scrollIndicator = document.getElementById('scrollIndicator');

    let isCardOpen = false;

    function openEnvelope() {
        if (isCardOpen) return;
        isCardOpen = true;

        initAudio();
        playChimeSound();

        // 1. Mở nắp phong bì
        envelopeBox.classList.add('is-open');

        // Bắn pháo hoa cánh hoa từ con dấu sáp
        const rect = envelopeBox.getBoundingClientRect();
        createFlowerBurst(rect.left + rect.width / 2, rect.top + 80, 40);

        // 2. Sau 600ms, chiếc thiệp từ từ bay lên và phóng lớn
        setTimeout(() => {
            envelopeContainer.classList.add('is-hidden');
            cardWrapper.classList.add('is-active');

            // Thêm đợt bung hoa mừng rực rỡ
            createFlowerBurst(width / 2, height / 2 - 50, 45);

            // Kiểm tra khả năng cuộn nội dung thiệp
            checkScrollAbility();
        }, 650);
    }

    function closeCard() {
        if (!isCardOpen) return;
        isCardOpen = false;

        cardWrapper.classList.remove('is-active');

        setTimeout(() => {
            envelopeContainer.classList.remove('is-hidden');
            envelopeBox.classList.remove('is-open');
        }, 400);
    }

    if (envelopeContainer) {
        envelopeContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            openEnvelope();
        });
    }

    if (closeCardBtn) {
        closeCardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeCard();
        });
    }

    // Kiểm tra và xử lý scroll indicator
    function checkScrollAbility() {
        if (!cardScrollBody || !scrollIndicator) return;

        if (cardScrollBody.scrollHeight > cardScrollBody.clientHeight + 20) {
            scrollIndicator.style.display = 'block';
        } else {
            scrollIndicator.style.display = 'none';
        }
    }

    if (cardScrollBody && scrollIndicator) {
        cardScrollBody.addEventListener('scroll', () => {
            const isNearBottom = cardScrollBody.scrollHeight - cardScrollBody.scrollTop <= cardScrollBody.clientHeight + 30;
            if (isNearBottom) {
                scrollIndicator.style.opacity = '0';
            } else {
                scrollIndicator.style.opacity = '1';
            }
        });
    }


    /* ==========================================================================
       HIỆU ỨNG THIỆP 3D PARALLAX TILT
       ========================================================================== */

    const card = document.getElementById('romanticCard');
    let mouseX = width / 2;
    let mouseY = height / 2;
    let currentRotateX = 0;
    let currentRotateY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function updateCardTilt() {
        if (card && isCardOpen) {
            const diffX = (mouseX - width / 2) / (width / 2);
            const diffY = (mouseY - height / 2) / (height / 2);

            const targetRotateY = diffX * 10;
            const targetRotateX = -diffY * 10;

            currentRotateX += (targetRotateX - currentRotateX) * 0.08;
            currentRotateY += (targetRotateY - currentRotateY) * 0.08;

            card.style.transform = `perspective(1200px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;
        }
        requestAnimationFrame(updateCardTilt);
    }
    requestAnimationFrame(updateCardTilt);

    // Hỗ trợ cảm biến con quay hồi chuyển trên điện thoại
    window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
            const gamma = Math.max(-25, Math.min(25, e.gamma));
            const beta = Math.max(-25, Math.min(25, e.beta - 45));
            currentRotateY = (gamma / 25) * 10;
            currentRotateX = (-beta / 25) * 10;
        }
    });


    /* ==========================================================================
       ÂM NHẠC LÃNG MẠN DU DƯƠNG (WEB AUDIO API SYNTHESIZER)
       ========================================================================== */

    let audioCtx = null;
    let isMusicPlaying = false;
    let melodyTimer = null;

    const NOTES = [
        261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99
    ];

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playNote(freq, duration = 2.5, gainLevel = 0.08) {
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        const now = audioCtx.currentTime;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(gainLevel, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + duration);
    }

    function playChimeSound() {
        initAudio();
        const note = NOTES[Math.floor(Math.random() * NOTES.length)];
        playNote(note * 1.5, 1.2, 0.04);
    }

    const MELODY_SEQUENCE = [
        [0, 2, 4], [3, 5], [4, 6], [2, 4, 7],
        [1, 3, 5], [0, 4, 7], [3, 6], [2, 5, 8]
    ];
    let melodyIndex = 0;

    function playMelodyStep() {
        if (!isMusicPlaying) return;

        const chordIndices = MELODY_SEQUENCE[melodyIndex % MELODY_SEQUENCE.length];
        chordIndices.forEach((idx, i) => {
            setTimeout(() => {
                if (isMusicPlaying) {
                    playNote(NOTES[idx % NOTES.length], 3.0, 0.05);
                }
            }, i * 220);
        });

        melodyIndex++;
        melodyTimer = setTimeout(playMelodyStep, 2200);
    }

    const musicBtn = document.getElementById('musicToggleBtn');
    if (musicBtn) {
        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            initAudio();

            isMusicPlaying = !isMusicPlaying;
            if (isMusicPlaying) {
                musicBtn.classList.add('active');
                musicBtn.querySelector('.btn-text').textContent = 'Đang phát';
                playMelodyStep();
            } else {
                musicBtn.classList.remove('active');
                musicBtn.querySelector('.btn-text').textContent = 'Giai điệu';
                clearTimeout(melodyTimer);
            }
        });
    }

    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                document.exitFullscreen().catch(() => {});
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            }
        });
    }

    // Tự động bung nhẹ vài cánh hoa chào mừng
    setTimeout(() => {
        createFlowerBurst(width / 2, height / 2 - 40, 25);
    }, 500);

})();
