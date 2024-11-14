import { RenderingContext, svg, GLabelView } from '@eclipse-glsp/client';
import { DiagramCaption } from './DiagramCaption';
import { injectable } from 'inversify';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JSX = { createElement: svg };

@injectable()
export class DiagramCaptionView extends GLabelView {
  render(node: DiagramCaption, context: RenderingContext) {
    const x = node.canvasBounds.x;
    let y = node.canvasBounds.y - 20;
    if (node.location === 'end') {
      y = node.canvasBounds.height + 90;
    }
    return (
      <g>
        <text class-diagram-caption={true} class-sprotty-label={true} x={x} y={y}>
          {node.caption}
        </text>
      </g>
    );
  }
}
