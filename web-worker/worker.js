import { applyGaussianBlur } from './gaussian.js';

self.onmessage = function (e) {
    const { imageData } = e.data;
    applyGaussianBlur(imageData);
    self.postMessage(imageData, [imageData.data.buffer]);
};
