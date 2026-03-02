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

  it("groups same-subgraph nodes together in the same layer", () => {
    // C1, C2 are in "Backend", D1, D2 are in "Frontend" — all on same layer
    const result = flowchartLayout({
      type: "flowchart",
      direction: "TD",
      nodes: [
        { id: "A", label: "A", shape: "rect" },
        { id: "C1", label: "C1", shape: "rect" },
        { id: "C2", label: "C2", shape: "rect" },
        { id: "D1", label: "D1", shape: "rect" },
        { id: "D2", label: "D2", shape: "rect" },
      ],
      edges: [
        {
          source: "A",
          target: "C1",
          lineStyle: "solid",
          sourceMarker: "none",
          targetMarker: "arrow",
        },
        {
          source: "A",
          target: "C2",
          lineStyle: "solid",
          sourceMarker: "none",
          targetMarker: "arrow",
        },
        {
          source: "A",
          target: "D1",
          lineStyle: "solid",
          sourceMarker: "none",
          targetMarker: "arrow",
        },
        {
          source: "A",
          target: "D2",
          lineStyle: "solid",
          sourceMarker: "none",
          targetMarker: "arrow",
        },
      ],
      subgraphs: [
        { id: "backend", label: "Backend", nodes: ["C1", "C2"] },
        { id: "frontend", label: "Frontend", nodes: ["D1", "D2"] },
      ],
    });

    // Same-subgraph nodes should be adjacent (no interleaving)
    const layer1 = result.nodes.filter((n) => n.node.id !== "A").sort((a, b) => a.x - b.x);
    const ids = layer1.map((n) => n.node.id);
    // C1, C2 should be next to each other
    const c1Idx = ids.indexOf("C1");
    const c2Idx = ids.indexOf("C2");
    expect(Math.abs(c1Idx - c2Idx)).toBe(1);
    // D1, D2 should be next to each other
    const d1Idx = ids.indexOf("D1");
    const d2Idx = ids.indexOf("D2");
    expect(Math.abs(d1Idx - d2Idx)).toBe(1);
  });

  it("handles nested subgraphs", () => {
    const result = flowchartLayout({
      type: "flowchart",
      direction: "TD",
      nodes: [
        { id: "A", label: "API", shape: "rect" },
        { id: "B", label: "DB", shape: "cylinder" },
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
      subgraphs: [
        {
          id: "cloud",
          label: "Cloud",
          nodes: [],
          subgraphs: [{ id: "vpc", label: "VPC", nodes: ["A", "B"] }],
        },
      ],
    });

    // Should produce 2 positioned subgraphs (vpc + cloud)
    expect(result.subgraphs).toHaveLength(2);

    const vpc = result.subgraphs.find((s) => s.subgraph.id === "vpc")!;
    const cloud = result.subgraphs.find((s) => s.subgraph.id === "cloud")!;

    // VPC should contain the nodes
    expect(vpc.width).toBeGreaterThan(0);
    expect(vpc.height).toBeGreaterThan(0);

    // Cloud should fully contain VPC
    expect(cloud.x).toBeLessThanOrEqual(vpc.x);
    expect(cloud.y).toBeLessThanOrEqual(vpc.y);
    expect(cloud.x + cloud.width).toBeGreaterThanOrEqual(vpc.x + vpc.width);
    expect(cloud.y + cloud.height).toBeGreaterThanOrEqual(vpc.y + vpc.height);
  });

  it("expands viewBox to include subgraph boxes", () => {
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

    // The viewBox dimensions should be at least as large as the subgraph box
    const sg = result.subgraphs[0];
    expect(result.width).toBeGreaterThanOrEqual(sg.width);
    expect(result.height).toBeGreaterThanOrEqual(sg.height);
  });
});
