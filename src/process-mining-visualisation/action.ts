import { Action, IActionHandler, IFeedbackActionDispatcher, ModelInitializationConstraint, TYPES } from '@eclipse-glsp/client';
import { inject, injectable } from 'inversify';
import { MiningAction } from './mining-action';

@injectable()
export class SetMiningActionHandler implements IActionHandler {
  @inject(TYPES.IFeedbackActionDispatcher) protected feedbackDispatcher: IFeedbackActionDispatcher;
  @inject(ModelInitializationConstraint) protected modelInitializationConstraint: ModelInitializationConstraint;

  handle(action: Action): Action | void {
    if (MiningAction.is(action.kind)) {
      const miningAction = MiningAction.create({ data: (action as MiningAction).data });
      this.modelInitializationConstraint.onInitialized(() => {
        this.feedbackDispatcher.registerFeedback(this, [miningAction]);
      });
    }
  }
}
