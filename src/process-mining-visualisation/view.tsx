import { GEdge, svg, RenderingContext, GEdgeView } from '@eclipse-glsp/client';
import { VNode } from 'snabbdom';
import { injectable } from 'inversify';
import { EdgeLabel } from '@axonivy/process-editor';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JSX = { createElement: svg };
@injectable()
export class MiningView extends GEdgeView {
  render(edge: Readonly<GEdge>, context: RenderingContext): VNode {
    if (edge.args && edge.args['labelvalue'] !== undefined && edge.children.length > 0) {
      const label = edge.children[0];
      if (label instanceof EdgeLabel) {
        label.text = edge.args['labelvalue'].toString();
        label.localToParent(edge.bounds);
      }
    }

    const router = this.edgeRouterRegistry.get(edge.routerKind);
    const route = router.route(edge);
    return (
      <g class-sprotty-edge={true} class-mouseover={edge.hoverFeedback} {...this.additionalClasses(edge, context)}>
        {this.renderLine(edge, route, context)}
        {this.renderAdditionals(edge, route, context)}
        {context.renderChildren(edge, { route })}
      </g>
    );
  }
}
