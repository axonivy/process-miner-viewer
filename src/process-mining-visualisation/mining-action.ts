import { Action, Command, CommandExecutionContext, CommandReturn, GModelRoot, TYPES, distinctAdd } from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';

export interface MiningAction extends Action {}

@injectable()
export class MiningCommand extends Command {
  constructor(@inject(TYPES.Action) protected readonly action: MiningAction) {
    super();
  }

  execute(context: CommandExecutionContext): CommandReturn {
    const model = context.root;
    console.log(model.index);
    let element = model.index.getById('1');
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
