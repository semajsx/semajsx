import { classes, rule } from "@semajsx/style";
import type { StyleToken, ClassRefs } from "@semajsx/style";
import { tokens } from "./tokens";

const SEQUENCE_CLASSES = [
  "participantBox",
  "participantLabel",
  "lifeline",
  "activation",
  "messageLine",
  "messageDotted",
  "messageText",
  "blockBg",
  "blockLabel",
  "blockLabelText",
  "noteBg",
  "noteText",
] as const;

const c: ClassRefs<typeof SEQUENCE_CLASSES> = classes(SEQUENCE_CLASSES);

export const participantBox: StyleToken = rule`${c.participantBox} {
  fill: ${tokens.actorFill};
  stroke: ${tokens.actorStroke};
  stroke-width: 2;
}`;

export const participantLabel: StyleToken = rule`${c.participantLabel} {
  fill: ${tokens.nodeText};
  stroke: none;
  font-family: ${tokens.fontFamily};
  font-size: ${tokens.fontSize}px;
  text-anchor: middle;
  dominant-baseline: central;
}`;

export const lifeline: StyleToken = rule`${c.lifeline} {
  stroke: ${tokens.lifelineStroke};
  stroke-width: 1;
  stroke-dasharray: 6, 4;
}`;

export const activation: StyleToken = rule`${c.activation} {
  fill: ${tokens.activationFill};
  stroke: ${tokens.actorStroke};
  stroke-width: 1;
}`;

export const messageLine: StyleToken = rule`${c.messageLine} {
  stroke: ${tokens.messageStroke};
  stroke-width: 1.5;
  fill: none;
}`;

export const messageDotted: StyleToken = rule`${c.messageDotted} {
  stroke-dasharray: 6, 4;
}`;

export const messageText: StyleToken = rule`${c.messageText} {
  fill: ${tokens.nodeText};
  stroke: none;
  font-family: ${tokens.fontFamily};
  font-size: 12px;
  text-anchor: middle;
}`;

export const blockBg: StyleToken = rule`${c.blockBg} {
  fill: ${tokens.blockFill};
  stroke: ${tokens.blockStroke};
  stroke-width: 1;
}`;

export const blockLabel: StyleToken = rule`${c.blockLabel} {
  fill: ${tokens.blockStroke};
}`;

export const blockLabelText: StyleToken = rule`${c.blockLabelText} {
  fill: ${tokens.nodeText};
  stroke: none;
  font-family: ${tokens.fontFamily};
  font-size: 11px;
  font-weight: 600;
}`;

export const noteBg: StyleToken = rule`${c.noteBg} {
  fill: ${tokens.noteBg};
  stroke: ${tokens.noteStroke};
  stroke-width: 1;
}`;

export const noteText: StyleToken = rule`${c.noteText} {
  fill: ${tokens.noteText};
  stroke: none;
  font-family: ${tokens.fontFamily};
  font-size: 12px;
  text-anchor: middle;
  dominant-baseline: central;
}`;

export { c };
