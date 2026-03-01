const fs = require('fs');

function getJpegDimensions(path) {
    const buffer = fs.readFileSync(path);
    let i = 2;
    while (i < buffer.length) {
        if (buffer[i] === 0xff && buffer[i + 1] === 0xc0) {
            const h = buffer.readUInt16BE(i + 5);
            const w = buffer.readUInt16BE(i + 7);
            return { w, h };
        }
        i++;
    }
    return null;
}

const dims = getJpegDimensions(process.argv[2]);
console.log(JSON.stringify(dims));
