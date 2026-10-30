import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Crisp Free Fire Esports Gaming Shield Icon SVG (512x512)
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#180407"/>
      <stop offset="50%" stop-color="#08090d"/>
      <stop offset="100%" stop-color="#050608"/>
    </linearGradient>
    <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff2a3b"/>
      <stop offset="50%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#dc2626"/>
      <stop offset="60%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Background base -->
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)"/>
  <rect width="504" height="504" x="4" y="4" rx="106" fill="none" stroke="url(#shieldBorder)" stroke-width="4" stroke-opacity="0.6"/>

  <!-- Esports Shield Silhouette -->
  <path d="M 256 64 L 416 116 C 416 280 256 424 256 424 C 256 424 96 280 96 116 Z"
        fill="#0d0f18" stroke="url(#shieldBorder)" stroke-width="8" filter="url(#neonGlow)"/>

  <!-- Inner Crest -->
  <path d="M 256 94 L 386 136 C 386 268 256 384 256 384 C 256 384 126 268 126 136 Z"
        fill="#141724" stroke="#ff2a3b" stroke-width="3" stroke-dasharray="8 4" opacity="0.8"/>

  <!-- Crown on Top -->
  <path d="M 200 160 L 224 190 L 256 140 L 288 190 L 312 160 L 304 216 L 208 216 Z"
        fill="url(#goldGrad)" filter="url(#neonGlow)"/>
  <circle cx="256" cy="136" r="6" fill="#fef08a" />
  <circle cx="198" cy="156" r="5" fill="#f59e0b" />
  <circle cx="314" cy="156" r="5" fill="#f59e0b" />

  <!-- Flaming Swords / Wings -->
  <path d="M 256 220 C 276 250 310 270 340 260 C 316 286 280 292 256 330 C 232 292 196 286 172 260 C 202 270 236 250 256 220 Z"
        fill="url(#fireGrad)"/>

  <!-- MT Monogram -->
  <text x="256" y="328" font-family="'Chakra Petch', 'Rajdhani', sans-serif" font-weight="900" font-size="76"
        fill="#ffffff" text-anchor="middle" letter-spacing="4" filter="url(#neonGlow)">
    MT
  </text>

  <!-- Banner ribbon at bottom of shield -->
  <rect x="140" y="356" width="232" height="34" rx="8" fill="#dc2626" stroke="#fecaca" stroke-width="2"/>
  <text x="256" y="380" font-family="'Rajdhani', sans-serif" font-weight="800" font-size="20"
        fill="#ffffff" text-anchor="middle" letter-spacing="3">
    MONEY TOURNAMENT
  </text>
</svg>`;

// Maskable Icon SVG with 18% safe-zone margin around the central crest
const svgMaskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="mBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#180407"/>
      <stop offset="50%" stop-color="#08090d"/>
      <stop offset="100%" stop-color="#050608"/>
    </linearGradient>
    <linearGradient id="mShieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff2a3b"/>
      <stop offset="50%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
    <linearGradient id="mGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="mFire" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#dc2626"/>
      <stop offset="60%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
  </defs>

  <!-- Full bleed background for maskable circle/squircle crop -->
  <rect width="512" height="512" fill="url(#mBg)"/>

  <!-- Scaled content centered within 75% safe area (x: 64..448, y: 64..448) -->
  <g transform="translate(64, 64) scale(0.75)">
    <!-- Esports Shield Silhouette -->
    <path d="M 256 64 L 416 116 C 416 280 256 424 256 424 C 256 424 96 280 96 116 Z"
          fill="#0d0f18" stroke="url(#mShieldBorder)" stroke-width="12"/>

    <path d="M 256 94 L 386 136 C 386 268 256 384 256 384 C 256 384 126 268 126 136 Z"
          fill="#141724" stroke="#ff2a3b" stroke-width="4" opacity="0.8"/>

    <!-- Crown -->
    <path d="M 200 160 L 224 190 L 256 140 L 288 190 L 312 160 L 304 216 L 208 216 Z"
          fill="url(#mGold)"/>
    <circle cx="256" cy="136" r="8" fill="#fef08a" />

    <!-- Flame / Wings -->
    <path d="M 256 220 C 276 250 310 270 340 260 C 316 286 280 292 256 330 C 232 292 196 286 172 260 C 202 270 236 250 256 220 Z"
          fill="url(#mFire)"/>

    <!-- MT Monogram -->
    <text x="256" y="328" font-family="'Chakra Petch', sans-serif" font-weight="900" font-size="80"
          fill="#ffffff" text-anchor="middle" letter-spacing="4">
      MT
    </text>

    <!-- Banner -->
    <rect x="130" y="356" width="252" height="36" rx="8" fill="#dc2626"/>
    <text x="256" y="381" font-family="'Rajdhani', sans-serif" font-weight="800" font-size="22"
          fill="#ffffff" text-anchor="middle" letter-spacing="3">
      MONEY TOURNAMENT
    </text>
  </g>
</svg>`;

async function generate() {
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon, 'utf-8');

  const svgBuffer = Buffer.from(svgIcon);
  const maskableBuffer = Buffer.from(svgMaskable);

  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 512x512 Maskable
  await sharp(maskableBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Apple touch icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('PWA icons successfully generated in public/');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
