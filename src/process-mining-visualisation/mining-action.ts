import { Edge } from '@axonivy/process-editor';
import { Action, Bounds, Command, CommandExecutionContext, CommandReturn, GLabel, TYPES, isBoundsAware } from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { DiagramCaption } from './DiagramCaption';
import { EdgeRouterRegistry, RoutedPoint, SModelRootImpl } from 'sprotty';
import { MiningLabel } from './MiningLabel';

export interface MiningAction extends Action {
  kind: typeof MiningAction.KIND;
}

export interface Period {
  start: string;
  end: string;
}

export interface MiningData {
  processName: string;
  analysisType: string;
  numberOfInstances: number;
  nodes: MiningNode[];
  timeFrame: Period;
}

export interface MiningNode {
  type: string;
  id: string;
  relativeValue: number;
  labelValue: number;
}

@injectable()
export class MiningUrl {
  readonly url: string;
}

export namespace MiningAction {
  export const KIND = 'minigCommand';
  export function create(): MiningAction {
    return {
      kind: KIND
    };
  }

  export function is(object: unknown): object is MiningAction {
    return Action.hasKind(object, KIND);
  }
}

@injectable()
export class MiningCommand extends Command {
  static readonly KIND = MiningAction.KIND;
  @inject(MiningUrl) protected miningData: MiningUrl;
  constructor(@inject(TYPES.Action) protected readonly action: MiningAction) {
    super();
  }

  @inject(EdgeRouterRegistry) edgeRouterRegistry: EdgeRouterRegistry;

  execute(context: CommandExecutionContext): CommandReturn {
    const model = context.root;
    if (model.children.filter(e => e.type === DiagramCaption.TYPE).length > 0) {
      return model;
    }
    return this.populate(model);
  }

  async populate(model: SModelRootImpl) {
    const data: MiningData = await (await fetch(this.miningData.url)).json();
    data.nodes.forEach(node => {
      const edge = model.index.getById(node.id);
      if (edge instanceof Edge) {
        const segments = this.edgeRouterRegistry.route(edge, edge.args);
        const miningLabel = new MiningLabel(node.labelValue.toString(), node.relativeValue, segments);
        this.moveExistingLabel(edge.editableLabel as GLabel, segments);
        edge.add(miningLabel);
      }
    });
    const bounds = this.getModelBounds(model);
    const startCaption = new DiagramCaption(bounds, `Analysis of ${data.processName}`, 'start');
    const endCaption = new DiagramCaption(
      bounds,
      `${data.numberOfInstances} instances (investigation period: ${new Date(data.timeFrame.start).toDateString()} - ${new Date(
        data.timeFrame.end
      ).toDateString()})`,
      'end'
    );
    model.add(startCaption);
    model.add(endCaption);
    return model;
  }

  undo(context: CommandExecutionContext): CommandReturn {
    const model = context.root;
    model.removeAll(e => e.type === MiningLabel.TYPE);
    model.removeAll(e => e.type === DiagramCaption.TYPE);
    return model;
  }
  redo(context: CommandExecutionContext): CommandReturn {
    return this.execute(context);
  }

  getModelBounds = (model: SModelRootImpl): Bounds => {
    const itemBounds: Bounds[] = model.children.filter(isBoundsAware).map(e => e['bounds']);
    const bounds = { x: 0, y: 0, width: 0, height: 0 };
    itemBounds.forEach(b => {
      bounds.x = Math.min(bounds.x, b.x);
      bounds.y = Math.min(bounds.y, b.y);
      bounds.width = Math.max(bounds.width, b.x);
      bounds.height = Math.max(bounds.height, b.y + b.height);
    });
    return bounds;
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
      const yOffset = p2.y - p1.y;
      if (xOffset > yOffset) {
        p.y += 30 - distance;
      } else {
        p.x += 30 - distance;
      }
      label.position = p;
    }
  };
}
