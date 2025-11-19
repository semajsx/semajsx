import chalk, { type ChalkInstance } from "chalk";

/**
 * Get a chalk color function by name
 */
export function getChalkColor(colorName: string): ChalkInstance {
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
export function getChalkBgColor(colorName: string): ChalkInstance {
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
