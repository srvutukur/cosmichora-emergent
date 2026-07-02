import React from "react";

// Sanskrit-inspired zodiac wheel: 12 signs on outer ring, sacred geometry inside.
// Purely decorative SVG that echoes a Vedic Rasi chart / zodiac wheel.
export default function ZodiacWheel({ size = 520, spinning = true, className = "" }) {
  const signs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 520 520"
      className={`${spinning ? "rotate-slow" : ""} ${className}`}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id="zw-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF9933" stopOpacity="0.25" />
          <stop offset="55%" stopColor="#4B2B72" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#0E0B24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="zw-gold" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#E6C87A" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>

      {/* Aurora glow behind */}
      <circle cx="260" cy="260" r="260" fill="url(#zw-glow)" />

      {/* Outer decorative ring */}
      <circle cx="260" cy="260" r="248" fill="none" stroke="url(#zw-gold)" strokeWidth="0.8" opacity="0.85" />
      <circle cx="260" cy="260" r="240" fill="none" stroke="#D4AF37" strokeWidth="0.4" opacity="0.5" />

      {/* Zodiac ring — 12 divisions */}
      <circle cx="260" cy="260" r="220" fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.7" />
      <circle cx="260" cy="260" r="190" fill="none" stroke="#D4AF37" strokeWidth="0.4" opacity="0.5" />

      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x1 = 260 + 190 * Math.cos(angle);
        const y1 = 260 + 190 * Math.sin(angle);
        const x2 = 260 + 220 * Math.cos(angle);
        const y2 = 260 + 220 * Math.sin(angle);
        const tx = 260 + 205 * Math.cos(angle + Math.PI / 12);
        const ty = 260 + 205 * Math.sin(angle + Math.PI / 12);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D4AF37" strokeWidth="0.6" opacity="0.7" />
            <text
              x={tx}
              y={ty}
              fill="#E6C87A"
              fontSize="16"
              textAnchor="middle"
              dominantBaseline="middle"
              opacity="0.85"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {signs[i]}
            </text>
          </g>
        );
      })}

      {/* Inner sacred hexagram (Star of David / Shatkona) */}
      <g stroke="#D4AF37" strokeWidth="0.7" fill="none" opacity="0.7">
        <polygon points="260,90 402,335 118,335" />
        <polygon points="260,430 118,185 402,185" />
      </g>

      {/* Concentric inner circles */}
      <circle cx="260" cy="260" r="150" fill="none" stroke="#FF9933" strokeWidth="0.4" opacity="0.45" />
      <circle cx="260" cy="260" r="110" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.6" />
      <circle cx="260" cy="260" r="70"  fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.7" />

      {/* Center bindu */}
      <circle cx="260" cy="260" r="6" fill="#FF9933" opacity="0.9" />
      <circle cx="260" cy="260" r="14" fill="none" stroke="#FF9933" strokeWidth="0.5" opacity="0.6" />

      {/* Twinkling stars scattered inside */}
      {[
        [180, 200], [340, 210], [200, 340], [330, 340], [260, 155], [260, 375],
        [155, 260], [365, 260], [220, 240], [300, 280],
      ].map(([cx, cy], i) => (
        <circle
          key={`s${i}`}
          cx={cx}
          cy={cy}
          r={1.4 + (i % 3) * 0.4}
          fill="#F5E9D3"
          opacity="0.85"
        >
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur={`${2 + (i % 4)}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}
