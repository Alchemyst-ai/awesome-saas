// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { AlchemystAI } from '../client';

export abstract class APIResource {
  protected _client: AlchemystAI;

  constructor(client: AlchemystAI) {
    this._client = client;
  }
}
