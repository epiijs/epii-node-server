import launchLayer from './layer-launch';
import loggerLayer from './layer-logger';
import middleLayer from './layer-middle';
import actionLayer from './layer-action';
import staticLayer from './layer-static';

export default {
  launch: launchLayer,
  logger: loggerLayer,
  middle: middleLayer,
  action: actionLayer,
  static: staticLayer,
};
