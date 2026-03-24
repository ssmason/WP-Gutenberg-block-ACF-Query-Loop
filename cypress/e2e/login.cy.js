/**
 * Login test – verifies WP credentials work before running block tests.
 * Uses WP_PATH from cypress.config / cypress.env.json (Bedrock: /wp; vanilla: "").
 */
describe('Login', () => {
  it('logs in and reaches wp-admin', () => {
    cy.login();
    cy.visitWpAdmin();
    cy.url().should('include', '/wp-admin/');
    cy.url().should('not.include', 'wp-login');
    cy.contains('Dashboard', { timeout: 15000 }).should('be.visible');
  });
});
