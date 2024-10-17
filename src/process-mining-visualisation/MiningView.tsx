import {
  svg,
  RenderingContext,
  Point,
  EdgePadding,
  IViewArgs,
  IntersectingRoutedPoint,
  PolylineEdgeViewWithGapsOnIntersections,
  SEdgeImpl,
  angleOfPoint,
  toDegrees,
  GArgument
} from '@eclipse-glsp/client';
import { VNode } from 'snabbdom';
import { injectable } from 'inversify';
import { Edge } from '@axonivy/process-editor';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JSX = { createElement: svg };

@injectable()
export class MiningView extends PolylineEdgeViewWithGapsOnIntersections {
  protected renderLine(edge: Edge, segments: Point[], context: RenderingContext): VNode {
    if (GArgument.getString(edge, 'labelvalue')) {
      const label = edge.editableLabel;
      if (label) {
        label.text = edge.args!['labelvalue'].toString();
      }
    }
    const line = super.renderLine(edge, segments, context, undefined);
    let strokeWidth = '';
    let strokeColor = edge.color;
    if (GArgument.getString(edge, 'labelvalue') && GArgument.getNumber(edge, 'relativevalue')) {
      [strokeWidth, strokeColor] = this.getColorAndSize(edge);
      if (!line.data) {
        line.data = {};
      }
      line.data.style = { stroke: strokeColor, 'stroke-width': strokeWidth };
    }
    return line;
  }

  protected renderAdditionals(edge: Edge, segments: Point[], context: RenderingContext): VNode[] {
    const additionals = super.renderAdditionals(edge, segments, context);
    const edgePadding = this.edgePadding(edge);
    const edgePaddingNode = edgePadding ? [this.renderMouseHandle(segments, edgePadding)] : [];
    let strokeWidth = '';
    let strokeColor = edge.color;
    if (edge.args && edge.args['labelvalue'] && edge.args['relativevalue']) {
      [strokeWidth, strokeColor] = this.getColorAndSize(edge);
    }
    const p1 = segments[segments.length - 2];
    const p2 = segments[segments.length - 1];
    const arrow = (
      <path
        class-sprotty-edge={true}
        class-arrow={true}
        d='M 0.5,0 L 6,-3 L 6,3 Z'
        transform={`rotate(${toDegrees(angleOfPoint({ x: p1.x - p2.x, y: p1.y - p2.y }))} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`}
        style={{ stroke: strokeColor, fill: strokeColor, 'stroke-width': strokeWidth }}
      />
    );
    additionals.push(...edgePaddingNode, arrow);
    return additionals;
  }

  private edgePadding(edge: Edge) {
    if (edge.args) {
      return EdgePadding.from(edge);
    }
    return undefined;
  }

  protected renderMouseHandle(segments: Point[], padding: number): VNode {
    return (
      <path
        class-mouse-handle
        d={this.createPathForSegments(segments)}
        style-stroke-width={padding * 2}
        style-stroke='transparent'
        style-stroke-dasharray='none'
        style-stroke-dashoffset='0'
      />
    );
  }

  protected createPathForSegments(segments: Point[]): string {
    const firstPoint = segments[0];
    let path = `M ${firstPoint.x},${firstPoint.y}`;
    for (let i = 1; i < segments.length; i++) {
      const p = segments[i];
      path += ` L ${p.x},${p.y}`;
    }
    return path;
  }

  protected intersectionPath(edge: SEdgeImpl, segments: Point[], intersectingPoint: IntersectingRoutedPoint, args?: IViewArgs): string {
    try {
      return super.intersectionPath(edge, segments, intersectingPoint, args);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (ex) {
      // ingnore exception which can occur if one point of the segmet is NaN
      return '';
    }
  }

  protected getColorAndSize(edge: Edge): [string, string] {
    if (!edge.args) {
      return ['', ''];
    }
    const maxWidth = 20;
    const modifier = Number(edge.args['relativevalue']);
    const width = modifier * maxWidth;
    const colorValue = 255 - 255 * modifier;
    const color = '#0000' + colorValue.toString(16).split('.')[0].padStart(2, '0');
    return [width.toString(), color];
  }
}
