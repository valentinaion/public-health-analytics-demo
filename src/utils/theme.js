export const colors = {
  blue: '#0078D4',
  blueDark: '#005A9E',
  blueLight: '#C7E0F4',
  teal: '#00B4D8',
  green: '#107C10',
  greenLight: '#DFF6DD',
  amber: '#FF8C00',
  amberLight: '#FFF4CE',
  red: '#D13438',
  redLight: '#FDE7E9',
  purple: '#5C2D91',
  purpleLight: '#E8D4F5',
  muted: '#A19F9D',
  border: '#EDEBE9',
  textSecondary: '#605E5C'
};

export const alpha = (hex, a) =>
  hex + Math.round(a * 255).toString(16).padStart(2, '0');
