import {
  Action,
  GLSPActionDispatcher,
  IActionHandler,
  IFeedbackActionDispatcher,
  ModelInitializationConstraint,
  TYPES
} from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { MiningAction } from './mining-action';

@injectable()
export class SetMiningActionHandler implements IActionHandler {
  @inject(TYPES.IFeedbackActionDispatcher) protected feedbackDispatcher: IFeedbackActionDispatcher;
  @inject(ModelInitializationConstraint) protected modelInitializationConstraint: ModelInitializationConstraint;

  handle(action: Action): Action | void {
    if (MiningAction.is(action.kind)) {
      this.modelInitializationConstraint.onInitialized(() => {
        this.feedbackDispatcher.registerFeedback(this, [action]);
      });
    }
  }
}

@injectable()
export class MiningActionHandler implements IActionHandler {
  @inject(GLSPActionDispatcher) protected actionDispatcher: GLSPActionDispatcher;
  handle = (_: Action): void => this.actionDispatcher.dispatchAfterNextUpdate(MiningAction.create());
}
