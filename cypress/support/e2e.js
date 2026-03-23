/**
 * Cypress support file – runs before every spec.
 */

import './commands';

Cypress.on('uncaught:exception', () => false);
