// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';

export class View extends APIResource {
  /**
   * Gets the context information for the authenticated user
   *
   * @example
   * ```ts
   * const view = await client.v1.context.view.retrieve();
   * ```
   */
  retrieve(options?: RequestOptions): APIPromise<ViewRetrieveResponse> {
    return this._client.get('/api/v1/context/view', options);
  }

  /**
   * Fetches documents view for authenticated user with optional organization context
   *
   * @example
   * ```ts
   * const response = await client.v1.context.view.docs();
   * ```
   */
  docs(options?: RequestOptions): APIPromise<unknown> {
    return this._client.get('/api/v1/context/view/docs', options);
  }
}

export interface ViewRetrieveResponse {
  /**
   * List of context items
   */
  context?: Array<unknown>;
}

export type ViewDocsResponse = unknown;

export declare namespace View {
  export { type ViewRetrieveResponse as ViewRetrieveResponse, type ViewDocsResponse as ViewDocsResponse };
}
