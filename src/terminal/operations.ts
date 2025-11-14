import Yoga from 'yoga-layout-prebuilt';
import type { TerminalNode, TerminalElement, TerminalText, TerminalRoot, TerminalStyle } from './types';

/**
 * Create a terminal element
 */
export function createElement(tagName: string): TerminalElement {
  const yogaNode = Yoga.Node.create();

  return {
    type: 'element',
    tagName,
    style: {},
    props: {},
    yogaNode,
    parent: null,
    children: [],
  };
}

/**
 * Create a terminal text node
 */
export function createTextNode(text: string): TerminalText {
  const yogaNode = Yoga.Node.create();

  return {
    type: 'text',
    content: text,
    yogaNode,
    parent: null,
    children: [],
  };
}

/**
 * Create a comment (no-op in terminal, returns text node)
 */
export function createComment(text: string): TerminalText {
  return createTextNode('');
}

/**
 * Append a child to a parent node
 */
export function appendChild(parent: TerminalNode, child: TerminalNode): void {
  if (child.parent) {
    removeChild(child);
  }

  child.parent = parent;
  parent.children.push(child);

  if (parent.yogaNode && child.yogaNode) {
    parent.yogaNode.insertChild(child.yogaNode, parent.yogaNode.getChildCount());
  }
}

/**
 * Remove a child from its parent
 */
export function removeChild(node: TerminalNode): void {
  if (!node.parent) return;

  const parent = node.parent;
  const index = parent.children.indexOf(node);

  if (index !== -1) {
    parent.children.splice(index, 1);

    if (parent.yogaNode && node.yogaNode) {
      parent.yogaNode.removeChild(node.yogaNode);
    }
  }

  node.parent = null;
}

/**
 * Insert a node before another node
 */
export function insertBefore(
  parent: TerminalNode,
  newNode: TerminalNode,
  refNode: TerminalNode | null
): void {
  if (newNode.parent) {
    removeChild(newNode);
  }

  newNode.parent = parent;

  if (!refNode) {
    appendChild(parent, newNode);
    return;
  }

  const index = parent.children.indexOf(refNode);
  if (index !== -1) {
    parent.children.splice(index, 0, newNode);

    if (parent.yogaNode && newNode.yogaNode) {
      parent.yogaNode.insertChild(newNode.yogaNode, index);
    }
  }
}

/**
 * Replace a node with another node
 */
export function replaceNode(oldNode: TerminalNode, newNode: TerminalNode): void {
  const parent = oldNode.parent;
  if (!parent) return;

  insertBefore(parent, newNode, oldNode);
  removeChild(oldNode);
}

/**
 * Set text content of a text node
 */
export function setText(node: TerminalNode, text: string): void {
  if (node.type === 'text') {
    node.content = text;
  }
}

/**
 * Apply yoga layout styles
 */
export function applyStyle(element: TerminalElement, style: Partial<TerminalStyle>): void {
  const { yogaNode } = element;
  if (!yogaNode) return;

  element.style = { ...element.style, ...style };

  // Flexbox
  if (style.flexDirection) {
    const direction = {
      row: Yoga.FLEX_DIRECTION_ROW,
      column: Yoga.FLEX_DIRECTION_COLUMN,
      'row-reverse': Yoga.FLEX_DIRECTION_ROW_REVERSE,
      'column-reverse': Yoga.FLEX_DIRECTION_COLUMN_REVERSE,
    }[style.flexDirection];
    yogaNode.setFlexDirection(direction);
  }

  if (style.justifyContent) {
    const justify = {
      'flex-start': Yoga.JUSTIFY_FLEX_START,
      center: Yoga.JUSTIFY_CENTER,
      'flex-end': Yoga.JUSTIFY_FLEX_END,
      'space-between': Yoga.JUSTIFY_SPACE_BETWEEN,
      'space-around': Yoga.JUSTIFY_SPACE_AROUND,
    }[style.justifyContent];
    yogaNode.setJustifyContent(justify);
  }

  if (style.alignItems) {
    const align = {
      'flex-start': Yoga.ALIGN_FLEX_START,
      center: Yoga.ALIGN_CENTER,
      'flex-end': Yoga.ALIGN_FLEX_END,
      stretch: Yoga.ALIGN_STRETCH,
    }[style.alignItems];
    yogaNode.setAlignItems(align);
  }

  // Flex grow/shrink
  if (style.flexGrow !== undefined) {
    yogaNode.setFlexGrow(style.flexGrow);
  }
  if (style.flexShrink !== undefined) {
    yogaNode.setFlexShrink(style.flexShrink);
  }

  // Dimensions
  if (style.width !== undefined) {
    if (typeof style.width === 'number') {
      yogaNode.setWidth(style.width);
    } else if (style.width === 'auto') {
      yogaNode.setWidthAuto();
    } else if (style.width.endsWith('%')) {
      yogaNode.setWidthPercent(parseFloat(style.width));
    }
  }

  if (style.height !== undefined) {
    if (typeof style.height === 'number') {
      yogaNode.setHeight(style.height);
    } else if (style.height === 'auto') {
      yogaNode.setHeightAuto();
    } else if (style.height.endsWith('%')) {
      yogaNode.setHeightPercent(parseFloat(style.height));
    }
  }

  // Min/Max dimensions
  if (style.minWidth !== undefined) yogaNode.setMinWidth(style.minWidth);
  if (style.minHeight !== undefined) yogaNode.setMinHeight(style.minHeight);
  if (style.maxWidth !== undefined) yogaNode.setMaxWidth(style.maxWidth);
  if (style.maxHeight !== undefined) yogaNode.setMaxHeight(style.maxHeight);

  // Margin
  if (style.margin !== undefined) {
    yogaNode.setMargin(Yoga.EDGE_ALL, style.margin);
  }
  if (style.marginLeft !== undefined) {
    yogaNode.setMargin(Yoga.EDGE_LEFT, style.marginLeft);
  }
  if (style.marginRight !== undefined) {
    yogaNode.setMargin(Yoga.EDGE_RIGHT, style.marginRight);
  }
  if (style.marginTop !== undefined) {
    yogaNode.setMargin(Yoga.EDGE_TOP, style.marginTop);
  }
  if (style.marginBottom !== undefined) {
    yogaNode.setMargin(Yoga.EDGE_BOTTOM, style.marginBottom);
  }

  // Padding
  if (style.padding !== undefined) {
    yogaNode.setPadding(Yoga.EDGE_ALL, style.padding);
  }
  if (style.paddingLeft !== undefined) {
    yogaNode.setPadding(Yoga.EDGE_LEFT, style.paddingLeft);
  }
  if (style.paddingRight !== undefined) {
    yogaNode.setPadding(Yoga.EDGE_RIGHT, style.paddingRight);
  }
  if (style.paddingTop !== undefined) {
    yogaNode.setPadding(Yoga.EDGE_TOP, style.paddingTop);
  }
  if (style.paddingBottom !== undefined) {
    yogaNode.setPadding(Yoga.EDGE_BOTTOM, style.paddingBottom);
  }
}
