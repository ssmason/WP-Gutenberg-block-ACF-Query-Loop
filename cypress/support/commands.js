/**
 * Custom Cypress commands for ACF Field Loop block tests.
 */

/**
 * Logs in to WordPress admin.
 */
Cypress.Commands.add('login', (username = 'admin', password = 'password') => {
  cy.session(
    [username, password],
    () => {
      cy.visit('/wp-login.php');
      cy.get('#user_login').type(username);
      cy.get('#user_pass').type(password);
      cy.get('#wp-submit').click();
      cy.url().should('include', '/wp-admin/');
    },
    { cacheAcrossSpecs: true }
  );
});

/**
 * Closes block editor welcome/template modal if present.
 */
Cypress.Commands.add('closeWelcomeModal', () => {
  cy.get('body').then(($body) => {
    const $close = $body.find('[aria-label="Close"]');
    if ($close.length) {
      cy.get('[aria-label="Close"]').first().click();
    }
  });
});

/**
 * Inserts a block by name.
 *
 * @param {string} blockName - e.g. 'satori-digital/acf-field'
 * @param {string} searchTerm - Search term for inserter
 */
Cypress.Commands.add('insertBlock', (blockName, searchTerm) => {
  const term = searchTerm || (blockName.includes('acf') ? 'ACF Field' : blockName);
  cy.get('[aria-label="Add block"], .editor-inserter__toggle, .block-editor-inserter__toggle')
    .first()
    .click();
  cy.get('[role="searchbox"], .components-search-control__input')
    .clear()
    .type(term);
  cy.get(`[data-type="${blockName}"]`).first().click();
});

/**
 * Adds ACF Field block inside a Query Loop template.
 * Assumes a Query Loop block exists and is selected, or we're in the template area.
 */
Cypress.Commands.add('addAcfFieldInsideQueryLoop', () => {
  cy.get('[aria-label="Add block"], .editor-inserter__toggle').first().click();
  cy.get('[role="searchbox"], .components-search-control__input').clear().type('ACF Field');
  cy.get('[data-type="satori-digital/acf-field"]').first().click();
});
