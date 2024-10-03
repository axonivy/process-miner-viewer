import { IView, svg } from '@eclipse-glsp/client';
import { VNode } from 'snabbdom';
import { injectable } from 'inversify';
import { Edge } from '@axonivy/process-editor';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const JSX = { createElement: svg };
@injectable()
export class MiningView implements IView {
  render(handle: Edge): VNode | undefined {
    if (handle.args !== undefined && handle.args['relativevalue'] !== undefined) {
      console.log(handle);
    }
    return undefined;
  }
}
