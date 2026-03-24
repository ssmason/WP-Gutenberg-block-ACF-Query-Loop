/**
 * Cypress E2E configuration for ACF Field block tests.
 *
 * Requires a running WordPress site with ACF and this plugin active. Copy cypress.env.json.example
 * to cypress.env.json and set baseUrl, WP_USER, WP_PASSWORD for your site.
 *
 * WP_PATH: /wp for Bedrock (default), "" for standard WordPress at docroot.
 * WP_REST_PREFIX: REST API path prefix (default /wp-json). Same site as popup uses root /wp-json;
 *   override if your install serves REST elsewhere (e.g. /wp/wp-json).
 *
 * Create a WordPress admin user matching WP_USER / WP_PASSWORD (e.g. via WP-CLI) before running tests.
 */

const { defineConfig } = require('cypress');

let baseUrl = process.env.CYPRESS_BASE_URL || 'http://localhost:8080';
let wpPath = process.env.CYPRESS_WP_PATH ?? '/wp'; // Bedrock: /wp. Standard WP: ''
let wpRestPrefix = process.env.CYPRESS_WP_REST_PREFIX ?? '/wp-json';
let envOverrides = {};
try {
  const env = require('./cypress.env.json');
  if (env.baseUrl) baseUrl = env.baseUrl;
  if (env.WP_PATH !== undefined) wpPath = env.WP_PATH;
  if (env.WP_USER) envOverrides.WP_USER = env.WP_USER;
  if (env.WP_PASSWORD) envOverrides.WP_PASSWORD = env.WP_PASSWORD;
  if (env.WP_REST_PREFIX !== undefined) wpRestPrefix = env.WP_REST_PREFIX;
} catch (e) {
  /* cypress.env.json optional */
}

module.exports = defineConfig({
  e2e: {
    baseUrl,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
  },
  env: {
    // Defaults match cypress.env.json.example (webgains-corporate Docker: create user via WP-CLI once).
    WP_USER: process.env.CYPRESS_WP_USER || envOverrides.WP_USER || 'cypress_test',
    WP_PASSWORD: process.env.CYPRESS_WP_PASSWORD || envOverrides.WP_PASSWORD || 'cypress_test',
    WP_PATH: wpPath,
    WP_REST_PREFIX: wpRestPrefix,
  },
});
