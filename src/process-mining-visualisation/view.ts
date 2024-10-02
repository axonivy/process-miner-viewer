import { ShapeView } from '@eclipse-glsp/client';
import { VNode } from 'snabbdom';
import { injectable } from 'inversify';

@injectable()
export class MiningView extends ShapeView {
  render(): VNode | undefined {
    return undefined;
  }
}
