/**
 * Type definitions shared across the API layer.
 */

/** Shape of a stored transaction record. */
export interface TransactionRecord {
  partyId: string;
  encrypted: string;
}

/** POST /tx/encrypt — request body. */
export interface EncryptRequestBody {
  partyId: string;
  payload: Record<string, unknown>;
}

/** POST /tx/encrypt — response. */
export interface EncryptResponse {
  id: string;
  encrypted: string;
}

/** POST /tx/:id/decrypt — request body. */
export interface DecryptRequestBody {
  partyId: string;
}

/** POST /tx/:id/decrypt — response. */
export interface DecryptResponse {
  id: string;
  payload: Record<string, unknown>;
}

/** GET /tx/:id — response. */
export interface FetchResponse {
  id: string;
  partyId: string;
  encrypted: string;
}

/** Route params containing an id. */
export interface IdParam {
  id: string;
}
