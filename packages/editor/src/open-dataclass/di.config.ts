import { FeatureModule, TYPES } from '@eclipse-glsp/client';
import { OpenDataClassKeyListener } from './key-listener';
import { IVY_TYPES } from '../types';
import { OpenDataClassButtonProvider } from './toolbar-button';

const ivyOpenDataClassModule = new FeatureModule(bind => {
  bind(TYPES.KeyListener).to(OpenDataClassKeyListener);
  bind(IVY_TYPES.ToolBarButtonProvider).to(OpenDataClassButtonProvider);
});

export default ivyOpenDataClassModule;
