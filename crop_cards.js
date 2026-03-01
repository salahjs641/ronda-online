const Jimp = require('jimp');
const path = require('path');

const SOURCE = "C:\\Users\\PABLO\\.gemini\\antigravity\\brain\\52630b0b-1c5f-4729-a360-4d51511f6731\\media__1772001771130.jpg";
const DEST_DIR = path.join(__dirname, 'public', 'assets', 'cards');

const SUITS = ['clubs', 'swords', 'coins', 'cups'];
const VALUES = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

const IMG_W = 1024;
const IMG_H = 610;
const COLS = 10;
const ROWS = 4;

const CARD_W = Math.floor(IMG_W / COLS); // ~102
const CARD_H = Math.floor(IMG_H / ROWS); // ~152

// Manual adjustment: the bottom row is a bit higher?
// Actually let's just use a loop and see.

async function crop() {
    const image = await Jimp.read(SOURCE);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const suit = SUITS[r];
            const val = VALUES[c];
            const x = c * CARD_W;
            const y = r * CARD_H;

            // Trim 2px off each side to avoid overlaps/gaps
            const cropX = x + 2;
            const cropY = y + 2;
            const cropW = CARD_W - 4;
            const cropH = CARD_H - 4;

            const filename = `${suit}_${val}.jpg`;
            const destPath = path.join(DEST_DIR, filename);

            await image.clone()
                .crop(cropX, cropY, cropW, cropH)
                .quality(80)
                .writeAsync(destPath);

            console.log(`Saved ${filename}`);
        }
    }
}

crop().catch(err => {
    console.error(err);
    process.exit(1);
});
