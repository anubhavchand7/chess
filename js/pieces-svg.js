// Inline SVG definitions for high-definition, offline chess pieces
const CHESS_PIECE_SVGS = {
  // White Pieces
  wP: `<svg viewBox="0 0 45 45" class="chess-svg">
    <path d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z" style="fill:#ffffff;stroke:#212529;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;"/>
  </svg>`,
  wR: `<svg viewBox="0 0 45 45" class="chess-svg">
    <g style="fill:#ffffff;fill-rule:evenodd;stroke:#212529;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;">
      <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
      <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" />
      <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
      <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
      <path d="M 13,17 L 14,32 L 31,32 L 32,17 L 13,17 z" />
      <path d="M 14,29.5 L 31,29.5" style="fill:none;stroke:#212529;stroke-linejoin:miter;" />
      <path d="M 14,16.5 L 31,16.5" style="fill:none;stroke:#212529;stroke-linejoin:miter;" />
      <path d="M 11,14 L 34,14" style="fill:none;stroke:#212529;stroke-linejoin:miter;" />
    </g>
  </svg>`,
  wN: `<svg viewBox="0 0 45 45" class="chess-svg">
    <g style="fill:none;stroke:#212529;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;">
      <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" style="fill:#ffffff;stroke:#212529;"/>
      <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.07,8.06 17.07,8.06 C 17.07,8.06 20.07,6.8 22,10 z" style="fill:#ffffff;stroke:#212529;"/>
      <circle cx="9.5" cy="25.5" r="1" style="fill:#212529;stroke:#212529;"/>
      <path d="M 15,15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15,15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" style="fill:#212529;stroke:#212529;"/>
    </g>
  </svg>`,
  wB: `<svg viewBox="0 0 45 45" class="chess-svg">
    <g style="fill:none;stroke:#212529;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;">
      <g style="fill:#ffffff;stroke:#212529;stroke-linecap:butt;">
        <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z" />
        <path d="M 12,36 C 11.27,33.59 11.02,30.7 13.5,28 C 16.5,24.5 25,23.5 27,14 C 28.5,16.5 26.5,22.5 22.5,25 C 20,26.5 16.5,28 16.5,31 C 16.5,33.5 19,34.5 22.5,34 C 26,34.5 28.5,33.5 28.5,31 C 28.5,28 25,26.5 22.5,25" />
        <path d="M 22.5,14 C 21.5,11.5 23.5,8 22.5,6 C 21.5,8 23.5,11.5 22.5,14 z" />
      </g>
      <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" style="fill:none;stroke:#212529;stroke-linejoin:miter;" />
      <circle cx="22.5" cy="5" r="1.5" style="fill:#ffffff;stroke:#212529;"/>
    </g>
  </svg>`,
  wQ: `<svg viewBox="0 0 45 45" class="chess-svg">
    <g style="fill:#ffffff;stroke:#212529;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;">
      <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 31,11 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14,11 L 14,25 L 7,14 L 9,26 z" />
      <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 L 34,38.5 C 34,38.5 36,37.5 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" />
      <path d="M 11,38.5 L 34,38.5" style="stroke-linejoin:miter;"/>
      <circle cx="6" cy="12" r="2" />
      <circle cx="14" cy="9" r="2" />
      <circle cx="22.5" cy="8" r="2" />
      <circle cx="31" cy="9" r="2" />
      <circle cx="39" cy="12" r="2" />
    </g>
  </svg>`,
  wK: `<svg viewBox="0 0 45 45" class="chess-svg">
    <g style="fill:none;stroke:#212529;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;">
      <path d="M 22.5,11.63 L 22.5,6" style="stroke-linejoin:miter;"/>
      <path d="M 20,8 L 25,8" style="stroke-linejoin:miter;"/>
      <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" style="fill:#ffffff;stroke:#212529;stroke-linecap:butt;"/>
      <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 33.5,37 34,35 32.5,33 C 31,31 30,31.5 30,29 C 30,26.5 32.5,25 32.5,25 C 32.5,25 29,20 22.5,20 C 16,20 12.5,25 12.5,25 C 12.5,25 15,26.5 15,29 C 15,31.5 14,31 12.5,33 C 11,35 11.5,37 11.5,37 z" style="fill:#ffffff;stroke:#212529;"/>
      <path d="M 11.5,30 C 17,27 28,27 33.5,30" />
      <path d="M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5" />
      <path d="M 11.5,37 C 17,34 28,34 33.5,37" />
    </g>
  </svg>`,

  // Black Pieces
  bP: `<svg viewBox="0 0 45 45" class="chess-svg">
    <path d="m 22.5,9 c -2.21,0 -4,1.79 -4,4 0,0.89 0.29,1.71 0.78,2.38 C 17.33,16.5 16,18.59 16,21 c 0,2.03 0.94,3.84 2.41,5.03 C 15.41,27.09 11,31.58 11,39.5 l 23,0 c 0,-7.92 -4.41,-12.41 -7.41,-13.47 C 28.06,24.84 29,23.03 29,21 29,18.59 27.67,16.5 25.72,15.38 26.21,14.71 26.5,13.89 26.5,13 c 0,-2.21 -1.79,-4 -4,-4 z" style="fill:#212529;stroke:#212529;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;"/>
  </svg>`,
  bR: `<svg viewBox="0 0 45 45" class="chess-svg">
    <g style="fill:#212529;fill-rule:evenodd;stroke:#212529;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;">
      <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
      <path d="M 12.5,32 L 14,14 L 31,14 L 32.5,32 L 12.5,32 z" />
      <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" />
      <path d="M 14,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 31,14" />
      <path d="M 14,14 L 31,14" style="fill:none;stroke:#ffffff;stroke-width:1;stroke-linejoin:miter;" />
      <path d="M 12.5,32 L 32.5,32" style="fill:none;stroke:#ffffff;stroke-width:1;stroke-linejoin:miter;" />
    </g>
  </svg>`,
  bN: `<svg viewBox="0 0 45 45" class="chess-svg">
    <g style="fill:none;stroke:#212529;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;">
      <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" style="fill:#212529;stroke:#212529;"/>
      <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.07,8.06 17.07,8.06 C 17.07,8.06 20.07,6.8 22,10 z" style="fill:#212529;stroke:#212529;"/>
      <circle cx="9.5" cy="25.5" r="1" style="fill:#ffffff;stroke:#ffffff;"/>
      <path d="M 15,15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15,15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" style="fill:#ffffff;stroke:#ffffff;"/>
    </g>
  </svg>`,
  bB: `<svg viewBox="0 0 45 45" class="chess-svg">
    <g style="fill:none;stroke:#212529;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;">
      <g style="fill:#212529;stroke:#212529;stroke-linecap:butt;">
        <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z" />
        <path d="M 12,36 C 11.27,33.59 11.02,30.7 13.5,28 C 16.5,24.5 25,23.5 27,14 C 28.5,16.5 26.5,22.5 22.5,25 C 20,26.5 16.5,28 16.5,31 C 16.5,33.5 19,34.5 22.5,34 C 26,34.5 28.5,33.5 28.5,31 C 28.5,28 25,26.5 22.5,25" />
        <path d="M 22.5,14 C 21.5,11.5 23.5,8 22.5,6 C 21.5,8 23.5,11.5 22.5,14 z" />
      </g>
      <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" style="fill:none;stroke:#ffffff;stroke-linejoin:miter;" />
      <circle cx="22.5" cy="5" r="1.5" style="fill:#212529;stroke:#212529;"/>
    </g>
  </svg>`,
  bQ: `<svg viewBox="0 0 45 45" class="chess-svg">
    <g style="fill:#212529;stroke:#212529;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;">
      <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 31,11 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14,11 L 14,25 L 7,14 L 9,26 z" />
      <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 L 34,38.5 C 34,38.5 36,37.5 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" />
      <circle cx="6" cy="12" r="2" />
      <circle cx="14" cy="9" r="2" />
      <circle cx="22.5" cy="8" r="2" />
      <circle cx="31" cy="9" r="2" />
      <circle cx="39" cy="12" r="2" />
      <path d="M 11,38.5 L 34,38.5" style="stroke:#ffffff;stroke-width:1;stroke-linejoin:miter;" />
      <path d="M 11.5,30 C 20,28 25,28 33.5,30" style="fill:none;stroke:#ffffff;stroke-width:1;" />
    </g>
  </svg>`,
  bK: `<svg viewBox="0 0 45 45" class="chess-svg">
    <g style="fill:none;stroke:#212529;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;">
      <path d="M 22.5,11.63 L 22.5,6" style="stroke-linejoin:miter;"/>
      <path d="M 20,8 L 25,8" style="stroke-linejoin:miter;"/>
      <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25" style="fill:#212529;stroke:#212529;stroke-linecap:butt;"/>
      <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 33.5,37 34,35 32.5,33 C 31,31 30,31.5 30,29 C 30,26.5 32.5,25 32.5,25 C 32.5,25 29,20 22.5,20 C 16,20 12.5,25 12.5,25 C 12.5,25 15,26.5 15,29 C 15,31.5 14,31 12.5,33 C 11,35 11.5,37 11.5,37 z" style="fill:#212529;stroke:#212529;"/>
      <path d="M 11.5,30 C 17,27 28,27 33.5,30" style="stroke:#ffffff;stroke-width:1;" />
      <path d="M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5" style="stroke:#ffffff;stroke-width:1;" />
      <path d="M 11.5,37 C 17,34 28,34 33.5,37" style="stroke:#ffffff;stroke-width:1;" />
    </g>
  </svg>`
};
