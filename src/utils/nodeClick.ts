import { processData } from "./dataProcessor";
import { reload } from "../utils/cytoscapeHelper";

// @ts-ignore
const nodeFiles = files;
// @ts-ignore
const nodeConnections = connections;

// SETUP
let nodes = processData(nodeFiles, nodeConnections);

export const runNodeClick = (cy: any, cyRelative: any) => {
  // CLICK NODE EVENT
  cy.on("click", "node", function (event: any) {
    const id = event.target.id();

    const path = nodes[id].data.fullPath;

    // update style of clicked node
    cy.nodes().forEach((node: any) => {
      node.classes("node");
    });
    event.target.classes("selectedNode");

    // change relative graph
    let relativeNodes = processData(nodeFiles, nodeConnections, 1, path);
    cyRelative.elements().remove();
    cyRelative.add(relativeNodes);
    cyRelative.nodes()[0].classes("selectedNode");
    reload(cyRelative, "reload");

    // @ts-ignore
    openFile(path);
  });
};
