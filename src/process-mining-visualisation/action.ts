import { GLSPActionDispatcher, type IActionHandler } from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { MiningAction } from './mining-action';

@injectable()
export class SetMiningActionHandler implements IActionHandler {
  @inject(GLSPActionDispatcher) protected actionDispatcher: GLSPActionDispatcher;
  handle = (): void => {
    this.actionDispatcher.dispatch(MiningAction.create());
  };
}
