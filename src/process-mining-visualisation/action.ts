import { Action, GLSPActionDispatcher, IActionHandler } from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { MiningAction } from './mining-action';

@injectable()
export class SetMiningActionHandler implements IActionHandler {
  @inject(GLSPActionDispatcher) protected actionDispatcher: GLSPActionDispatcher;
  handle = (_: Action): void => {
    this.actionDispatcher.dispatch(MiningAction.create());
  };
}
