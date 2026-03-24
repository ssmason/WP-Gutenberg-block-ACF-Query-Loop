/**
 * Cypress support file – runs before every spec.
 * Imports custom commands and configures global behaviour.
 */

import './commands';

// Ignore uncaught exceptions (e.g. from WordPress/React internals).
Cypress.on('uncaught:exception', () => false);
