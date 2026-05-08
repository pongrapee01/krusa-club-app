/**
 * สปินเนอร์ — จรวดพุ่งขึ้น (SVG + เปลวไฟ)
 * ปรับจังหวะ/สี: `index.css` (edtech-rocket-*, edtech-loader-float)
 */
export function EdTechRocketSpinner() {
  return (
    <div className="edtech-rocket-scene flex items-center justify-center" aria-hidden>
      <svg
        className="edtech-rocket-svg h-[7.5rem] w-[5.5rem] sm:h-32 sm:w-24"
        viewBox="0 0 80 118"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse
          cx="40"
          cy="108"
          rx="22"
          ry="4"
          className="fill-slate-950/40 edtech-rocket-shadow"
        />
        <g className="edtech-rocket-ship">
          {/* หัวจรวด */}
          <path
            d="M40 6 C48 6 54 14 52 22 L40 28 L28 22 C26 14 32 6 40 6Z"
            className="fill-slate-200 stroke-slate-300/50"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />
          <path
            d="M40 10 C45 10 49 15 48 20 L40 24 L32 20 C31 15 35 10 40 10Z"
            className="fill-orange-400/35"
          />
          {/* ลำตัว */}
          <path
            d="M28 26 h24 a4 4 0 0 1 4 4 v38 a4 4 0 0 1 -4 4 H28 a4 4 0 0 1 -4 -4 V30 a4 4 0 0 1 4 -4Z"
            className="fill-indigo-100 stroke-indigo-300/40"
            strokeWidth="0.75"
          />
          <path
            d="M30 32 h20 v34 H30 Z"
            className="fill-indigo-200/90"
          />
          {/* หน้าต่าง */}
          <circle cx="40" cy="46" r="9" className="fill-indigo-900 stroke-indigo-950/60" strokeWidth="0.75" />
          <circle cx="40" cy="46" r="6" className="fill-sky-400/90" />
          <circle cx="37" cy="43" r="2" className="fill-white/70" />
          {/* แถบ */}
          <rect x="27" y="58" width="26" height="5" rx="1.5" className="fill-orange-500/85" />
          {/* ปีก */}
          <path
            d="M24 64 L6 92 L24 78 Z"
            className="fill-indigo-800 stroke-indigo-950/40"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          <path
            d="M56 64 L74 92 L56 78 Z"
            className="fill-indigo-800 stroke-indigo-950/40"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          {/* หัวเทียน */}
          <path
            d="M30 72 h20 v10 a2 2 0 0 1 -2 2 H32 a2 2 0 0 1 -2 -2 V72Z"
            className="fill-slate-600 stroke-slate-700/50"
            strokeWidth="0.5"
          />
        </g>
        <g className="edtech-rocket-flame">
          <path
            d="M40 84 Q28 98 32 112 Q40 104 40 112 Q40 104 48 112 Q52 98 40 84Z"
            className="fill-orange-500/75"
          />
          <path
            d="M40 86 Q30 98 34 108 Q40 102 40 108 Q40 102 46 108 Q50 98 40 86Z"
            className="fill-amber-300/95"
          />
          <path
            d="M40 88 Q34 98 38 104 Q40 100 40 104 Q40 100 42 104 Q46 98 40 88Z"
            className="fill-yellow-100/95"
          />
        </g>
      </svg>
    </div>
  )
}
