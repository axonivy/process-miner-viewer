import { Edge } from '@axonivy/process-editor';
import { Action, Bounds, Command, CommandExecutionContext, CommandReturn, TYPES, isBoundsAware } from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { DiagramCaption } from './DiagramCaption';
import { SModelRootImpl } from 'sprotty';

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

  execute(context: CommandExecutionContext): CommandReturn {
    const model = context.root;
    this.action.data.nodes.forEach(node => {
      const element = model.index.getById(node.id);
      if (element instanceof Edge) {
        if (element.args === undefined) {
          element.args = {};
        }
        element.args['labelvalue'] = node.labelValue.toString();
        element.args['relativevalue'] = node.relativeValue;
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
    return itemBounds.reduce((b1, b2) => Bounds.combine(b1, b2), Bounds.EMPTY);
  };
}
