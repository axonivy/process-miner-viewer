import {
  FeatureModule,
  SetModelAction,
  UpdateModelAction,
  configureActionHandler,
  configureCommand,
  configureModelElement
} from '@eclipse-glsp/client';
import { MiningAction, MiningCommand } from './mining-action';
import { MiningActionHandler, SetMiningActionHandler } from './action';
import { DiagramCaption } from './DiagramCaption';
import { DiagramCaptionView } from './DiagramCaptionView';
import { MiningLabelView } from './MiningLabelView';
import { MiningLabel } from './MiningLabel';

export const ivyMiningModule = new FeatureModule((bind, _unbind, isBound) => {
  configureActionHandler({ bind, isBound }, UpdateModelAction.KIND, MiningActionHandler);
  configureActionHandler({ bind, isBound }, SetModelAction.KIND, MiningActionHandler);
  configureActionHandler({ bind, isBound }, MiningAction.KIND, SetMiningActionHandler);
  configureCommand({ bind, isBound }, MiningCommand);
  configureModelElement({ bind, isBound }, MiningLabel.TYPE, MiningLabel, MiningLabelView);
  configureModelElement({ bind, isBound }, DiagramCaption.TYPE, DiagramCaption, DiagramCaptionView);
});
