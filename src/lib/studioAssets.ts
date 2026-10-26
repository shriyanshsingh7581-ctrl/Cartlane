/**
 * Bespoke Studio SVG Product & Campaign Photography Assets
 * Provides immediate, zero-latency, zero-broken-image studio visual assets
 * while allowing seamless live replacement via Cloudinary uploads from the Admin Panel.
 */

function toSvgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const STUDIO_ASSETS = {
  heroCampaign: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#141413"/>
          <stop offset="55%" stop-color="#1F1D1A"/>
          <stop offset="100%" stop-color="#2C251E"/>
        </linearGradient>
        <radialGradient id="glow" cx="72%" cy="48%" r="48%">
          <stop offset="0%" stop-color="#C89D66" stop-opacity="0.32"/>
          <stop offset="60%" stop-color="#8C6239" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#141413" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="brass" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#9A7442"/>
          <stop offset="50%" stop-color="#E5C595"/>
          <stop offset="100%" stop-color="#8A6434"/>
        </linearGradient>
        <linearGradient id="amber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8F4B1A"/>
          <stop offset="50%" stop-color="#5E2D0C"/>
          <stop offset="100%" stop-color="#2E1404"/>
        </linearGradient>
        <linearGradient id="stone" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#292724"/>
          <stop offset="50%" stop-color="#3A3631"/>
          <stop offset="100%" stop-color="#1F1D1B"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="675" fill="url(#bg)"/>
      <rect width="1200" height="675" fill="url(#glow)"/>
      <!-- Architectural Travertine Plinth -->
      <polygon points="480,520 1080,520 1140,610 420,610" fill="url(#stone)" stroke="#4A433B" stroke-width="1"/>
      <rect x="420" y="610" width="720" height="65" fill="#181715"/>
      <!-- Centerpiece: Noir Eau De Parfum Flacon -->
      <g transform="translate(710, 175)">
        <rect x="66" y="0" width="48" height="36" rx="3" fill="url(#brass)"/>
        <rect x="76" y="36" width="28" height="14" fill="#6E502A"/>
        <rect x="0" y="50" width="180" height="295" rx="8" fill="#181817" stroke="#4D463E" stroke-width="1.5"/>
        <rect x="10" y="60" width="14" height="275" rx="4" fill="#FFFFFF" fill-opacity="0.06"/>
        <rect x="28" y="115" width="124" height="145" fill="#FAF8F5" stroke="url(#brass)" stroke-width="1.5"/>
        <text x="90" y="155" text-anchor="middle" font-family="Georgia, serif" font-size="11" letter-spacing="3" fill="#8C6239">ATELIER VANGUARD</text>
        <text x="90" y="186" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" letter-spacing="2" fill="#141413">NOIR ABSOLU</text>
        <line x1="55" y1="200" x2="125" y2="200" stroke="#8C6239" stroke-width="0.8"/>
        <text x="90" y="220" text-anchor="middle" font-family="sans-serif" font-size="9" letter-spacing="2" fill="#57534E">EAU DE PARFUM</text>
        <text x="90" y="242" text-anchor="middle" font-family="monospace" font-size="9" fill="#78716C">100 ML · 3.4 FL.OZ.</text>
      </g>
      <!-- Left: Moroccan Argan Beard Elixir Dropper -->
      <g transform="translate(555, 265)">
        <path d="M42,0 C42,-14 68,-14 68,0 L68,38 L42,38 Z" fill="#1E1D1B"/>
        <rect x="34" y="38" width="42" height="20" rx="2" fill="url(#brass)"/>
        <path d="M34,58 L15,88 L15,255 C15,261 20,265 26,265 L84,265 C90,265 95,261 95,255 L95,88 L76,58 Z" fill="url(#amber)" stroke="#A4642E" stroke-width="1"/>
        <rect x="23" y="120" width="64" height="105" fill="#141413" stroke="url(#brass)" stroke-width="1"/>
        <text x="55" y="152" text-anchor="middle" font-family="Georgia, serif" font-size="9" letter-spacing="2" fill="#E5C595">VANGUARD</text>
        <text x="55" y="174" text-anchor="middle" font-family="Georgia, serif" font-size="12" font-weight="bold" fill="#FAF8F5">ARGAN OUD</text>
        <text x="55" y="192" text-anchor="middle" font-family="sans-serif" font-size="7" letter-spacing="1.5" fill="#A8A29E">BEARD ELIXIR</text>
        <text x="55" y="212" text-anchor="middle" font-family="monospace" font-size="7" fill="#D6D3D1">30 ML</text>
      </g>
      <!-- Right: Activated Bamboo Charcoal Cleanser Tube -->
      <g transform="translate(925, 240)">
        <polygon points="10,0 120,0 106,225 24,225" fill="#21201E" stroke="#3F3B36" stroke-width="1.2"/>
        <rect x="10" y="0" width="110" height="10" fill="url(#brass)"/>
        <rect x="35" y="225" width="60" height="45" rx="4" fill="#141413" stroke="#3F3B36" stroke-width="1"/>
        <text x="65" y="68" text-anchor="middle" font-family="Georgia, serif" font-size="9" letter-spacing="2.5" fill="#D4AF7A">VANGUARD</text>
        <text x="65" y="98" text-anchor="middle" font-family="Georgia, serif" font-size="15" font-weight="bold" letter-spacing="1.5" fill="#FAF8F5">CHARCOAL</text>
        <text x="65" y="116" text-anchor="middle" font-family="Georgia, serif" font-size="11" letter-spacing="1" fill="#E7E5E4">&amp; YLANG-YLANG</text>
        <line x1="42" y1="132" x2="88" y2="132" stroke="#8C6239" stroke-width="0.8"/>
        <text x="65" y="152" text-anchor="middle" font-family="sans-serif" font-size="7.5" letter-spacing="2" fill="#A8A29E">DAILY DETOX WASH</text>
        <text x="65" y="195" text-anchor="middle" font-family="monospace" font-size="8" fill="#78716C">SLS &amp; PARABEN FREE</text>
      </g>
    </svg>
  `),

  noirParfum: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F5F2EB"/>
          <stop offset="100%" stop-color="#E6DFD3"/>
        </linearGradient>
        <linearGradient id="brass1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#9A7442"/>
          <stop offset="50%" stop-color="#E5C595"/>
          <stop offset="100%" stop-color="#8A6434"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg1)"/>
      <ellipse cx="400" cy="500" rx="220" ry="26" fill="#D5CBB8"/>
      <polygon points="210,460 590,460 620,505 180,505" fill="#DED6C6" stroke="#C7B9A3" stroke-width="1"/>
      <g transform="translate(305, 115)">
        <rect x="68" y="0" width="54" height="40" rx="3" fill="url(#brass1)"/>
        <rect x="80" y="40" width="30" height="15" fill="#6E502A"/>
        <rect x="0" y="55" width="190" height="310" rx="10" fill="#161615" stroke="#3A3632" stroke-width="2"/>
        <rect x="14" y="68" width="14" height="284" rx="4" fill="#FFFFFF" fill-opacity="0.08"/>
        <rect x="28" y="122" width="134" height="158" fill="#FAF8F5" stroke="url(#brass1)" stroke-width="1.5"/>
        <text x="95" y="160" text-anchor="middle" font-family="Georgia, serif" font-size="10" letter-spacing="3" fill="#8C6239">ATELIER VANGUARD</text>
        <text x="95" y="194" text-anchor="middle" font-family="Georgia, serif" font-size="24" font-weight="bold" letter-spacing="2" fill="#141413">NOIR</text>
        <text x="95" y="216" text-anchor="middle" font-family="Georgia, serif" font-size="13" letter-spacing="3" fill="#292524">ABSOLU</text>
        <line x1="55" y1="230" x2="135" y2="230" stroke="#8C6239" stroke-width="1"/>
        <text x="95" y="250" text-anchor="middle" font-family="sans-serif" font-size="9" letter-spacing="2" fill="#57534E">EAU DE PARFUM · 100 ML</text>
      </g>
    </svg>
  `),

  blancParfum: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F4F4F2"/>
          <stop offset="100%" stop-color="#E2E0DC"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg2)"/>
      <ellipse cx="400" cy="500" rx="210" ry="24" fill="#CFCBC4"/>
      <g transform="translate(305, 115)">
        <rect x="68" y="0" width="54" height="40" rx="3" fill="#27272A"/>
        <rect x="80" y="40" width="30" height="15" fill="#52525B"/>
        <rect x="0" y="55" width="190" height="310" rx="10" fill="#FAF8F5" stroke="#D6D3D1" stroke-width="2"/>
        <rect x="28" y="122" width="134" height="158" fill="#18181B"/>
        <text x="95" y="160" text-anchor="middle" font-family="Georgia, serif" font-size="10" letter-spacing="3" fill="#A1A1AA">ATELIER VANGUARD</text>
        <text x="95" y="196" text-anchor="middle" font-family="Georgia, serif" font-size="24" font-weight="bold" letter-spacing="2.5" fill="#FAF8F5">BLANC</text>
        <text x="95" y="218" text-anchor="middle" font-family="Georgia, serif" font-size="12" letter-spacing="3" fill="#D4AF7A">VÉTIVER</text>
        <line x1="55" y1="232" x2="135" y2="232" stroke="#71717A" stroke-width="1"/>
        <text x="95" y="252" text-anchor="middle" font-family="sans-serif" font-size="9" letter-spacing="2" fill="#D4D4D8">EAU DE TOILETTE · 100 ML</text>
      </g>
    </svg>
  `),

  charcoalFaceWash: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F5F3EF"/>
          <stop offset="100%" stop-color="#E5E0D8"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg3)"/>
      <ellipse cx="400" cy="505" rx="190" ry="22" fill="#D0C9BE"/>
      <g transform="translate(315, 105)">
        <polygon points="8,0 162,0 142,315 28,315" fill="#1F1E1C" stroke="#3F3B36" stroke-width="1.5"/>
        <rect x="8" y="0" width="154" height="14" fill="#B58E58"/>
        <rect x="44" y="315" width="82" height="62" rx="6" fill="#141413"/>
        <text x="85" y="92" text-anchor="middle" font-family="Georgia, serif" font-size="11" letter-spacing="3" fill="#D4AF7A">ATELIER VANGUARD</text>
        <text x="85" y="135" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" letter-spacing="2" fill="#FAF8F5">ACTIVATED</text>
        <text x="85" y="162" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" letter-spacing="2" fill="#FAF8F5">CHARCOAL</text>
        <text x="85" y="188" text-anchor="middle" font-family="sans-serif" font-size="10" letter-spacing="2.5" fill="#D4AF7A">YLANG-YLANG &amp; ARGAN</text>
        <line x1="48" y1="208" x2="122" y2="208" stroke="#8C6239" stroke-width="1"/>
        <text x="85" y="232" text-anchor="middle" font-family="sans-serif" font-size="10" letter-spacing="2" fill="#D6D3D1">ANTI-POLLUTION FACE WASH</text>
        <text x="85" y="275" text-anchor="middle" font-family="monospace" font-size="10" fill="#A8A29E">100 G · SLS &amp; PARABEN FREE</text>
      </g>
    </svg>
  `),

  beardElixir: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <defs>
        <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F7F3EC"/>
          <stop offset="100%" stop-color="#E8DEC9"/>
        </linearGradient>
        <linearGradient id="amber4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#9A521D"/>
          <stop offset="55%" stop-color="#63300D"/>
          <stop offset="100%" stop-color="#331604"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg4)"/>
      <ellipse cx="400" cy="505" rx="185" ry="22" fill="#D4C6AE"/>
      <g transform="translate(320, 115)">
        <path d="M60,0 C60,-22 100,-22 100,0 L100,56 L60,56 Z" fill="#181817"/>
        <rect x="48" y="56" width="64" height="28" rx="3" fill="#C59B61"/>
        <path d="M48,84 L18,128 L18,358 C18,368 26,375 36,375 L124,375 C134,375 142,368 142,358 L142,128 L112,84 Z" fill="url(#amber4)" stroke="#B5723B" stroke-width="1.5"/>
        <rect x="30" y="165" width="100" height="155" fill="#141413" stroke="#C59B61" stroke-width="1.2"/>
        <text x="80" y="205" text-anchor="middle" font-family="Georgia, serif" font-size="10" letter-spacing="2.5" fill="#D4AF7A">VANGUARD</text>
        <text x="80" y="236" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-weight="bold" letter-spacing="1.5" fill="#FAF8F5">ALMOND &amp;</text>
        <text x="80" y="258" text-anchor="middle" font-family="Georgia, serif" font-size="18" font-weight="bold" letter-spacing="1.5" fill="#FAF8F5">THYME</text>
        <text x="80" y="282" text-anchor="middle" font-family="sans-serif" font-size="9" letter-spacing="2" fill="#D4AF7A">BEARD GROWTH OIL</text>
        <text x="80" y="305" text-anchor="middle" font-family="monospace" font-size="9" fill="#A8A29E">30 ML · 100% NATURAL OILS</text>
      </g>
    </svg>
  `),

  vitaminCSerum: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#F6F3EE"/>
      <ellipse cx="400" cy="505" rx="180" ry="20" fill="#D8CFC2"/>
      <g transform="translate(320, 120)">
        <path d="M62,0 C62,-20 98,-20 98,0 L98,52 L62,52 Z" fill="#FAF8F5" stroke="#D6D3D1" stroke-width="1.5"/>
        <rect x="48" y="52" width="64" height="26" rx="3" fill="#C59B61"/>
        <path d="M48,78 L20,122 L20,350 C20,360 28,368 38,368 L122,368 C132,368 140,360 140,350 L140,122 L112,78 Z" fill="#B45309" stroke="#D97706" stroke-width="1.5"/>
        <rect x="30" y="158" width="100" height="150" fill="#FAF8F5" stroke="#C59B61" stroke-width="1.2"/>
        <text x="80" y="196" text-anchor="middle" font-family="Georgia, serif" font-size="10" letter-spacing="2.5" fill="#8C6239">VANGUARD</text>
        <text x="80" y="228" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#141413">20% VIT C</text>
        <text x="80" y="250" text-anchor="middle" font-family="sans-serif" font-size="9" letter-spacing="1.5" fill="#57534E">+ HYALURONIC ACID</text>
        <line x1="48" y1="265" x2="112" y2="265" stroke="#C59B61" stroke-width="1"/>
        <text x="80" y="286" text-anchor="middle" font-family="monospace" font-size="9" fill="#78716C">BRIGHTENING FACE SERUM</text>
      </g>
    </svg>
  `),

  hairGrowthKit: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#F2EFE9"/>
      <ellipse cx="400" cy="505" rx="230" ry="24" fill="#D5CCB8"/>
      <g transform="translate(275, 110)">
        <rect x="65" y="0" width="46" height="28" rx="3" fill="#181817"/>
        <rect x="48" y="28" width="80" height="24" rx="2" fill="#B58E58"/>
        <rect x="10" y="52" width="156" height="330" rx="16" fill="#1C1B19" stroke="#3F3B36" stroke-width="1.5"/>
        <rect x="28" y="118" width="120" height="175" fill="#FAF8F5" stroke="#B58E58" stroke-width="1.2"/>
        <text x="88" y="156" text-anchor="middle" font-family="Georgia, serif" font-size="10" letter-spacing="2.5" fill="#8C6239">ATELIER VANGUARD</text>
        <text x="88" y="190" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#141413">BIOTIN &amp;</text>
        <text x="88" y="214" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#141413">BHRINGRAJ</text>
        <text x="88" y="242" text-anchor="middle" font-family="sans-serif" font-size="9" letter-spacing="2" fill="#57534E">ANTI-HAIR FALL SHAMPOO</text>
        <text x="88" y="272" text-anchor="middle" font-family="monospace" font-size="9" fill="#78716C">200 ML · SULPHATE FREE</text>
      </g>
      <g transform="translate(455, 210)">
        <rect x="24" y="0" width="32" height="34" rx="2" fill="#B58E58"/>
        <rect x="0" y="34" width="80" height="238" rx="8" fill="#2A2622" stroke="#B58E58" stroke-width="1"/>
        <text x="40" y="128" text-anchor="middle" font-family="Georgia, serif" font-size="12" font-weight="bold" fill="#FAF8F5">REJUVENATE</text>
        <text x="40" y="148" text-anchor="middle" font-family="sans-serif" font-size="8" letter-spacing="1.5" fill="#D4AF7A">SCALP TONIC</text>
      </g>
    </svg>
  `),

  shaveSafetyRazor: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#F3F1EC"/>
      <ellipse cx="400" cy="505" rx="220" ry="22" fill="#D1CBC0"/>
      <!-- Safety Razor & Shave Cream -->
      <g transform="translate(240, 175)">
        <rect x="0" y="110" width="190" height="190" rx="12" fill="#181817" stroke="#B58E58" stroke-width="1.5"/>
        <rect x="12" y="88" width="166" height="26" rx="4" fill="#B58E58"/>
        <text x="95" y="172" text-anchor="middle" font-family="Georgia, serif" font-size="10" letter-spacing="2.5" fill="#D4AF7A">ATELIER VANGUARD</text>
        <text x="95" y="204" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#FAF8F5">SANDALWOOD</text>
        <text x="95" y="228" text-anchor="middle" font-family="sans-serif" font-size="9" letter-spacing="2" fill="#D6D3D1">ARTISAN SHAVE LATHER</text>
        <text x="95" y="262" text-anchor="middle" font-family="monospace" font-size="9" fill="#A8A29E">100 G · TEA TREE &amp; ALOE</text>
      </g>
      <g transform="translate(475, 115)">
        <rect x="0" y="0" width="120" height="32" rx="6" fill="#D4D4D8" stroke="#71717A" stroke-width="1.5"/>
        <rect x="12" y="32" width="96" height="12" fill="#A1A1AA"/>
        <rect x="48" y="44" width="24" height="310" rx="6" fill="#27272A" stroke="#B58E58" stroke-width="1.5"/>
        <rect x="44" y="330" width="32" height="26" rx="4" fill="#B58E58"/>
      </g>
    </svg>
  `),

  sovereignGiftBox: toSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
      <rect width="800" height="600" fill="#EFECE4"/>
      <ellipse cx="400" cy="515" rx="280" ry="26" fill="#CFC6B4"/>
      <g transform="translate(150, 120)">
        <rect x="0" y="0" width="500" height="370" rx="8" fill="#161615" stroke="#B58E58" stroke-width="2.5"/>
        <rect x="18" y="18" width="464" height="334" rx="4" fill="#211F1C" stroke="#3F3B36" stroke-width="1"/>
        <!-- 4 Recessed Slots inside Luxury Coffret -->
        <rect x="45" y="55" width="95" height="260" rx="6" fill="#141413" stroke="#B58E58" stroke-width="1"/>
        <text x="92" y="180" text-anchor="middle" font-family="Georgia, serif" font-size="12" font-weight="bold" fill="#FAF8F5">NOIR EDP</text>
        <text x="92" y="200" text-anchor="middle" font-family="monospace" font-size="8" fill="#D4AF7A">100 ML</text>

        <rect x="160" y="55" width="85" height="260" rx="6" fill="#141413" stroke="#B58E58" stroke-width="1"/>
        <text x="202" y="180" text-anchor="middle" font-family="Georgia, serif" font-size="11" font-weight="bold" fill="#FAF8F5">CHARCOAL</text>
        <text x="202" y="200" text-anchor="middle" font-family="monospace" font-size="8" fill="#D4AF7A">FACE WASH</text>

        <rect x="265" y="55" width="85" height="260" rx="6" fill="#141413" stroke="#B58E58" stroke-width="1"/>
        <text x="307" y="180" text-anchor="middle" font-family="Georgia, serif" font-size="11" font-weight="bold" fill="#FAF8F5">ARGAN OIL</text>
        <text x="307" y="200" text-anchor="middle" font-family="monospace" font-size="8" fill="#D4AF7A">BEARD ELIXIR</text>

        <rect x="370" y="55" width="85" height="260" rx="6" fill="#141413" stroke="#B58E58" stroke-width="1"/>
        <text x="412" y="180" text-anchor="middle" font-family="Georgia, serif" font-size="11" font-weight="bold" fill="#FAF8F5">20% VIT C</text>
        <text x="412" y="200" text-anchor="middle" font-family="monospace" font-size="8" fill="#D4AF7A">SERUM</text>

        <rect x="145" y="318" width="210" height="28" rx="2" fill="#B58E58"/>
        <text x="250" y="336" text-anchor="middle" font-family="Georgia, serif" font-size="11" font-weight="bold" letter-spacing="2" fill="#141413">THE SOVEREIGN COFFRET</text>
      </g>
    </svg>
  `),
};
