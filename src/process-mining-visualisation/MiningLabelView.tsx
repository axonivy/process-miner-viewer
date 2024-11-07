import { svg, RenderingContext, GLabelView } from '@eclipse-glsp/client';
import { VNode } from 'snabbdom';
import { injectable } from 'inversify';
import { MiningLabel } from './MiningLabel';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JSX = { createElement: svg };

@injectable()
export class MiningLabelView extends GLabelView {
  render(label: MiningLabel, context: RenderingContext): VNode | undefined {
    if (label.segments.length < 2) {
      return;
    }
    const props = this.getCircleProps(label.relativeValue);
    const segments = label.segments;
    const p1 = segments[segments.length - 2];
    const p2 = segments[segments.length - 1];
    const p = {
      x: p2.x - (p2.x - p1.x) / 2,
      y: p2.y - (p2.y - p1.y) / 2
    };
    if (p2.y - p1.y === 0) {
      p.x -= 3;
    } else {
      p.y -= 3;
    }
    return (
      <g>
        <circle cy={p.y} cx={p.x} stroke='var(--glsp-border)' fill={props.color} stroke-width='0' r={props.r}></circle>
        <text style={{ fill: props.textColor }} text-anchor='middle' dy='0.35em' x={p.x} y={p.y}>
          {label.text}
        </text>
      </g>
    );
  }

  getCircleProps = (value: number): { r: number; color: string; textColor: string } => {
    const props = { r: 10, color: 'white', textColor: 'black' };
    if (value <= 0.25) {
      props.r = 10;
      props.color = '#c8f0d4';
    } else if (value <= 0.5) {
      props.r = 11;
      props.color = '#87dea1';
    } else if (value <= 0.75) {
      props.r = 12;
      props.color = '#4ccd73';
    } else if (value <= 1) {
      props.r = 13;
      props.color = '#205630';
      props.textColor = '#ffffff';
    }
    return props;
  };
}