import { Bounds, GLabel } from '@eclipse-glsp/client';

export class DiagramCaption extends GLabel {
  static readonly TYPE = 'diagram-caption';
  constructor(
    public readonly canvasBounds: Bounds = Bounds.EMPTY,
    public readonly caption: string = '',
    public readonly location: 'start' | 'end' = 'start',
    public readonly type: string = DiagramCaption.TYPE
  ) {
    super();
  }
}
