let canvas, ctx;
let deltaData = []; // 각 프레임 처리 시간 저장
let maxSamples = 500; // 캔버스에 표시할 최대 샘플 수 (기본 값)

// 그래프 초기화
export function initPerfGraph(canvasId = 'perfCanvas') {
    canvas = document.getElementById(canvasId);
    ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    maxSamples = canvas.width;
}

// 프레임 하나의 처리시간 기록 & 그래프 다시 그리기
export function recordFrameDelta(delta, mode = 'worker') {
    deltaData.push(delta);
    // 오래된 샘플 제거 (maxSamples 유지)
    if (deltaData.length > maxSamples) deltaData.shift();

    drawPerfGraphWithAverage(mode);
}

// 그래프 그리기, 평균선 표시
function drawPerfGraphWithAverage(mode = 'worker') {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const lineColor = mode === 'worker' ? '#38bdf8' : '#fb7185';

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let y = 0; y <= canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // 1. 선 그래프 (각 프레임 처리 시간)
    ctx.beginPath();
    for (let i = 0; i < deltaData.length; i++) {
        const val = deltaData[i];
        const y = canvas.height - Math.min(val, canvas.height);
        const x = i;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. 평균 처리 시간 선
    const avg = deltaData.reduce((a, b) => a + b, 0) / deltaData.length;
    const avgY = canvas.height - avg;
    ctx.beginPath();
    ctx.moveTo(0, avgY);
    ctx.lineTo(canvas.width, avgY);
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. 텍스트 표시
    // ctx.fillStyle = '#374151';
    // ctx.font = '12px sans-serif';
    // ctx.fillText(`평균 처리 시간: ${avg.toFixed(1)}ms`, 8, 16);

    const avgText = document.getElementById('avgTimeText');
    if (avgText) {
        avgText.textContent = `평균 처리 시간: ${avg.toFixed(1)}ms`;
    }
}
