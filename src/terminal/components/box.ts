import chalk, { type ChalkInstance } from "chalk";
import cliBoxes from "cli-boxes";
import type { TerminalElement } from "../types";

/**
 * Get a chalk color function by name
 */
function getChalkColor(colorName: string): ChalkInstance {
  const colors: Record<string, ChalkInstance> = {
    black: chalk.black,
    red: chalk.red,
    green: chalk.green,
    yellow: chalk.yellow,
    blue: chalk.blue,
    magenta: chalk.magenta,
    cyan: chalk.cyan,
    white: chalk.white,
    gray: chalk.gray,
    grey: chalk.grey,
    blackBright: chalk.blackBright,
    redBright: chalk.redBright,
    greenBright: chalk.greenBright,
    yellowBright: chalk.yellowBright,
    blueBright: chalk.blueBright,
    magentaBright: chalk.magentaBright,
    cyanBright: chalk.cyanBright,
    whiteBright: chalk.whiteBright,
  };
  return colors[colorName] || chalk;
}

/**
 * Get a chalk background color function by name
 */
function getChalkBgColor(colorName: string): ChalkInstance {
  const bgColors: Record<string, ChalkInstance> = {
    black: chalk.bgBlack,
    red: chalk.bgRed,
    green: chalk.bgGreen,
    yellow: chalk.bgYellow,
    blue: chalk.bgBlue,
    magenta: chalk.bgMagenta,
    cyan: chalk.bgCyan,
    white: chalk.bgWhite,
    gray: chalk.bgGray,
    grey: chalk.bgGrey,
    blackBright: chalk.bgBlackBright,
    redBright: chalk.bgRedBright,
    greenBright: chalk.bgGreenBright,
    yellowBright: chalk.bgYellowBright,
    blueBright: chalk.bgBlueBright,
    magentaBright: chalk.bgMagentaBright,
    cyanBright: chalk.bgCyanBright,
    whiteBright: chalk.bgWhiteBright,
  };
  return bgColors[colorName] || chalk;
}

/**
 * Render a border around an element
 */
export function renderBorder(
  node: TerminalElement,
  writeAt: (x: number, y: number, text: string) => void,
): void {
  const { style, x = 0, y = 0, width = 0, height = 0 } = node;
  const boxStyle = style.border || "single";

  if (boxStyle === "none") return;

  const box = cliBoxes[boxStyle] || cliBoxes.single;
  let borderChar = chalk;

  if (style.borderColor) {
    borderChar = getChalkColor(style.borderColor);
  }

  // Top border
  const topLine = borderChar(
    box.topLeft + box.top.repeat(Math.max(0, width - 2)) + box.topRight,
  );
  writeAt(x, y, topLine);

  // Side borders
  for (let i = 1; i < height - 1; i++) {
    writeAt(x, y + i, borderChar(box.left));
    writeAt(x + width - 1, y + i, borderChar(box.right));
  }

  // Bottom border
  if (height > 1) {
    const bottomLine = borderChar(
      box.bottomLeft +
        box.bottom.repeat(Math.max(0, width - 2)) +
        box.bottomRight,
    );
    writeAt(x, y + height - 1, bottomLine);
  }
}

/**
 * Render background color
 */
export function renderBackground(
  node: TerminalElement,
  writeAt: (x: number, y: number, text: string) => void,
): void {
  const { style, x = 0, y = 0, width = 0, height = 0 } = node;

  if (!style.backgroundColor) return;

  const bg = getChalkBgColor(style.backgroundColor);

  for (let i = 0; i < height; i++) {
    const line = bg(" ".repeat(width));
    writeAt(x, y + i, line);
  }
}
