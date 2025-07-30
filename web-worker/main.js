import { applyGaussianBlur } from './gaussian.js';
import { startFPSMonitor } from './fps.js';
import { initPerfGraph, recordFrameDelta } from './perf-graph.js';

const video = document.getElementById('video');
const canvas = document.getElementById('outputCanvas');
const ctx = canvas.getContext('2d');
const toggleBtn = document.getElementById('toggleBtn');

const offCanvas = document.createElement('canvas');
const offCtx = offCanvas.getContext('2d');

let useWorker = true;
let worker = new Worker('./worker.js', { type: 'module' });

let isProcessing = false;
let latestFrame = null;

// FPS 시작
startFPSMonitor();

// 그래프 그리기 최초 한 번만 실행
initPerfGraph();

// 캔버스 크기 설정
video.addEventListener('loadeddata', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    offCanvas.width = video.videoWidth;
    offCanvas.height = video.videoHeight;
});

// 토글 버튼
toggleBtn.onclick = () => {
    useWorker = !useWorker;
    toggleBtn.textContent = useWorker ? '모드: Web Worker' : '모드: Main Thread';
    isProcessing = false;
    latestFrame = null;
};

// 프레임 처리 루프
video.addEventListener('play', () => {
    renderFrame();
});

// 프레임 렌더링 시작 전마다 측정
let lastRenderTime = performance.now();

function renderFrame() {
    if (video.paused || video.ended) return;

    // 성능 그래프 그리기
    const now = performance.now();
    const delta = now - lastRenderTime;
    lastRenderTime = now;

    recordFrameDelta(delta, useWorker ? 'worker' : 'main'); // 호출

    // 1. 현재 프레임 캡처
    offCtx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);
    const frame = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);

    // 2. 처리 방식 분기
    if (useWorker) {
        if (!isProcessing) {
            isProcessing = true;
            worker.postMessage({ imageData: frame }, [frame.data.buffer]);
        } else {
            latestFrame = frame; // 처리 중이면 최신 프레임만 저장
        }
    } else {
        applyGaussianBlur(frame); // 메인 스레드 처리
        ctx.putImageData(frame, 0, 0);
    }

    requestAnimationFrame(renderFrame);
}

// Worker 처리 결과 수신
worker.onmessage = (e) => {
    const imageData = e.data;
    ctx.putImageData(imageData, 0, 0);

    if (latestFrame) {
        worker.postMessage({ imageData: latestFrame }, [latestFrame.data.buffer]);
        latestFrame = null;
    } else {
        isProcessing = false;
    }
};
