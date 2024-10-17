# Axon Ivy Process Miner Viewer

This repository contains the Axon Ivy (GLSP-based) process miner viewer.

## Prerequisites

The following libraries/frameworks need to be installed on your system:

- [Node.js](https://nodejs.org/en/) `>= 20.10.0`

The viewer is developed using [Visual Studio Code](https://code.visualstudio.com/).
However, it's of course also possible to use another text editor.

### Launch config prerequisites

Project [workflow-demos](https://market.axonivy.com/workflow-demo) is required to be running in a [designer](https://dev.axonivy.com/download) on port 8081.

---

## Commands

```bash
#install node modules
npm install

#run the viewer
npm run dev

#build the vievwer
npm run package
```

## Running the process editor

To start the viewer, you can start the **Launch Viewer** config directly inside VS Code. For this to work, the project **workflow-demos** is required to be running in a designer on port 8081.

- **Mining-Data**:
  As default, mock-data from `http://localhost:3000/mock.json` is used.<br>
  To provide a URL for the mining-data the urlparameter **miningUrl** can be used e.g. `http://localhost/[url]&miningUrl=customUrl`

---

## Implementation in ivy project

TBD

---

## Mining visualization

All code to modify the mining visualization is located in [`src/process-mining-visualisation`](src/process-mining-visualisation).

[`di-config.ts`](src/process-mining-visualisation/di.config.ts)<br>
Used to register mining-action-handler, command and view to change the edge properties (color, width & label). Also adds a model for the diagram-captions.

[`action.ts`](src/process-mining-visualisation/action.ts)<br>
ActionHandler for the MiningAction

[`mining-action.ts`](src/process-mining-visualisation/mining-action.ts)<br>
MiningAction used to display mining-data. MiningCommand (execute) is called when MiningAction is fired. Adds 2 parameter (relativevalue, labelvalue) to each edge in mining-data used to change color, width and label. Further adds 2 DiagramCaptions to display a title and number of instances.

[`MiningView.tsx`](src/process-mining-visualisation/MiningView.tsx)<br>
Is called when rendering an Edge. If **labelvalue** and **relativevalue** exist, modifies edge by incresing stroke-width and color according to **relativevalue**. Uses the text from **labelvalue** as edge-label.

[`DiagramCaption.ts`](src/process-mining-visualisation/DiagramCaption.ts)<br>
Class used to display title and instances for diagram. Requires `canvasBounds`, `caption` and `location`

[`DiagramCaptionView.tsx`](src/process-mining-visualisation/DiagramCaptionView.tsx)<br>
Is called when rendering a DiagramCaption. Uses the `location` and `canvasBounds` to calculate location.

[`public/mock.json`](public/mock.json)<br>
mock-mining-data used when no miningUrl url-parameter is specified

The mining-action is fired in [`src/startup.ts`](src/startup.ts) after the model is initialized.

---

## More information

For more information about GLSP, please visit the [Eclipse GLSP Umbrella repository](https://github.com/eclipse-glsp/glsp) and the [Eclipse GLSP Website](https://www.eclipse.org/glsp/).
