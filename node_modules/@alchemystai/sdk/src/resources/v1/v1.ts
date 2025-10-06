// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../core/resource';
import * as ContextAPI from './context/context';
import {
  Context,
  ContextAddParams,
  ContextAddResponse,
  ContextDeleteParams,
  ContextDeleteResponse,
  ContextSearchParams,
  ContextSearchResponse,
} from './context/context';
import * as OrgAPI from './org/org';
import { Org } from './org/org';

export class V1 extends APIResource {
  context: ContextAPI.Context = new ContextAPI.Context(this._client);
  org: OrgAPI.Org = new OrgAPI.Org(this._client);
}

V1.Context = Context;
V1.Org = Org;

export declare namespace V1 {
  export {
    Context as Context,
    type ContextDeleteResponse as ContextDeleteResponse,
    type ContextAddResponse as ContextAddResponse,
    type ContextSearchResponse as ContextSearchResponse,
    type ContextDeleteParams as ContextDeleteParams,
    type ContextAddParams as ContextAddParams,
    type ContextSearchParams as ContextSearchParams,
  };

  export { Org as Org };
}
