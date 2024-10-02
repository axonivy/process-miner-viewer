import { Action, Command, CommandExecutionContext, CommandReturn, TYPES, distinctAdd } from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';

export interface MiningAction extends Action {
  kind: typeof MiningAction.KIND;
  data: MiningData;
}

export type MiningData = {
  processname: string;
  analysistype: string;
  numberofinstances: number;
  nodes: object[];
  timeframe: object;
};

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
  constructor(@inject(TYPES.Action) protected readonly action: MiningAction) {
    super();
  }

  execute(context: CommandExecutionContext): CommandReturn {
    const model = context.root;
    let element = model.index.getById('15254DC87A1B183B-f4');

    if (element?.cssClasses === undefined) {
      element!.cssClasses = [];
    }
    distinctAdd(element!.cssClasses, 'test');
    return model;
  }
  undo(context: CommandExecutionContext): CommandReturn {
    throw new Error('Method not implemented.');
  }
  redo(context: CommandExecutionContext): CommandReturn {
    throw new Error('Method not implemented.');
  }
}
