const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../public/audio/examples');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const words = {
  'ma1': '妈', 'ma2': '麻', 'ma3': '马', 'ma4': '骂',
  'yi1': '一', 'yi2': '移', 'yi3': '椅', 'yi4': '义'
};

async function download() {
  for (const [name, char] of Object.entries(words)) {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=' + encodeURIComponent(char);
    try {
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(path.join(dir, name + '.mp3'), Buffer.from(buffer));
      console.log(`✅ Downloaded ${name}.mp3 (${char})`);
    } catch (err) {
      console.error(`❌ Failed to download ${name}:`, err.message);
    }
  }
}

download();
