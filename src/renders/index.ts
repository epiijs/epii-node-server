import { IRender } from '../types';

import fileRender from './render-file';
import jsonRender from './render-json';
import jumpRender from './render-jump';
import textRender from './render-text';
import viewRender from './render-view';

const renders: {
  [key in string]: IRender;
} = {
  file: fileRender,
  json: jsonRender,
  jump: jumpRender,
  text: textRender,
  view: viewRender,
};

export default renders;
