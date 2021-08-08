import LaunchLayer from './layer-launch';
import LoggerLayer from './layer-logger';
import MiddleLayer from './layer-middle';
import RouterLayer from './layer-router';
import StaticLayer from './layer-static';

export default {
  launch: LaunchLayer,
  logger: LoggerLayer,
  middle: MiddleLayer,
  router: RouterLayer,
  static: StaticLayer,
};
