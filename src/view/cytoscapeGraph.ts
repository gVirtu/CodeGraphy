import { processData } from "./dataProcessor";
import { setWindowSize } from "../utils/windowHelper";
import cytoscape from "cytoscape";
// @ts-ignore
import cypopper from "cytoscape-popper";

// @ts-ignore
import coseBilkent from "../build/cytoscape-cose-bilkent";
// @ts-ignore
import fcose from "../build/cytoscape-fcose";
// @ts-ignore
import cola from "../build/cytoscape-cola";

cytoscape.use(cypopper);
cytoscape.use(coseBilkent);
cytoscape.use(fcose);
cytoscape.use(cola);

// @ts-ignore
window.process = {
  env: {
    NODE_ENV: "development",
  },
};

// IMPORTS
// @ts-ignore
const nodeFiles = files;
// @ts-ignore
const nodeConnections = connections;

let nodes = processData(nodeFiles, nodeConnections);

// SETUP
let layout: any;
let lastLayout = "cose";

// CYTOSCAPE SETUP
var cy = cytoscape({
  container: document.getElementById("cy"),
  elements: nodes,
  style: [
    {
      selector: "node",
      style: {
        shape: "heptagon",
        "background-color": "#4a4a4c",
        label: "data(label)",
      },
    },
    {
      selector: "edge",
      style: {
        width: 2,
        "line-color": "#d4d4d4",
        "target-arrow-color": "#d4d4d4",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
      },
    },
    {
      selector: "label",
      style: {
        color: "#d4d4d4",
        fontSize: 12,
      },
    },
  ],
  layout: {
    name: "cose",
  },
  ready: function () {
    this.layout({
      name: "cose",
      animate: "end",
      animationEasing: "ease-out",
      animationDuration: 1000,
    }).run();
  },

  // initial viewport state:
  zoom: 1,
  pan: { x: 0, y: 0 },

  // interaction options:
  minZoom: 1 / 2,
  maxZoom: 2,
  zoomingEnabled: true,
  userZoomingEnabled: true,
  panningEnabled: true,
  userPanningEnabled: true,
  boxSelectionEnabled: true,
  selectionType: "single",
  touchTapThreshold: 8,
  desktopTapThreshold: 4,
  autolock: false,
  autoungrabify: false,
  autounselectify: false,

  // rendering options:
  headless: false,
  styleEnabled: true,
  hideEdgesOnViewport: false,
  textureOnViewport: false,
  motionBlur: false,
  motionBlurOpacity: 0.2,
  pixelRatio: "auto",
} as any);

// LAYOUT SETUP
const setLayout = (layoutName: string) => {
  if (layoutName === "reload") {
    setWindowSize();
  } else {
    lastLayout = layoutName;
  }

  layout = cy.layout({
    name: layoutName === "reload" ? lastLayout : layoutName,
    animate: "end",
    animationEasing: "ease-out",
    animationDuration: 1000,
    randomize: false,
    infinite: true,
  } as any);
};

// SELECT EVENT LISTENERS
const select = document.getElementById("sorting-options") as HTMLSelectElement;
let sortingOption = select.options[select.selectedIndex].value;

select.onchange = () => {
  sortingOption = select.options[select.selectedIndex].value;
  reload(sortingOption);
};

// RELOAD EVENT LISTENERS
document?.getElementById("reload")?.addEventListener("click", function () {
  reload(sortingOption);
});

// WINDOW SIZE SETUP
setWindowSize();

// CLICK NODE EVENT
cy.on("click", "node", function (event) {
  const id = event.target.id();

  const path = nodes[id].data.fullPath;

  // @ts-ignore
  openFile(path);
});

// HOVER EVENT LISTENERS
let canUseHover = true;
const hoverSwitch = document?.getElementById(
  "hover-switch"
) as HTMLInputElement;
hoverSwitch.onchange = () => {
  canUseHover = !canUseHover;
};

// HOVER NODE EVENT
cy.on("mouseover", "node", function (event) {
  if (canUseHover) {
    event.target.popperRefObj = event.target.popper({
      content: () => {
        let content = document.createElement("div");

        content.classList.add("popper-div");

        const nodeData = event.target.data();

        content.innerHTML = `
        <h3>${nodeData.label}</h3>
        <p>Id: ${nodeData.id}</p>
        <p>Path: ${nodeData.fullPath}</p>
      `;

        document.body.appendChild(content);
        return content;
      },
    });
  }
});

cy.on("mouseout", "node", function (event) {
  if (event.target.popper) {
    event.target.popperRefObj.state.elements.popper.remove();
    event.target.popperRefObj.destroy();
  }
});

const reload = (layoutOption: string) => {
  if (layout) {
    layout.stop();
  }

  setLayout(layoutOption);

  layout.run();
};
