// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { APIResource } from '../../../core/resource';
import * as MemoryAPI from './memory';
import { Memory, MemoryAddParams, MemoryDeleteParams } from './memory';
import * as TracesAPI from './traces';
import { TraceDeleteResponse, TraceListResponse, Traces } from './traces';
import * as ViewAPI from './view';
import { View, ViewDocsResponse, ViewRetrieveResponse } from './view';
import { APIPromise } from '../../../core/api-promise';
import { RequestOptions } from '../../../internal/request-options';

export class Context extends APIResource {
  traces: TracesAPI.Traces = new TracesAPI.Traces(this._client);
  view: ViewAPI.View = new ViewAPI.View(this._client);
  memory: MemoryAPI.Memory = new MemoryAPI.Memory(this._client);

  /**
   * Deletes context data based on provided parameters
   *
   * @example
   * ```ts
   * const context = await client.v1.context.delete();
   * ```
   */
  delete(body: ContextDeleteParams, options?: RequestOptions): APIPromise<unknown> {
    return this._client.post('/api/v1/context/delete', { body, ...options });
  }

  /**
   * This endpoint accepts context data and sends it to a context processor for
   * further handling. It returns a success or error response depending on the result
   * from the context processor.
   *
   * @example
   * ```ts
   * const response = await client.v1.context.add();
   * ```
   */
  add(body: ContextAddParams, options?: RequestOptions): APIPromise<unknown> {
    return this._client.post('/api/v1/context/add', { body, ...options });
  }

  /**
   * This endpoint sends a search request to the context processor to retrieve
   * relevant context data based on the provided query.
   *
   * @example
   * ```ts
   * const response = await client.v1.context.search({
   *   minimum_similarity_threshold: 0.5,
   *   query: 'search query for user preferences',
   *   similarity_threshold: 0.8,
   * });
   * ```
   */
  search(body: ContextSearchParams, options?: RequestOptions): APIPromise<ContextSearchResponse> {
    return this._client.post('/api/v1/context/search', { body, ...options });
  }
}

export type ContextDeleteResponse = unknown;

export type ContextAddResponse = unknown;

export interface ContextSearchResponse {
  contexts?: Array<ContextSearchResponse.Context>;
}

export namespace ContextSearchResponse {
  export interface Context {
    content?: string;

    createdAt?: string;

    metadata?: unknown;

    score?: number;

    updatedAt?: string;
  }
}

export interface ContextDeleteParams {
  /**
   * Flag to delete by document
   */
  by_doc?: boolean | null;

  /**
   * Flag to delete by ID
   */
  by_id?: boolean | null;

  /**
   * Optional organization ID
   */
  organization_id?: string | null;

  /**
   * Source identifier for the context
   */
  source?: string;

  /**
   * Optional user ID
   */
  user_id?: string | null;
}

export interface ContextAddParams {
  /**
   * Type of context being added
   */
  context_type?: 'resource' | 'conversation' | 'instruction';

  /**
   * Array of documents with content and additional metadata
   */
  documents?: Array<ContextAddParams.Document>;

  /**
   * Additional metadata for the context
   */
  metadata?: ContextAddParams.Metadata;

  /**
   * Scope of the context
   */
  scope?: 'internal' | 'external';

  /**
   * The source of the context data
   */
  source?: string;
}

export namespace ContextAddParams {
  export interface Document {
    /**
     * The content of the document
     */
    content?: string;

    [k: string]: string | undefined;
  }

  /**
   * Additional metadata for the context
   */
  export interface Metadata {
    /**
     * Name of the file
     */
    fileName?: string;

    /**
     * Size of the file in bytes
     */
    fileSize?: number;

    /**
     * Type/MIME of the file
     */
    fileType?: string;

    /**
     * Last modified timestamp
     */
    lastModified?: string;
  }
}

export interface ContextSearchParams {
  /**
   * Minimum similarity threshold
   */
  minimum_similarity_threshold: number;

  /**
   * The search query used to search for context data
   */
  query: string;

  /**
   * Maximum similarity threshold (must be >= minimum_similarity_threshold)
   */
  similarity_threshold: number;

  /**
   * Additional metadata for the search
   */
  metadata?: unknown;

  /**
   * Search scope
   */
  scope?: 'internal' | 'external';

  /**
   * The ID of the user making the request
   */
  user_id?: string;
}

Context.Traces = Traces;
Context.View = View;
Context.Memory = Memory;

export declare namespace Context {
  export {
    type ContextDeleteResponse as ContextDeleteResponse,
    type ContextAddResponse as ContextAddResponse,
    type ContextSearchResponse as ContextSearchResponse,
    type ContextDeleteParams as ContextDeleteParams,
    type ContextAddParams as ContextAddParams,
    type ContextSearchParams as ContextSearchParams,
  };

  export {
    Traces as Traces,
    type TraceListResponse as TraceListResponse,
    type TraceDeleteResponse as TraceDeleteResponse,
  };

  export {
    View as View,
    type ViewRetrieveResponse as ViewRetrieveResponse,
    type ViewDocsResponse as ViewDocsResponse,
  };

  export {
    Memory as Memory,
    type MemoryDeleteParams as MemoryDeleteParams,
    type MemoryAddParams as MemoryAddParams,
  };
}
