import { FeatureModule, configureActionHandler, configureCommand, configureView, configureModelElement } from '@eclipse-glsp/client';
import { MiningAction, MiningCommand } from './mining-action';
import { SetMiningActionHandler } from './action';
import { MiningView } from './MiningView';
import { DiagramCaption } from './DiagramCaption';
import { DiagramCaptionView } from './DiagramCaptionView';
import { MiningLabelView } from './MiningLabelView';

export const ivyMiningModule = new FeatureModule((bind, _unbind, isBound) => {
  configureActionHandler({ bind, isBound }, MiningAction.KIND, SetMiningActionHandler);
  configureCommand({ bind, isBound }, MiningCommand);
  configureView({ bind, isBound }, 'edge', MiningView);
  configureView({ bind, isBound }, 'edge:label:mining', MiningLabelView);
  configureModelElement({ bind, isBound }, DiagramCaption.TYPE, DiagramCaption, DiagramCaptionView);
});
