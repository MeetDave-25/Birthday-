// Single source of truth for timing (frames @ 30fps). Audio script reads narration.json.
export const FPS = 30;
export const TOTAL = 1800; // 60s

export const SCENES = {
  opening: [0, 120],
  desert: [120, 300],
  clock: [300, 480],
  arrival: [480, 660],
  corridor: [660, 900],
  album: [900, 1140],
  reveal: [1140, 1320],
  montage: [1320, 1500],
  jumpscare: [1500, 1530],
  title: [1530, 1680],
  final: [1680, 1800],
} as const;

export type Line = {from: number; to: number; text: string; whisper?: boolean};

export const NARRATION: Line[] = [
  {from: 135, to: 285, text: 'Kehte hain... is haveli mein waqt ruk gaya hai.'},
  {from: 315, to: 465, text: 'Pachattar saal se... yahan se koi zinda nahi lauta.'},
  {from: 520, to: 650, text: 'Rhea sirf ek story ke liye aayi thi.'},
  {from: 690, to: 880, text: 'Lekin is haveli mein... woh akeli nahi thi.'},
  {from: 940, to: 1120, text: 'Phir usne woh album khola...'},
  {from: 1170, to: 1300, text: '...aur usme apni hi tasveer thi.'},
  {from: 1420, to: 1495, text: 'Rhea... tum wapas aa gayi.', whisper: true},
  {from: 1690, to: 1780, text: 'Kuch darwaze... band hi rehne chahiye.'},
];
