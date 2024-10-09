import { RenderingContext, IView, svg } from '@eclipse-glsp/client';
import { DiagramCaption } from './DiagramCaption';
import { injectable } from 'inversify';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JSX = { createElement: svg };

@injectable()
export class DiagramCaptionView implements IView {
  render(node: DiagramCaption, context: RenderingContext) {
    let x = node.canvasBounds.x + 20;
    let y = node.canvasBounds.y + 20;
    if (node.location === 'end') {
      y = node.canvasBounds.height - 20;
    }
    return (
      <g>
        <text class-sprotty-label={true} x={x} y={y}>
          {node.caption}
        </text>
      </g>
    );
  }
}
