// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';
import { path } from '../../../internal/utils/path';

export class Traces extends APIResource {
  /**
   * Retrieves a list of traces for the authenticated user
   *
   * @example
   * ```ts
   * const traces = await client.v1.context.traces.list();
   * ```
   */
  list(options?: RequestOptions): APIPromise<TraceListResponse> {
    return this._client.get('/api/v1/context/traces', options);
  }

  /**
   * Deletes a data trace for the authenticated user with the specified trace ID
   *
   * @example
   * ```ts
   * const trace = await client.v1.context.traces.delete(
   *   'traceId',
   * );
   * ```
   */
  delete(traceID: string, options?: RequestOptions): APIPromise<TraceDeleteResponse> {
    return this._client.delete(path`/api/v1/context/traces/${traceID}/delete`, options);
  }
}

export interface TraceListResponse {
  traces?: Array<TraceListResponse.Trace>;
}

export namespace TraceListResponse {
  export interface Trace {
    _id?: string;

    createdAt?: string;

    data?: unknown;

    type?: string;

    updatedAt?: string;

    userId?: string;
  }
}

export interface TraceDeleteResponse {
  /**
   * The deleted trace data
   */
  trace?: unknown;
}

export declare namespace Traces {
  export { type TraceListResponse as TraceListResponse, type TraceDeleteResponse as TraceDeleteResponse };
}
