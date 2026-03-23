/**
 * ACF Field block – Inspector settings tests.
 *
 * Verifies the ACF Field panel, field dropdown, and help text.
 */

const BLOCK_NAME = 'satori-digital/acf-field';

describe('ACF Field block – Settings', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/wp-admin/post-new.php');
    cy.closeWelcomeModal();
    cy.get('.edit-post-visual-editor, .editor-styles-wrapper').should('be.visible');
    cy.insertBlock(BLOCK_NAME);
    cy.get(`[data-type="${BLOCK_NAME}"]`).first().click();
  });

  describe('ACF Field panel', () => {
    it('shows ACF Field panel in inspector', () => {
      cy.get('.components-panel__body').contains('ACF Field').should('be.visible');
    });

    it('shows Field selector (dropdown)', () => {
      cy.get('.components-panel__body').contains('ACF Field').click();
      cy.contains('Field').should('be.visible');
    });

    it('dropdown includes default empty option', () => {
      cy.get('.components-panel__body').contains('ACF Field').click();
      cy.get('select').first().should('contain', 'Select field');
    });
  });

  describe('Standalone block (outside Query Loop)', () => {
    it('shows help text to place block inside Query Loop', () => {
      cy.get('.components-panel__body').contains('ACF Field').click();
      cy.contains('Place this block inside a Query Loop').should('be.visible');
    });

    it('preview shows "Select an ACF field" when no field selected', () => {
      cy.get('.satori-acf-field-preview').should('contain', 'Select an ACF field');
    });
  });

  describe('Field selection (when ACF has fields)', () => {
    it('field dropdown loads from REST API', () => {
      cy.get('.components-panel__body').contains('ACF Field').click();
      cy.get('body').then(($body) => {
        if ($body.find('.components-spinner').length > 0) {
          cy.get('.components-spinner', { timeout: 5000 }).should('not.exist');
        }
      });
      cy.get('select').first().should('exist');
    });
  });
});
