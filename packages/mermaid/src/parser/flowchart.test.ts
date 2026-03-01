import { describe, it, expect } from "vitest";
import { parseFlowchart } from "./flowchart";
import type { FlowchartDiagram } from "../types";

function expectFlowchart(input: string): FlowchartDiagram {
  const result = parseFlowchart(input);
  if ("message" in result) throw new Error(`Parse error: ${result.message}`);
  return result;
}

describe("flowchart parser", () => {
  describe("header", () => {
    it("parses 'graph TD'", () => {
      const result = expectFlowchart("graph TD\n  A --> B");
      expect(result.direction).toBe("TD");
    });

    it("parses 'flowchart LR'", () => {
      const result = expectFlowchart("flowchart LR\n  A --> B");
      expect(result.direction).toBe("LR");
    });

    it("defaults to TD when no direction", () => {
      const result = expectFlowchart("graph\n  A --> B");
      expect(result.direction).toBe("TD");
    });

    it("returns error for unknown diagram type", () => {
      const result = parseFlowchart("unknown diagram");
      expect("message" in result).toBe(true);
    });
  });

  describe("nodes", () => {
    it("parses simple node reference", () => {
      const result = expectFlowchart("graph TD\n  A --> B");
      expect(result.nodes).toHaveLength(2);
      expect(result.nodes[0]).toEqual({ id: "A", label: "A", shape: "rect" });
    });

    it("parses rect node [text]", () => {
      const result = expectFlowchart("graph TD\n  A[Hello World]");
      expect(result.nodes[0]).toEqual({ id: "A", label: "Hello World", shape: "rect" });
    });

    it("parses round node (text)", () => {
      const result = expectFlowchart("graph TD\n  A(Round)");
      expect(result.nodes[0].shape).toBe("round");
      expect(result.nodes[0].label).toBe("Round");
    });

    it("parses rhombus node {text}", () => {
      const result = expectFlowchart("graph TD\n  A{Decision}");
      expect(result.nodes[0].shape).toBe("rhombus");
    });

    it("parses stadium node ([text])", () => {
      const result = expectFlowchart("graph TD\n  A([Stadium])");
      expect(result.nodes[0].shape).toBe("stadium");
    });

    it("parses double-circle node ((text))", () => {
      const result = expectFlowchart("graph TD\n  A((Circle))");
      expect(result.nodes[0].shape).toBe("double-circle");
    });

    it("parses hexagon node {{text}}", () => {
      const result = expectFlowchart("graph TD\n  A{{Hexagon}}");
      expect(result.nodes[0].shape).toBe("hexagon");
    });

    it("parses asymmetric node >text]", () => {
      const result = expectFlowchart("graph TD\n  A>Async]");
      expect(result.nodes[0].shape).toBe("asymmetric");
    });

    it("parses cylinder node [(text)]", () => {
      const result = expectFlowchart("graph TD\n  A[(Database)]");
      expect(result.nodes[0].shape).toBe("cylinder");
      expect(result.nodes[0].label).toBe("Database");
    });

    it("parses subroutine node [[text]]", () => {
      const result = expectFlowchart("graph TD\n  A[[Sub]]");
      expect(result.nodes[0].shape).toBe("subroutine");
      expect(result.nodes[0].label).toBe("Sub");
    });
  });

  describe("edges", () => {
    it("parses arrow edge -->", () => {
      const result = expectFlowchart("graph TD\n  A --> B");
      expect(result.edges).toHaveLength(1);
      expect(result.edges[0]).toEqual({
        source: "A",
        target: "B",
        lineStyle: "solid",
        sourceMarker: "none",
        targetMarker: "arrow",
        label: undefined,
      });
    });

    it("parses dotted edge -.->", () => {
      const result = expectFlowchart("graph TD\n  A -.-> B");
      expect(result.edges[0].lineStyle).toBe("dotted");
      expect(result.edges[0].targetMarker).toBe("arrow");
    });

    it("parses thick edge ==>", () => {
      const result = expectFlowchart("graph TD\n  A ==> B");
      expect(result.edges[0].lineStyle).toBe("thick");
      expect(result.edges[0].targetMarker).toBe("arrow");
    });

    it("parses open edge ---", () => {
      const result = expectFlowchart("graph TD\n  A --- B");
      expect(result.edges[0].lineStyle).toBe("solid");
      expect(result.edges[0].sourceMarker).toBe("none");
      expect(result.edges[0].targetMarker).toBe("none");
    });

    it("parses edge with label -->|text|", () => {
      const result = expectFlowchart("graph TD\n  A -->|Yes| B");
      expect(result.edges[0].label).toBe("Yes");
    });

    it("parses edge chains A --> B --> C", () => {
      const result = expectFlowchart("graph TD\n  A --> B --> C");
      expect(result.edges).toHaveLength(2);
      expect(result.edges[0]).toMatchObject({ source: "A", target: "B" });
      expect(result.edges[1]).toMatchObject({ source: "B", target: "C" });
    });
  });

  describe("dual-end markers", () => {
    it("parses bidirectional arrow <-->", () => {
      const result = expectFlowchart("graph TD\n  A <--> B");
      expect(result.edges[0].sourceMarker).toBe("arrow");
      expect(result.edges[0].targetMarker).toBe("arrow");
      expect(result.edges[0].lineStyle).toBe("solid");
    });

    it("parses dot target --o", () => {
      const result = expectFlowchart("graph TD\n  A --o B");
      expect(result.edges[0].sourceMarker).toBe("none");
      expect(result.edges[0].targetMarker).toBe("dot");
      expect(result.edges[0].lineStyle).toBe("solid");
    });

    it("parses cross target --x", () => {
      const result = expectFlowchart("graph TD\n  A --x B");
      expect(result.edges[0].sourceMarker).toBe("none");
      expect(result.edges[0].targetMarker).toBe("cross");
      expect(result.edges[0].lineStyle).toBe("solid");
    });

    it("parses bidirectional dot o--o", () => {
      const result = expectFlowchart("graph TD\n  A o--o B");
      expect(result.edges[0].sourceMarker).toBe("dot");
      expect(result.edges[0].targetMarker).toBe("dot");
      expect(result.edges[0].lineStyle).toBe("solid");
    });

    it("parses bidirectional cross x--x", () => {
      const result = expectFlowchart("graph TD\n  A x--x B");
      expect(result.edges[0].sourceMarker).toBe("cross");
      expect(result.edges[0].targetMarker).toBe("cross");
      expect(result.edges[0].lineStyle).toBe("solid");
    });

    it("parses dot source + arrow target o-->", () => {
      const result = expectFlowchart("graph TD\n  A o--> B");
      expect(result.edges[0].sourceMarker).toBe("dot");
      expect(result.edges[0].targetMarker).toBe("arrow");
      expect(result.edges[0].lineStyle).toBe("solid");
    });

    it("parses dotted bidirectional <-.->", () => {
      const result = expectFlowchart("graph TD\n  A <-.-> B");
      expect(result.edges[0].sourceMarker).toBe("arrow");
      expect(result.edges[0].targetMarker).toBe("arrow");
      expect(result.edges[0].lineStyle).toBe("dotted");
    });

    it("parses dotted dot -.-o", () => {
      const result = expectFlowchart("graph TD\n  A -.-o B");
      expect(result.edges[0].targetMarker).toBe("dot");
      expect(result.edges[0].lineStyle).toBe("dotted");
    });

    it("parses dotted cross -.-x", () => {
      const result = expectFlowchart("graph TD\n  A -.-x B");
      expect(result.edges[0].targetMarker).toBe("cross");
      expect(result.edges[0].lineStyle).toBe("dotted");
    });

    it("parses thick bidirectional <==>", () => {
      const result = expectFlowchart("graph TD\n  A <==> B");
      expect(result.edges[0].sourceMarker).toBe("arrow");
      expect(result.edges[0].targetMarker).toBe("arrow");
      expect(result.edges[0].lineStyle).toBe("thick");
    });

    it("parses thick dot ==o", () => {
      const result = expectFlowchart("graph TD\n  A ==o B");
      expect(result.edges[0].targetMarker).toBe("dot");
      expect(result.edges[0].lineStyle).toBe("thick");
    });

    it("parses thick cross ==x", () => {
      const result = expectFlowchart("graph TD\n  A ==x B");
      expect(result.edges[0].targetMarker).toBe("cross");
      expect(result.edges[0].lineStyle).toBe("thick");
    });

    it("parses dotted bidirectional dot o-.-o", () => {
      const result = expectFlowchart("graph TD\n  A o-.-o B");
      expect(result.edges[0].sourceMarker).toBe("dot");
      expect(result.edges[0].targetMarker).toBe("dot");
      expect(result.edges[0].lineStyle).toBe("dotted");
    });

    it("parses thick bidirectional cross x==x", () => {
      const result = expectFlowchart("graph TD\n  A x==x B");
      expect(result.edges[0].sourceMarker).toBe("cross");
      expect(result.edges[0].targetMarker).toBe("cross");
      expect(result.edges[0].lineStyle).toBe("thick");
    });

    it("parses dot source + thick arrow o==>", () => {
      const result = expectFlowchart("graph TD\n  A o==> B");
      expect(result.edges[0].sourceMarker).toBe("dot");
      expect(result.edges[0].targetMarker).toBe("arrow");
      expect(result.edges[0].lineStyle).toBe("thick");
    });

    it("parses dot source + dotted arrow o-.->", () => {
      const result = expectFlowchart("graph TD\n  A o-.-> B");
      expect(result.edges[0].sourceMarker).toBe("dot");
      expect(result.edges[0].targetMarker).toBe("arrow");
      expect(result.edges[0].lineStyle).toBe("dotted");
    });

    it("parses thick bidirectional dot o==o", () => {
      const result = expectFlowchart("graph TD\n  A o==o B");
      expect(result.edges[0].sourceMarker).toBe("dot");
      expect(result.edges[0].targetMarker).toBe("dot");
      expect(result.edges[0].lineStyle).toBe("thick");
    });
  });

  describe("subgraphs", () => {
    it("parses subgraph with nodes", () => {
      const result = expectFlowchart(`
        graph TD
          subgraph Backend
            B1[Server 1]
            B2[Server 2]
          end
      `);
      expect(result.subgraphs).toHaveLength(1);
      expect(result.subgraphs[0].label).toBe("Backend");
      expect(result.subgraphs[0].nodes).toHaveLength(2);
      expect(result.subgraphs[0].nodes).toContain("B1");
      expect(result.subgraphs[0].nodes).toContain("B2");
    });

    it("does not include nodes defined outside", () => {
      const result = expectFlowchart(`
        graph TD
          A[Outside] --> B[Also Outside]
          subgraph Inner
            C[Inside]
            D[Also Inside]
          end
          C --> A
      `);
      expect(result.subgraphs).toHaveLength(1);
      expect(result.subgraphs[0].nodes).toHaveLength(2);
      expect(result.subgraphs[0].nodes).toContain("C");
      expect(result.subgraphs[0].nodes).toContain("D");
      expect(result.subgraphs[0].nodes).not.toContain("A");
      expect(result.subgraphs[0].nodes).not.toContain("B");
    });
  });

  describe("semicolons", () => {
    it("handles semicolons as statement separators", () => {
      const result = expectFlowchart("graph TD; A-->B; B-->C");
      expect(result.nodes).toHaveLength(3);
      expect(result.edges).toHaveLength(2);
    });
  });

  describe("complex diagrams", () => {
    it("parses a real-world flowchart", () => {
      const result = expectFlowchart(`
        graph TD
          A[Client] --> B[Load Balancer]
          B --> C[Server 1]
          B --> D[Server 2]
          C --> E[(Database)]
          D --> E
      `);
      expect(result.nodes).toHaveLength(5);
      expect(result.edges).toHaveLength(5);
      expect(result.nodes.find((n) => n.id === "A")?.label).toBe("Client");
      expect(result.nodes.find((n) => n.id === "B")?.label).toBe("Load Balancer");
    });
  });
});
