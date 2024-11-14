import { Edge } from '@axonivy/process-editor';
import { Action, Bounds, Command, CommandExecutionContext, CommandReturn, GLabel, TYPES, isBoundsAware } from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { DiagramCaption } from './DiagramCaption';
import { EdgeRouterRegistry, RoutedPoint, SModelRootImpl } from 'sprotty';
import { MiningLabel } from './MiningLabel';

export interface MiningAction extends Action {
  kind: typeof MiningAction.KIND;
  data: MiningData;
}

export interface MiningData {
  processName: string;
  analysisType: string;
  numberOfInstances: number;
  nodes: MiningNode[];
  timeFrame: period;
}

export interface MiningNode {
  type: string;
  id: string;
  relativeValue: number;
  labelValue: number;
}

export interface period {
  start: string;
  end: string;
}

export namespace MiningAction {
  export const KIND = 'minigCommand';
  export function create(options: { data: MiningData }): MiningAction {
    return {
      kind: KIND,
      ...options
    };
  }

  export function is(object: any): object is MiningAction {
    return Action.hasKind(object, KIND);
  }
}

@injectable()
export class MiningCommand extends Command {
  static readonly KIND = MiningAction.KIND;
  startCaption: DiagramCaption;
  endCaption: DiagramCaption;
  constructor(@inject(TYPES.Action) protected readonly action: MiningAction) {
    super();
  }

  @inject(EdgeRouterRegistry) edgeRouterRegistry: EdgeRouterRegistry;

  execute(context: CommandExecutionContext): CommandReturn {
    const model = context.root;
    this.action.data.nodes.forEach(node => {
      const edge = model.index.getById(node.id);
      if (edge instanceof Edge) {
        const segments = this.edgeRouterRegistry.route(edge, edge.args);
        const miningLabel = new MiningLabel(node.labelValue.toString(), node.relativeValue, segments);
        this.moveExistingLabel(edge.editableLabel as GLabel, segments);
        edge.add(miningLabel);
      }
    });
    const bounds = this.getModelBounds(model);
    this.startCaption = new DiagramCaption(bounds, `Analysis of ${this.action.data.processName}`, 'start');
    this.endCaption = new DiagramCaption(
      bounds,
      `${this.action.data.numberOfInstances} instances (investigation period: ${new Date(
        this.action.data.timeFrame.start
      ).toDateString()} - ${new Date(this.action.data.timeFrame.end).toDateString()})`,
      'end'
    );
    model.add(this.startCaption);
    model.add(this.endCaption);
    return model;
  }

  undo(context: CommandExecutionContext): CommandReturn {
    const model = context.root;
    this.action.data.nodes.forEach(node => {
      const element = model.index.getById(node.id);
      if (element instanceof Edge) {
        if (element.args !== undefined) {
          delete element.args['labelvalue'];
          delete element.args['relativevalue'];
        }
      }
    });
    model.remove(this.startCaption);
    model.remove(this.endCaption);
    return model;
  }
  redo(context: CommandExecutionContext): CommandReturn {
    return this.execute(context);
  }

  getModelBounds = (model: SModelRootImpl): Bounds => {
    const itemBounds: Bounds[] = model.children.filter(isBoundsAware).map(e => e['bounds']);
    const maxY = Math.max(...itemBounds.map(e => e.y));
    const maxX = Math.max(...itemBounds.map(e => e.x));
    const minX = Math.min(...itemBounds.map(e => e.x));
    const minY = Math.min(...itemBounds.map(e => e.y));
    return { x: minX, y: minY, height: maxY, width: maxX };
  };

  moveExistingLabel = (label: GLabel, segments: Array<RoutedPoint>) => {
    if (!label || label.text === '' || segments.length < 2) {
      return;
    }
    const p1 = segments[segments.length - 2];
    const p2 = segments[segments.length - 1];
    const p = { ...label.position };
    const pM = {
      x: p2.x - (p2.x - p1.x) / 2,
      y: p2.y - (p2.y - p1.y) / 2
    };
    const distance = Math.sqrt(Math.pow(p.x - pM.x, 2) + Math.pow(p.y - pM.y, 2));
    if (distance < 30) {
      const xOffset = p2.x - p1.x;
      if (xOffset > 0) {
        p.x -= 10;
      } else {
        p.y -= 10;
      }
      label.position = p;
    }
  };
}
