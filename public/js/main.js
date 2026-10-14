/**
 * ROMANTIC WOMEN'S DAY 8/3 - 3D CARD & PETAL PHYSICS ENGINE
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

    // Các màu sắc cánh hoa tinh tế
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

            // Kích thước
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

            // Vận tốc
            if (isBurst) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 2.5 + Math.random() * 7;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed - 2; // Hơi bay lên lúc đầu
                this.friction = 0.96;
                this.gravity = 0.08;
            } else {
                this.vx = (Math.random() - 0.5) * 1.5;
                this.vy = 1.0 + Math.random() * 1.8;
                this.friction = 1;
                this.gravity = 0;
            }

            // Góc xoay & uốn lượn 3D
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.04;
            this.flipAngle = Math.random() * Math.PI * 2;
            this.flipSpeed = 0.02 + Math.random() * 0.04;

            this.oscillationSpeed = 0.015 + Math.random() * 0.02;
            this.oscillationDistance = 25 + Math.random() * 30;
            this.initialX = this.x;
            this.time = Math.random() * 100;

            this.opacity = 0.4 + Math.random() * 0.6;
            this.fadeSpeed = isBurst ? 0.006 + Math.random() * 0.008 : 0;
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

                // Tái sinh hạt khi rơi khỏi đáy màn hình
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

            // Mô phỏng xoay lật 3D trong không gian
            const flip = Math.cos(this.flipAngle);
            ctx.scale(1, flip);

            ctx.globalAlpha = Math.max(0, this.opacity);

            if (this.type === 'sparkle') {
                // Hạt sao lấp lánh 4 cánh
                ctx.fillStyle = this.color;
                ctx.shadowColor = '#fff7b2';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();

                // Chữ thập phát sáng
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-this.size * 2, 0);
                ctx.lineTo(this.size * 2, 0);
                ctx.moveTo(0, -this.size * 2);
                ctx.lineTo(0, this.size * 2);
                ctx.stroke();
            } else {
                // Vẽ hình cánh hoa tự nhiên bằng đường cong Bezier
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.type === 'rose' ? 'rgba(230, 40, 80, 0.4)' : 'rgba(255, 180, 200, 0.4)';
                ctx.shadowBlur = 8;

                ctx.beginPath();
                ctx.moveTo(0, -this.size);
                // Nửa cánh trái
                ctx.bezierCurveTo(-this.size * 0.8, -this.size * 0.5, -this.size * 0.8, this.size * 0.5, 0, this.size);
                // Nửa cánh phải
                ctx.bezierCurveTo(this.size * 0.8, this.size * 0.5, this.size * 0.8, -this.size * 0.5, 0, -this.size);
                ctx.fill();

                // Gân hoa trang nhã mỏng manh
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

    // Danh sách hạt thường trực
    const PARTICLE_COUNT = Math.min(65, Math.floor((width * height) / 18000));
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = new Particle();
        p.y = Math.random() * height; // Phân bổ đều khắp màn hình lúc đầu
        particles.push(p);
    }

    // Danh sách hạt bung tỏa khi click
    const burstParticles = [];

    // Gió nhẹ tự nhiên
    let globalWind = 0;
    let windTime = 0;

    function animate() {
        ctx.clearRect(0, 0, width, height);

        windTime += 0.01;
        globalWind = Math.sin(windTime) * 35;

        // Vẽ và cập nhật hạt thường trực
        for (let i = 0; i < particles.length; i++) {
            particles[i].update(globalWind);
            particles[i].draw(ctx);
        }

        // Cập nhật và vẽ hạt burst
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

    // Hàm tạo bùng nổ cánh hoa tại tọa độ (x, y)
    function createFlowerBurst(x, y, count = 28) {
        for (let i = 0; i < count; i++) {
            burstParticles.push(new Particle(x, y, true));
        }
    }

    // Tương tác nhấp chuột / chạm toàn màn hình để bung hoa
    window.addEventListener('click', (e) => {
        // Tránh kích hoạt khi bấm vào các nút điều khiển
        if (e.target.closest('button') || e.target.closest('a') || e.target.isContentEditable) {
            return;
        }
        createFlowerBurst(e.clientX, e.clientY, 32);
        playChimeSound();
    });

    window.addEventListener('touchstart', (e) => {
        if (e.target.closest('button') || e.target.closest('a') || e.target.isContentEditable) {
            return;
        }
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            createFlowerBurst(touch.clientX, touch.clientY, 25);
            playChimeSound();
        }
    }, { passive: true });


    /* ==========================================================================
       HIỆU ỨNG THIỆP 3D PARALLAX TILT
       ========================================================================== */

    const card = document.getElementById('romanticCard');
    const viewport = document.getElementById('cardViewport');

    let mouseX = width / 2;
    let mouseY = height / 2;
    let currentRotateX = 0;
    let currentRotateY = 0;

    function handleMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

    window.addEventListener('mousemove', handleMouseMove);

    // Mượt mà hóa góc nghiêng bằng Lerp
    function updateCardTilt() {
        if (card && viewport) {
            const rect = viewport.getBoundingClientRect();
            const cardCenterX = rect.left + rect.width / 2;
            const cardCenterY = rect.top + rect.height / 2;

            const diffX = (mouseX - cardCenterX) / (width / 2);
            const diffY = (mouseY - cardCenterY) / (height / 2);

            const targetRotateY = diffX * 12; // Tối đa 12 độ
            const targetRotateX = -diffY * 12;

            currentRotateX += (targetRotateX - currentRotateX) * 0.08;
            currentRotateY += (targetRotateY - currentRotateY) * 0.08;

            card.style.transform = `perspective(1200px) rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;
        }
        requestAnimationFrame(updateCardTilt);
    }
    requestAnimationFrame(updateCardTilt);

    // Hỗ trợ cảm biến nghiêng điện thoại (Gyroscope)
    window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
            const gamma = Math.max(-30, Math.min(30, e.gamma)); // Trục ngang
            const beta = Math.max(-30, Math.min(30, e.beta - 45)); // Trục dọc
            currentRotateY = (gamma / 30) * 12;
            currentRotateX = (-beta / 30) * 12;
        }
    });


    /* ==========================================================================
       ÂM NHẠC LÃNG MẠN DU DƯƠNG (WEB AUDIO API SYNTHESIZER)
       ========================================================================== */

    let audioCtx = null;
    let isMusicPlaying = false;
    let melodyTimer = null;

    // Các nốt nhạc êm dịu cung Đô Trưởng / Ngũ Cung lãng mạn (Hz)
    const NOTES = [
        261.63, // C4
        293.66, // D4
        329.63, // E4
        392.00, // G4
        440.00, // A4
        523.25, // C5
        587.33, // D5
        659.25, // E5
        783.99  // G5
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

    // Chơi 1 nốt đàn piano / music box êm dịu
    function playNote(freq, duration = 2.5, gainLevel = 0.08) {
        if (!audioCtx) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // Sóng sine ấm áp kết hợp triangle nhẹ
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

    // Âm thanh chim hót / tiếng chuông khi chạm màn hình
    function playChimeSound() {
        if (!isMusicPlaying && !audioCtx) return;
        initAudio();
        const note = NOTES[Math.floor(Math.random() * NOTES.length)];
        playNote(note * 1.5, 1.2, 0.04);
    }

    // Chuỗi giai điệu bồng bềnh
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
                showToast('🎵 Đã bật giai điệu lãng mạn');
            } else {
                musicBtn.classList.remove('active');
                musicBtn.querySelector('.btn-text').textContent = 'Giai điệu';
                clearTimeout(melodyTimer);
                showToast('Đã tạm dừng âm nhạc');
            }
        });
    }


    /* ==========================================================================
       CÁC NÚT ĐIỀU KHIỂN & TƯƠNG TÁC
       ========================================================================== */

    // 1. Toàn màn hình
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

    // 2. Nút Tung hoa
    const burstBtn = document.getElementById('burstPetalsBtn');
    if (burstBtn) {
        burstBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const rect = card.getBoundingClientRect();
            // Bung tỏa từ 4 góc và trung tâm thiệp
            createFlowerBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
            createFlowerBurst(rect.left + 50, rect.top + 50, 20);
            createFlowerBurst(rect.right - 50, rect.top + 50, 20);
            playChimeSound();
        });
    }

    // 3. Nút Sửa lời chúc
    const editBtn = document.getElementById('editWishBtn');
    const wishText = document.getElementById('wishText');
    let isEditing = false;

    if (editBtn && wishText) {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isEditing = !isEditing;
            if (isEditing) {
                wishText.contentEditable = 'true';
                wishText.focus();
                editBtn.innerHTML = '<i class="fas fa-check"></i><span>Lưu xong</span>';
                editBtn.style.background = 'rgba(76, 175, 80, 0.4)';
                showToast('Bạn có thể gõ hoặc dán lời chúc của riêng mình!');
            } else {
                wishText.contentEditable = 'false';
                editBtn.innerHTML = '<i class="fas fa-pen-fancy"></i><span>Sửa lời chúc</span>';
                editBtn.style.background = '';
                showToast('✨ Đã lưu lời chúc của bạn!');
            }
        });
    }

    // 4. Nút Sao chép lời chúc
    const copyBtn = document.getElementById('copyWishBtn');
    if (copyBtn && wishText) {
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const textToCopy = wishText.innerText.trim();
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Đã sao chép lời chúc vào khay nhớ tạm! 💐');
            }).catch(() => {
                showToast('Không thể tự động sao chép');
            });
        });
    }

    // Hàm hiển thị Toast thông báo
    function showToast(msg) {
        const toast = document.getElementById('toastNotification');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2800);
    }

    // Tự động bung nhẹ 1 chùm hoa lúc vào trang
    setTimeout(() => {
        createFlowerBurst(width / 2, height / 2 - 80, 35);
    }, 600);

})();
