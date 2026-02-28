import type { Token } from "./tokenizer";
import { tokenize, filterTokens } from "./tokenizer";
import type {
  FlowchartDiagram,
  FlowNode,
  FlowEdge,
  Subgraph,
  Direction,
  EdgeType,
  ParseError,
} from "../types";

interface ParserState {
  tokens: Token[];
  pos: number;
  nodes: Map<string, FlowNode>;
  edges: FlowEdge[];
  subgraphs: Subgraph[];
  direction: Direction;
}

export function parseFlowchart(input: string): FlowchartDiagram | ParseError {
  const rawTokens = tokenize(input);
  const tokens = filterTokens(rawTokens);

  const state: ParserState = {
    tokens,
    pos: 0,
    nodes: new Map(),
    edges: [],
    subgraphs: [],
    direction: "TD",
  };

  // Parse header: graph/flowchart + direction
  if (!parseHeader(state)) {
    return { message: "Expected 'graph' or 'flowchart' keyword", line: 1, column: 1 };
  }

  // Parse body
  while (!isEof(state)) {
    skipNewlines(state);
    if (isEof(state)) break;

    const token = peek(state);

    if (token.type === "keyword" && token.value === "subgraph") {
      const result = parseSubgraph(state);
      if ("message" in result) return result;
      continue;
    }

    if (token.type === "keyword" && token.value === "direction") {
      advance(state);
      const dir = peek(state);
      if (dir.type === "identifier" || dir.type === "keyword") {
        state.direction = dir.value as Direction;
        advance(state);
      }
      skipSemicolon(state);
      continue;
    }

    if (token.type === "keyword" && token.value === "end") {
      // end of subgraph handled in parseSubgraph
      break;
    }

    // Try to parse a node definition or edge chain
    const result = parseStatement(state);
    if (result && "message" in result) return result;
  }

  return {
    type: "flowchart",
    direction: state.direction,
    nodes: Array.from(state.nodes.values()),
    edges: state.edges,
    subgraphs: state.subgraphs,
  };
}

function parseHeader(state: ParserState): boolean {
  skipNewlines(state);
  const token = peek(state);
  if (token.type !== "keyword" || (token.value !== "graph" && token.value !== "flowchart")) {
    return false;
  }
  advance(state);

  // Optional direction
  skipNewlines(state);
  const dir = peek(state);
  if (dir.type === "identifier" || dir.type === "keyword") {
    const dirVal = dir.value.toUpperCase();
    if (["TB", "TD", "BT", "LR", "RL"].includes(dirVal)) {
      state.direction = dirVal as Direction;
      advance(state);
    }
  }

  skipSemicolon(state);
  return true;
}

function parseStatement(state: ParserState): ParseError | undefined {
  // Parse first node
  let currentNode = parseNodeRef(state);
  if (!currentNode) {
    // Skip unknown token
    advance(state);
    return;
  }

  // Check if followed by arrow (edge chain: A --> B --> C)
  while (!isEof(state) && peek(state).type === "arrow") {
    const arrowToken = advance(state);
    const edgeType = arrowToEdgeType(arrowToken.value);

    // Check for edge label: -->|label| or arrow ending with |
    let edgeLabel: string | undefined;
    if (arrowToken.value.endsWith("|")) {
      edgeLabel = parseEdgeLabel(state);
    } else if (peek(state).type === "pipe") {
      advance(state); // skip |
      edgeLabel = parseEdgeLabel(state);
    }

    // Parse target node
    const targetNode = parseNodeRef(state);
    if (!targetNode) {
      return {
        message: "Expected target node after arrow",
        line: arrowToken.line,
        column: arrowToken.column,
      };
    }

    state.edges.push({
      source: currentNode,
      target: targetNode,
      type: edgeType,
      label: edgeLabel,
    });

    // Chain: target becomes source for next arrow
    currentNode = targetNode;
  }

  skipSemicolon(state);
}

function parseNodeRef(state: ParserState): string | undefined {
  skipNewlines(state);
  const token = peek(state);

  if (token.type !== "identifier" && token.type !== "keyword") {
    return;
  }

  if (token.type === "keyword" && ["subgraph", "end", "direction"].includes(token.value)) {
    return;
  }

  const id = token.value;
  advance(state);

  // Check for node shape definition
  const next = peek(state);
  if (next.type === "openBracket" || next.type === "openParen" || next.type === "openBrace") {
    const shape = parseNodeShape(state, id);
    if (shape) {
      if (!state.nodes.has(id)) {
        state.nodes.set(id, shape);
      }
      return id;
    }
  }

  // Ensure node exists in map (plain reference)
  if (!state.nodes.has(id)) {
    state.nodes.set(id, { id, label: id, shape: "rect" });
  }

  return id;
}

