export function applyGaussianBlur(imageData) {
    const { width, height, data } = imageData;

    const radius = 5;
    const sigma = radius / 2;
    const kernel = generateGaussianKernel(radius, sigma);

    const src = new Uint8ClampedArray(data);
    const temp = new Float32Array(data.length);
    const dst = new Uint8ClampedArray(data.length);

    convolve1DHorizontal(src, temp, width, height, kernel, radius);
    convolve1DVertical(temp, dst, width, height, kernel, radius);

    for (let i = 0; i < data.length; i++) {
        data[i] = dst[i];
    }
}

function generateGaussianKernel(radius, sigma) {
    const size = radius * 2 + 1;
    const kernel = new Float32Array(size);
    let sum = 0;

    for (let i = 0; i < size; i++) {
        const x = i - radius;
        const val = Math.exp(-(x * x) / (2 * sigma * sigma));
        kernel[i] = val;
        sum += val;
    }

    for (let i = 0; i < size; i++) {
        kernel[i] /= sum;
    }

    return kernel;
}

function convolve1DHorizontal(src, dst, width, height, kernel, radius) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;

            for (let k = -radius; k <= radius; k++) {
                const px = Math.min(width - 1, Math.max(0, x + k));
                const i = (y * width + px) * 4;
                const weight = kernel[k + radius];
                r += src[i] * weight;
                g += src[i + 1] * weight;
                b += src[i + 2] * weight;
                a += src[i + 3] * weight;
            }

            const idx = (y * width + x) * 4;
            dst[idx] = r;
            dst[idx + 1] = g;
            dst[idx + 2] = b;
            dst[idx + 3] = a;
        }
    }
}

function convolve1DVertical(src, dst, width, height, kernel, radius) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;

            for (let k = -radius; k <= radius; k++) {
                const py = Math.min(height - 1, Math.max(0, y + k));
                const i = (py * width + x) * 4;
                const weight = kernel[k + radius];
                r += src[i] * weight;
                g += src[i + 1] * weight;
                b += src[i + 2] * weight;
                a += src[i + 3] * weight;
            }

            const idx = (y * width + x) * 4;
            dst[idx] = r;
            dst[idx + 1] = g;
            dst[idx + 2] = b;
            dst[idx + 3] = a;
        }
    }
}
