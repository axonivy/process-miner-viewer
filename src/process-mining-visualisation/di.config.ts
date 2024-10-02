import { FeatureModule, configureActionHandler, configureCommand } from '@eclipse-glsp/client';
import { MiningAction, MiningCommand } from './mining-action';
import { SetMiningActionHandler } from './action';

export const ivyMiningModule = new FeatureModule((bind, _unbind, isBound) => {
  configureActionHandler({ bind, isBound }, MiningAction.KIND, SetMiningActionHandler);
  configureCommand({ bind, isBound }, MiningCommand);
});
