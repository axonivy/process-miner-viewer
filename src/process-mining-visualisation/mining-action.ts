import { Edge } from '@axonivy/process-editor';
import { Action, Command, CommandExecutionContext, CommandReturn, TYPES, distinctAdd } from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';

export interface MiningAction extends Action {
  kind: typeof MiningAction.KIND;
  data: MiningData;
}

export interface MiningData {
  processname: string;
  analysistype: string;
  numberofinstances: number;
  nodes: MiningNode[];
  timeframe: object;
}

export interface MiningNode {
  type: string;
  ID: string;
  relativevalue: number;
  labelvalue: string;
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

/**
 * "relativevalue": 0.75,
 * "labelvalue": "317"
 */

@injectable()
export class MiningCommand extends Command {
  static readonly KIND = MiningAction.KIND;
  constructor(@inject(TYPES.Action) protected readonly action: MiningAction) {
    super();
  }

  execute(context: CommandExecutionContext): CommandReturn {
    const model = context.root;
    this.action.data.nodes.forEach(node => {
      const element = model.index.getById(node.ID);
      if (element instanceof Edge) {
        if (element.args === undefined) {
          element.args = {};
        }
        element.args['labelvalue'] = node.labelvalue;
        element.args['relativevalue'] = node.relativevalue;
      }
      if (element?.cssClasses === undefined) {
        element!.cssClasses = [];
      }
      distinctAdd(element!.cssClasses, 'test');
    });

    return model;
  }
  undo(context: CommandExecutionContext): CommandReturn {
    throw new Error('Method not implemented.');
  }
  redo(context: CommandExecutionContext): CommandReturn {
    throw new Error('Method not implemented.');
  }
}
