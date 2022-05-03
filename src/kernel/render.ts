import { Context } from 'koa';

export interface IActionResult {
  type: string;
}

export type OutputActionResultFn = (ctx: Context, result: IActionResult) => Promise<void>;
export type CreateActionResultFn = (...args: any) => IActionResult;

export interface IRender {
  createActionResult: CreateActionResultFn;
  outputActionResult: OutputActionResultFn;
}