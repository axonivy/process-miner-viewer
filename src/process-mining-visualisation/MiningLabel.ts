import { EdgeLabel } from '@axonivy/process-editor';
import { RoutedPoint } from '@eclipse-glsp/client';

export class MiningLabel extends EdgeLabel {
  static readonly TYPE = 'edge:label:mining';
  constructor(
    public readonly text: string = '',
    public readonly relativeValue: number = 0,
    public readonly segments: Array<RoutedPoint> = [],
    public readonly type: string = MiningLabel.TYPE
  ) {
    super();
  }
}
