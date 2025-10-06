// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as ContextAPI from './context';
import { Context, ContextViewParams, ContextViewResponse } from './context';

export class Org extends APIResource {
  context: ContextAPI.Context = new ContextAPI.Context(this._client);
}

Org.Context = Context;

export declare namespace Org {
  export {
    Context as Context,
    type ContextViewResponse as ContextViewResponse,
    type ContextViewParams as ContextViewParams,
  };
}
