let canvas, ctx;
let deltaData = []; // 각 프레임 처리 시간 저장
let maxSamples = 500; // 캔버스에 표시할 최대 샘플 수 (기본 값)
let processedFrameCount = 0; // 처리된 프레임 수 카운트

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
    processedFrameCount++;

    // 오래된 샘플 제거 (maxSamples 유지)
    if (deltaData.length > maxSamples) deltaData.shift();

    drawPerfGraphWithAverage(mode);
    updatePerformanceIndicators();
}

// 그래프 그리기, 평균선 표시
function drawPerfGraphWithAverage(mode = 'worker') {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 격자 그리기
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let y = 0; y <= canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // 세로 격자도 추가
    for (let x = 0; x <= canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // 1. 선 그래프 (각 프레임 처리 시간)
    const lineColor = mode === 'worker' ? '#5271ff' : '#ff6b6b';

    ctx.beginPath();
    for (let i = 0; i < deltaData.length; i++) {
        const val = deltaData[i];
        const y = canvas.height - Math.min(val * 2, canvas.height); // 스케일 조정
        const x = i * (canvas.width / maxSamples);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. 평균 처리 시간 선
    if (deltaData.length > 0) {
        const avg = deltaData.reduce((a, b) => a + b, 0) / deltaData.length;
        const avgY = canvas.height - avg * 2; // 스케일 조정
        ctx.beginPath();
        ctx.moveTo(0, avgY);
        ctx.lineTo(canvas.width, avgY);
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// 성능 지표 업데이트
function updatePerformanceIndicators() {
    if (deltaData.length === 0) return;

    const avg = deltaData.reduce((a, b) => a + b, 0) / deltaData.length;

    const avgTimeElement = document.getElementById('avgTimeValue');
    const processedFramesElement = document.getElementById('processedFrames');

    if (avgTimeElement) {
        avgTimeElement.textContent = avg.toFixed(1);
    }

    if (processedFramesElement) {
        processedFramesElement.textContent = processedFrameCount.toString();
    }
}