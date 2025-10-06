// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import { APIPromise } from '../../../core/api-promise';
import { buildHeaders } from '../../../internal/headers';
import { RequestOptions } from '../../../internal/request-options';

export class Memory extends APIResource {
  /**
   * Deletes memory context data based on provided parameters
   *
   * @example
   * ```ts
   * await client.v1.context.memory.delete();
   * ```
   */
  delete(body: MemoryDeleteParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/v1/context/memory/delete', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }

  /**
   * This endpoint adds memory context data, fetching chat history if needed.
   *
   * @example
   * ```ts
   * await client.v1.context.memory.add();
   * ```
   */
  add(body: MemoryAddParams, options?: RequestOptions): APIPromise<void> {
    return this._client.post('/api/v1/context/memory/add', {
      body,
      ...options,
      headers: buildHeaders([{ Accept: '*/*' }, options?.headers]),
    });
  }
}

export interface MemoryDeleteParams {
  /**
   * The ID of the memory to delete
   */
  memoryId?: string;

  /**
   * Optional organization ID
   */
  organization_id?: string | null;

  /**
   * Optional user ID
   */
  user_id?: string | null;
}

export interface MemoryAddParams {
  /**
   * Array of content objects with additional properties allowed
   */
  contents?: Array<MemoryAddParams.Content>;

  /**
   * The ID of the memory
   */
  memoryId?: string;
}

export namespace MemoryAddParams {
  export interface Content {
    content?: string;

    [k: string]: unknown;
  }
}

export declare namespace Memory {
  export { type MemoryDeleteParams as MemoryDeleteParams, type MemoryAddParams as MemoryAddParams };
}
