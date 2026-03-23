/**
 * ACF Field block – Frontend render tests.
 *
 * Verifies block output on the frontend. Requires:
 * - ACF with field groups attached to post type
 * - Page with Query Loop containing ACF Field block (or at least ACF Field on page)
 *
 * For full E2E with field values, create a post with ACF data and a page
 * with Query Loop + ACF Field in the template.
 */

const BLOCK_NAME = 'satori-digital/acf-field';

/**
 * Creates a page with ACF Field block and publishes.
 */
function createPageWithAcfField() {
  cy.login();
  cy.visit('/wp-admin/post-new.php?post_type=page');
  cy.closeWelcomeModal();
  cy.get('.edit-post-visual-editor, .editor-styles-wrapper').should('be.visible');

  cy.insertBlock(BLOCK_NAME);
  cy.get(`[data-type="${BLOCK_NAME}"]`).first().click();
  cy.get('.components-panel__body').contains('ACF Field').click();
  cy.get('select').first().then(($select) => {
    const options = $select.find('option');
    if (options.length > 1) {
      cy.get('select').first().select(options.eq(1).val());
    }
  });

  cy.get('.editor-post-publish-button, .editor-post-publish-panel__toggle').first().click();
  cy.get('.editor-post-publish-panel__confirm-button').click();
  cy.get('.post-publish-panel__postpublish-post-address a, .editor-post-publish-panel__postpublish-link a')
    .invoke('attr', 'href')
    .then((url) => {
      cy.visit(url);
    });
}

describe('ACF Field block – Frontend render', () => {
  describe('Block container', () => {
    beforeEach(() => createPageWithAcfField());

    it('renders block wrapper with expected class', () => {
      cy.get('.satori-acf-field-block').should('exist');
    });
  });
});
