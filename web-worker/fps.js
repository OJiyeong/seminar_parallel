export function startFPSMonitor() {
    const fpsText = document.getElementById('fpsText');
    if (!fpsText) return; // 해당 요소가 없으면 종료

    let lastTime = performance.now();
    let frames = 0;

    function update() {
        const now = performance.now();
        frames++;

        if (now - lastTime >= 1000) {
            fpsText.textContent = `FPS: ${frames}`;
            frames = 0;
            lastTime = now;
        }

        requestAnimationFrame(update);
    }

    update();
}