function parseNodeShape(state: ParserState, id: string): FlowNode | undefined {
  const open = peek(state);

  // [text] → rect
  // (text) → round
  // ((text)) → double-circle
  // {text} → rhombus
  // ([text]) → stadium
  // [(text)] → cylinder
  // [[text]] → subroutine
  // >text] → asymmetric
  // {{text}} → hexagon

  if (open.value === "[") {
    advance(state);
    const next = peek(state);

    // [( → stadium
    if (next.type === "openParen") {
      advance(state);
      const label = readUntil(state, "closeParen");
      expect(state, "closeBracket");
      return { id, label, shape: "stadium" };
    }

    // [[ → subroutine
    if (next.type === "openBracket") {
      advance(state);
      const label = readUntil(state, "closeBracket");
      expect(state, "closeBracket");
      return { id, label, shape: "subroutine" };
    }

    // [text] → rect
    const label = readUntil(state, "closeBracket");
    return { id, label, shape: "rect" };
  }

  if (open.value === "(") {
    advance(state);
    const next = peek(state);

    // (( → double-circle
    if (next.type === "openParen" || next.value === "(") {
      advance(state);
      const label = readUntil(state, "closeParen");
      // consume extra )
      if (peek(state).type === "closeParen") advance(state);
      return { id, label, shape: "double-circle" };
    }

    // ([ → stadium (alt syntax)
    if (next.type === "openBracket") {
      advance(state);
      const label = readUntil(state, "closeBracket");
      expect(state, "closeParen");
      return { id, label, shape: "stadium" };
    }

    // (text) → round
    const label = readUntil(state, "closeParen");
    return { id, label, shape: "round" };
  }

  if (open.value === "((") {
    advance(state);
    const label = readUntil(state, "closeParen");
    // consume extra ) if needed
    if (peek(state).type === "closeParen") advance(state);
    return { id, label, shape: "double-circle" };
  }

  if (open.value === "{") {
    advance(state);
    const next = peek(state);

    // {{ → hexagon
    if (next.type === "openBrace") {
      advance(state);
      const label = readUntil(state, "closeBrace");
      expect(state, "closeBrace");
      return { id, label, shape: "hexagon" };
    }

    // {text} → rhombus
    const label = readUntil(state, "closeBrace");
    return { id, label, shape: "rhombus" };
  }

  // >text] → asymmetric
  if (open.value === ">") {
    advance(state);
    const label = readUntil(state, "closeBracket");
    return { id, label, shape: "asymmetric" };
  }

  return;
}

function parseEdgeLabel(state: ParserState): string {
  let label = "";
  while (!isEof(state) && peek(state).type !== "pipe") {
    label += peek(state).value;
    advance(state);
  }
  if (peek(state).type === "pipe") advance(state); // skip closing |
  return label.trim();
}

function parseSubgraph(state: ParserState): { ok: true } | ParseError {
  advance(state); // skip "subgraph"
  skipNewlines(state);

  // subgraph id [label]
  let id = "";
  let label = "";

  const next = peek(state);
  if (next.type === "identifier" || next.type === "keyword") {
    id = next.value;
    label = id;
    advance(state);
  }

  // Optional [label]
  if (peek(state).type === "openBracket") {
    advance(state);
    label = readUntil(state, "closeBracket");
  }

  skipSemicolon(state);
  skipNewlines(state);

  // Optional direction inside subgraph
  let direction: Direction | undefined;
  if (peek(state).type === "keyword" && peek(state).value === "direction") {
    advance(state);
    const dir = peek(state);
    if (dir.type === "identifier" || dir.type === "keyword") {
      direction = dir.value as Direction;
      advance(state);
    }
    skipSemicolon(state);
  }

  // Collect node IDs until "end"
  const nodeIds: string[] = [];
  while (!isEof(state)) {
    skipNewlines(state);
    if (isEof(state)) break;

    const token = peek(state);
    if (token.type === "keyword" && token.value === "end") {
      advance(state);
      break;
    }

    // Parse statements inside subgraph
    const result = parseStatement(state);
    if (result && "message" in result) return result;

    // Track new nodes added during this statement
    for (const [nodeId] of state.nodes) {
      if (!nodeIds.includes(nodeId)) {
        nodeIds.push(nodeId);
      }
    }
  }

  state.subgraphs.push({
    id: id || `subgraph_${state.subgraphs.length}`,
    label,
    nodes: nodeIds,
    direction,
  });
  return { ok: true };
}

function arrowToEdgeType(arrow: string): EdgeType {
  if (arrow.startsWith("-.")) return "dotted";
  if (arrow.startsWith("==")) return "thick";
  if (arrow === "--" || arrow === "---") return "open";
  return "arrow";
}

// ── Helpers ────────────────────────────────────────────

function peek(state: ParserState): Token {
  return state.tokens[state.pos] ?? { type: "eof", value: "", line: 0, column: 0 };
}

function advance(state: ParserState): Token {
  const token = state.tokens[state.pos] ?? { type: "eof" as const, value: "", line: 0, column: 0 };
  if (state.pos < state.tokens.length) state.pos++;
  return token;
}

function isEof(state: ParserState): boolean {
  return state.pos >= state.tokens.length || state.tokens[state.pos]?.type === "eof";
}

function skipNewlines(state: ParserState): void {
  while (!isEof(state) && peek(state).type === "newline") {
    advance(state);
  }
}

function skipSemicolon(state: ParserState): void {
  if (!isEof(state) && peek(state).type === "semicolon") {
    advance(state);
  }
}

function expect(state: ParserState, type: string): Token | undefined {
  if (peek(state).type === type) {
    return advance(state);
  }
  return;
}

function readUntil(state: ParserState, closeType: string): string {
  let value = "";
  while (!isEof(state) && peek(state).type !== closeType) {
    if (value) value += " ";
    value += peek(state).value;
    advance(state);
  }
  if (peek(state).type === closeType) advance(state);
  return value.trim();
}
