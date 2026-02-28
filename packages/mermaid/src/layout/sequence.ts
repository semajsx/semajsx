import type {
  SequenceDiagram,
  SequenceLayout,
  PositionedParticipant,
  PositionedMessage,
  PositionedLifeline,
  PositionedActivation,
  PositionedBlock,
  PositionedNote,
  LayoutOptions,
  Size,
} from "../types";

const DEFAULT_OPTIONS: LayoutOptions = {
  nodeSpacing: 200,
  rankSpacing: 50,
  nodeWidth: 120,
  nodeHeight: 40,
  nodePadding: 16,
  diagramPadding: 20,
  edgeRouting: "bezier",
};

export function sequenceLayout(
  diagram: SequenceDiagram,
  options?: Partial<LayoutOptions>,
): SequenceLayout {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { participants, messages, blocks, notes } = diagram;

  if (participants.length === 0) {
    return {
      width: 0,
      height: 0,
      viewBox: "0 0 0 0",
      participants: [],
      messages: [],
      lifelines: [],
      activations: [],
      blocks: [],
      notes: [],
    };
  }

  // Phase 1: Column assignment
  const participantX = new Map<string, number>();
  participants.forEach((p, i) => {
    participantX.set(p.id, opts.diagramPadding + opts.nodeWidth / 2 + i * opts.nodeSpacing);
  });

  const headerY = opts.diagramPadding + opts.nodeHeight / 2;
  const headerBottom = headerY + opts.nodeHeight / 2 + 20;

  // Phase 2: Row assignment
  const positionedMessages: PositionedMessage[] = messages.map((msg, i) => {
    const fromX = participantX.get(msg.from) ?? 0;
    const toX = participantX.get(msg.to) ?? 0;
    const y = headerBottom + i * opts.rankSpacing;
    return { message: msg, fromX, toX, y };
  });

  // Phase 3: Activation tracking
  const activationStarts = new Map<string, number>();
  const positionedActivations: PositionedActivation[] = [];

  for (const pmsg of positionedMessages) {
    const msg = pmsg.message;
    if (msg.activate) {
      activationStarts.set(msg.to, pmsg.y);
    }
    if (msg.deactivate) {
      const startY = activationStarts.get(msg.from);
      if (startY !== undefined) {
        const x = participantX.get(msg.from) ?? 0;
        const participant = participants.find((p) => p.id === msg.from);
        if (participant) {
          positionedActivations.push({
            participant,
            x: x - 7,
            y: startY,
            width: 14,
            height: pmsg.y - startY,
          });
        }
        activationStarts.delete(msg.from);
      }
    }
  }

  // Calculate diagram height
  const lastMsg = positionedMessages[positionedMessages.length - 1];
  const lastMessageY = lastMsg ? lastMsg.y : headerBottom;
  const diagramBottom = lastMessageY + opts.rankSpacing;

  // Phase 4: Lifelines
  const positionedLifelines: PositionedLifeline[] = participants.map((p) => {
    const x = participantX.get(p.id) ?? 0;
    return { participant: p, x, y1: headerY + opts.nodeHeight / 2, y2: diagramBottom };
  });

  // Phase 5: Blocks
  const positionedBlocks: PositionedBlock[] = blocks.map((block) => {
    // Find messages that belong to this block
    const blockMsgs = block.messages;
    const allMsgs = [...blockMsgs, ...(block.sections?.flatMap((s) => s.messages) ?? [])];

    let minX = Infinity;
    let maxX = -Infinity;

    for (const msg of allMsgs) {
      const fromX = participantX.get(msg.from) ?? 0;
      const toX = participantX.get(msg.to) ?? 0;
      minX = Math.min(minX, fromX, toX);
      maxX = Math.max(maxX, fromX, toX);
    }

    // Find y range from positioned messages
    const msgIndices = allMsgs
      .map((m) =>
        messages.findIndex((pm) => pm.from === m.from && pm.to === m.to && pm.text === m.text),
      )
      .filter((i) => i >= 0);

    const firstBlockMsg =
      msgIndices.length > 0 ? positionedMessages[Math.min(...msgIndices)] : undefined;
    const lastBlockMsg =
      msgIndices.length > 0 ? positionedMessages[Math.max(...msgIndices)] : undefined;
    const startY = firstBlockMsg ? firstBlockMsg.y - 20 : headerBottom;
    const endY = lastBlockMsg ? lastBlockMsg.y + 20 : headerBottom + opts.rankSpacing;

    const padding = opts.nodePadding;
    return {
      block,
      x: minX - padding - opts.nodeWidth / 2,
      y: startY,
      width: maxX - minX + opts.nodeWidth + padding * 2,
      height: endY - startY,
    };
  });

  // Phase 6: Notes
  const positionedNotes: PositionedNote[] = notes.map((note, i) => {
    const pIds = note.participants;
    const xs = pIds.map((id) => participantX.get(id) ?? 0).filter((x) => x > 0);

    let x: number;
    if (note.position === "left of") {
      x = (xs[0] ?? opts.diagramPadding) - opts.nodeWidth;
    } else if (note.position === "right of") {
      x = (xs[0] ?? opts.diagramPadding) + opts.nodeWidth;
    } else {
      // "over" — centered between participants
      x = xs.length > 0 ? xs.reduce((a, b) => a + b, 0) / xs.length : opts.diagramPadding;
    }

    // Put note at a y position based on its index in notes array
    // In real usage, notes are interleaved with messages, but for now approximate
    const y = headerBottom + (messages.length + i) * opts.rankSpacing * 0.5;

    const size = estimateTextSize(note.text, 12);
    return {
      note,
      x,
      y,
      width: Math.max(size.width + opts.nodePadding * 2, 80),
      height: Math.max(size.height + opts.nodePadding, 30),
    };
  });

  // Positioned participants
  const positionedParticipants: PositionedParticipant[] = participants.map((p) => {
    const x = participantX.get(p.id) ?? 0;
    const size = estimateTextSize(p.label, 14);
    const width = Math.max(size.width + opts.nodePadding * 2, opts.nodeWidth);
    return { participant: p, x, y: headerY, width, height: opts.nodeHeight };
  });

  // Final dimensions
  const diagramWidth =
    (participants.length - 1) * opts.nodeSpacing + opts.nodeWidth + opts.diagramPadding * 2;
  const diagramHeight = diagramBottom + opts.diagramPadding;

  return {
    width: diagramWidth,
    height: diagramHeight,
    viewBox: `0 0 ${diagramWidth} ${diagramHeight}`,
    participants: positionedParticipants,
    messages: positionedMessages,
    lifelines: positionedLifelines,
    activations: positionedActivations,
    blocks: positionedBlocks,
    notes: positionedNotes,
  };
}

function estimateTextSize(text: string, fontSize: number): Size {
  const avgCharWidth = fontSize * 0.6;
  return {
    width: text.length * avgCharWidth,
    height: fontSize * 1.4,
  };
}
