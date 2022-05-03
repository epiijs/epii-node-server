import { IRender } from '../kernel/render';

import FileRender from './render-file';
import JsonRender from './render-json';
import JumpRender from './render-jump';
import TextRender from './render-text';
import ViewRender from './render-view';

const renders: {
  [key in string]: IRender;
} = {
  file: FileRender,
  json: JsonRender,
  jump: JumpRender,
  text: TextRender,
  view: ViewRender,
};

export default renders;
