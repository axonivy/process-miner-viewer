import { FeatureModule, configureActionHandler, configureCommand, configureView } from '@eclipse-glsp/client';
import { MiningAction, MiningCommand } from './mining-action';
import { SetMiningActionHandler } from './action';
import { MiningView } from './view';

export const ivyMiningModule = new FeatureModule((bind, _unbind, isBound) => {
  configureActionHandler({ bind, isBound }, MiningAction.KIND, SetMiningActionHandler);
  configureCommand({ bind, isBound }, MiningCommand);
  configureView({ bind, isBound }, 'edge', MiningView);
});
