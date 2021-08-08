/* eslint-disable global-require */

import FileRender from './render-file';
import JsonRender from './render-json';
import JumpRender from './render-jump';
import TextRender from './render-text';
import ViewRender from './render-view';

export default {
  file: FileRender,
  json: JsonRender,
  jump: JumpRender,
  text: TextRender,
  view: ViewRender,
};
