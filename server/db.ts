import { initializeDatabase } from "./database";
export * from "./unified-schema";

/**
 * Legacy entry point for scripts that still import from "server/db".
 * Initializes the database using the shared helper and re-exports the
 * unified schema tables/types so there is only a single source of truth.
 */
export const db = await initializeDatabase();
