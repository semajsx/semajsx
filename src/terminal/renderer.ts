import Yoga from 'yoga-layout-prebuilt';
import chalk, { type ChalkInstance } from 'chalk';
import cliBoxes from 'cli-boxes';
import ansiEscapes from 'ansi-escapes';
import stringWidth from 'string-width';
import sliceAnsi from 'slice-ansi';
import type { TerminalNode, TerminalElement, TerminalText, TerminalRoot } from './types';
import { collectText } from './operations';

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
 * Terminal renderer instance
 */
export class TerminalRenderer {
  private root: TerminalRoot;
  private buffer: string[] = [];
  private previousOutput: string = '';

  constructor(stream: NodeJS.WriteStream = process.stdout) {
    this.root = {
      type: 'root',
      stream,
      parent: null,
      children: [],
      yogaNode: Yoga.Node.create(),
    };

    // Set root dimensions to terminal size
    const { columns, rows } = stream;
    if (this.root.yogaNode) {
      this.root.yogaNode.setWidth(columns || 80);
      this.root.yogaNode.setHeight(rows || 24);
      // Set default flexbox properties to prevent children from stretching
      this.root.yogaNode.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
      this.root.yogaNode.setAlignItems(Yoga.ALIGN_FLEX_START);
    }
  }

  /**
   * Get the root node
   */
  getRoot(): TerminalRoot {
    return this.root;
  }

  /**
   * Render the tree to terminal
   */
  render(): void {
    // Calculate layout
    if (this.root.yogaNode) {
      this.root.yogaNode.calculateLayout(
        this.root.stream.columns || 80,
        this.root.stream.rows || 24,
        Yoga.DIRECTION_LTR
      );
    }

    // Update positions
    this.updatePositions(this.root, 0, 0);

    // Render to buffer
    this.buffer = [];
    const height = this.root.stream.rows || 24;
    for (let i = 0; i < height; i++) {
      this.buffer[i] = '';
    }

    // Render children
    for (const child of this.root.children) {
      this.renderNode(child);
    }

    // Output to terminal
    this.output();
  }

  /**
   * Update positions of nodes based on yoga layout
   */
  private updatePositions(node: TerminalNode, parentX: number, parentY: number): void {
    if (node.yogaNode) {
      node.x = Math.round(parentX + node.yogaNode.getComputedLeft());
      node.y = Math.round(parentY + node.yogaNode.getComputedTop());
      node.width = Math.round(node.yogaNode.getComputedWidth());
      node.height = Math.round(node.yogaNode.getComputedHeight());

      for (const child of node.children) {
        this.updatePositions(child, node.x || 0, node.y || 0);
      }
    } else {
      // Text nodes don't have yoga nodes - inherit parent position
      node.x = parentX;
      node.y = parentY;

      for (const child of node.children) {
        this.updatePositions(child, parentX, parentY);
      }
    }
  }

  /**
   * Render a single node
   */
  private renderNode(node: TerminalNode): void {
    if (node.type === 'text') {
      this.renderText(node);
    } else if (node.type === 'element') {
      this.renderElement(node);
    }
  }

  /**
   * Render a text node
   */
  private renderText(node: TerminalText): void {
    const { content, x = 0, y = 0, width = 0 } = node;

    if (y >= this.buffer.length || x < 0) return;

    let text = content;
    const maxWidth = width || (this.root.stream.columns || 80) - x;

    // Truncate if needed
    if (stringWidth(text) > maxWidth) {
      text = sliceAnsi(text, 0, maxWidth);
    }

    // Write to buffer at position
    this.writeAt(x, y, text);
  }

  /**
   * Render an element node
   */
  private renderElement(node: TerminalElement): void {
    const { style, x = 0, y = 0, width = 0, height = 0, tagName } = node;

    // Render border if specified
    if (style.border && style.border !== 'none') {
      this.renderBorder(node);
    }

    // Render background
    if (style.backgroundColor) {
      this.renderBackground(node);
    }

    // For text elements, collect and render all text content at once
    if (tagName === 'text') {
      const text = collectText(node);
      if (text) {
        // Apply text styling
        let styledText = text;
        if (style.color) {
          styledText = getChalkColor(style.color)(styledText);
        }
        if (style.bold) {
          styledText = chalk.bold(styledText);
        }
        if (style.italic) {
          styledText = chalk.italic(styledText);
        }
        if (style.underline) {
          styledText = chalk.underline(styledText);
        }
        if (style.strikethrough) {
          styledText = chalk.strikethrough(styledText);
        }
        if (style.dim) {
          styledText = chalk.dim(styledText);
        }

        this.writeAt(x, y, styledText);
      }
    } else {
      // For other elements, render children normally
      for (const child of node.children) {
        this.renderNode(child);
      }
    }
  }

  /**
   * Render a border around an element
   */
  private renderBorder(node: TerminalElement): void {
    const { style, x = 0, y = 0, width = 0, height = 0 } = node;
    const boxStyle = style.border || 'single';

    if (boxStyle === 'none') return;

    const box = cliBoxes[boxStyle] || cliBoxes.single;
    let borderChar = chalk;

    if (style.borderColor) {
      borderChar = getChalkColor(style.borderColor);
    }

    // Top border
    const topLine = borderChar(box.topLeft + box.top.repeat(Math.max(0, width - 2)) + box.topRight);
    this.writeAt(x, y, topLine);

    // Side borders
    for (let i = 1; i < height - 1; i++) {
      this.writeAt(x, y + i, borderChar(box.left));
      this.writeAt(x + width - 1, y + i, borderChar(box.right));
    }

    // Bottom border
    if (height > 1) {
      const bottomLine = borderChar(
        box.bottomLeft + box.bottom.repeat(Math.max(0, width - 2)) + box.bottomRight
      );
      this.writeAt(x, y + height - 1, bottomLine);
    }
  }

  /**
   * Render background color
   */
  private renderBackground(node: TerminalElement): void {
    const { style, x = 0, y = 0, width = 0, height = 0 } = node;

    if (!style.backgroundColor) return;

    const bg = getChalkBgColor(style.backgroundColor);

    for (let i = 0; i < height; i++) {
      const line = bg(' '.repeat(width));
      this.writeAt(x, y + i, line);
    }
  }

  /**
   * Write text at a specific position in the buffer
   */
  private writeAt(x: number, y: number, text: string): void {
    if (y < 0 || y >= this.buffer.length) return;

    const row = this.buffer[y] || '';
    const width = stringWidth(text);
    const rowWidth = stringWidth(row);

    // Pad row if needed
    if (rowWidth < x) {
      this.buffer[y] = row + ' '.repeat(x - rowWidth) + text;
    } else {
      // Replace characters at position
      this.buffer[y] = sliceAnsi(row, 0, x) + text + sliceAnsi(row, x + width);
    }
  }

  /**
   * Output the buffer to terminal
   */
  private output(): void {
    const output = this.buffer.join('\n');

    // Only update if changed
    if (output !== this.previousOutput) {
      this.root.stream.write(ansiEscapes.clearScreen);
      this.root.stream.write(ansiEscapes.cursorTo(0, 0));
      this.root.stream.write(output);
      this.previousOutput = output;
    }
  }

  /**
   * Clear the terminal
   */
  clear(): void {
    this.root.stream.write(ansiEscapes.clearScreen);
    this.root.stream.write(ansiEscapes.cursorTo(0, 0));
    this.previousOutput = '';
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.clear();
    if (this.root.yogaNode) {
      this.root.yogaNode.freeRecursive();
    }
  }
}
