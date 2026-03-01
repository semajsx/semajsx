import { describe, it, expect } from "vitest";
import { flowchartLayout } from "./flowchart";
import type { FlowchartDiagram } from "../types";

function simpleDiagram(direction = "TD" as const): FlowchartDiagram {
  return {
    type: "flowchart",
    direction,
    nodes: [
      { id: "A", label: "Start", shape: "rect" },
      { id: "B", label: "End", shape: "rect" },
    ],
    edges: [
      { source: "A", target: "B", lineStyle: "solid", sourceMarker: "none", targetMarker: "arrow" },
    ],
    subgraphs: [],
  };
}

describe("flowchart layout", () => {
  it("produces positioned nodes for simple diagram", () => {
    const result = flowchartLayout(simpleDiagram());
    expect(result.nodes).toHaveLength(2);
    expect(result.nodes[0].x).toBeGreaterThan(0);
    expect(result.nodes[0].y).toBeGreaterThan(0);
    expect(result.nodes[0].width).toBeGreaterThan(0);
    expect(result.nodes[0].height).toBeGreaterThan(0);
  });

  it("positions nodes in layers for TD direction", () => {
    const result = flowchartLayout(simpleDiagram("TD"));
    const nodeA = result.nodes.find((n) => n.node.id === "A")!;
    const nodeB = result.nodes.find((n) => n.node.id === "B")!;
    // A should be above B in TD direction
    expect(nodeA.y).toBeLessThan(nodeB.y);
  });

  it("positions nodes horizontally for LR direction", () => {
    const result = flowchartLayout(simpleDiagram("LR"));
    const nodeA = result.nodes.find((n) => n.node.id === "A")!;
    const nodeB = result.nodes.find((n) => n.node.id === "B")!;
    // A should be left of B in LR direction
    expect(nodeA.x).toBeLessThan(nodeB.x);
  });

  it("produces valid SVG path data for edges", () => {
    const result = flowchartLayout(simpleDiagram());
    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].path).toMatch(/^M /);
  });

  it("generates bezier curves by default", () => {
    const result = flowchartLayout(simpleDiagram());
    expect(result.edges[0].path).toContain("C");
  });

  it("generates polylines when configured", () => {
    const result = flowchartLayout(simpleDiagram(), { edgeRouting: "polyline" });
    expect(result.edges[0].path).toContain("L");
    expect(result.edges[0].path).not.toContain("C");
  });

  it("computes viewBox", () => {
    const result = flowchartLayout(simpleDiagram());
    expect(result.viewBox).toMatch(/^0 0 \d+(\.\d+)? \d+(\.\d+)?$/);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it("handles edge labels", () => {
    const diagram: FlowchartDiagram = {
      type: "flowchart",
      direction: "TD",
      nodes: [
        { id: "A", label: "Start", shape: "rect" },
        { id: "B", label: "End", shape: "rect" },
      ],
      edges: [
        {
          source: "A",
          target: "B",
          lineStyle: "solid",
          sourceMarker: "none",
          targetMarker: "arrow",
          label: "Yes",
        },
      ],
      subgraphs: [],
    };
    const result = flowchartLayout(diagram);
    expect(result.edges[0].labelPosition).toBeDefined();
    expect(result.edges[0].labelSize).toBeDefined();
  });

  it("handles empty diagram", () => {
    const result = flowchartLayout({
      type: "flowchart",
      direction: "TD",
      nodes: [],
      edges: [],
      subgraphs: [],
    });
    expect(result.nodes).toHaveLength(0);
    expect(result.width).toBe(0);
  });

  it("handles diamond/fan patterns", () => {
    const result = flowchartLayout({
      type: "flowchart",
      direction: "TD",
      nodes: [
        { id: "A", label: "A", shape: "rect" },
        { id: "B", label: "B", shape: "rect" },
        { id: "C", label: "C", shape: "rect" },
        { id: "D", label: "D", shape: "rect" },
      ],
      edges: [
        {
          source: "A",
          target: "B",
          lineStyle: "solid",
          sourceMarker: "none",
          targetMarker: "arrow",
        },
        {
          source: "A",
          target: "C",
          lineStyle: "solid",
          sourceMarker: "none",
          targetMarker: "arrow",
        },
        {
          source: "B",
          target: "D",
          lineStyle: "solid",
          sourceMarker: "none",
          targetMarker: "arrow",
        },
        {
          source: "C",
          target: "D",
          lineStyle: "solid",
          sourceMarker: "none",
          targetMarker: "arrow",
        },
      ],
      subgraphs: [],
    });
    expect(result.nodes).toHaveLength(4);
    // A and D should be in different layers
    const nodeA = result.nodes.find((n) => n.node.id === "A")!;
    const nodeD = result.nodes.find((n) => n.node.id === "D")!;
    expect(nodeA.y).toBeLessThan(nodeD.y);
  });

  it("positions subgraph bounding boxes", () => {
    const result = flowchartLayout({
      type: "flowchart",
      direction: "TD",
      nodes: [
        { id: "A", label: "A", shape: "rect" },
        { id: "B", label: "B", shape: "rect" },
      ],
      edges: [
        {
          source: "A",
          target: "B",
          lineStyle: "solid",
          sourceMarker: "none",
          targetMarker: "arrow",
        },
      ],
      subgraphs: [{ id: "sg1", label: "Group", nodes: ["A", "B"] }],
    });
    expect(result.subgraphs).toHaveLength(1);
    expect(result.subgraphs[0].width).toBeGreaterThan(0);
    expect(result.subgraphs[0].height).toBeGreaterThan(0);
  });
});
