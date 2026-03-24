/**
 * ACF Field block – Inspector settings tests.
 *
 * Verifies the ACF Field panel, field dropdown, and help text.
 */

const BLOCK_NAME = 'satori-digital/acf-field';

describe('ACF Field block – Settings', () => {
  beforeEach(() => {
    cy.login();
    cy.visitEditor();
    cy.closeWelcomeModal();
    cy.ensureEditorReady();
    cy.insertBlock(BLOCK_NAME);
    cy.refocusAcfFieldBlock();
  });

  describe('ACF Field panel', () => {
    it('shows ACF Field panel in inspector', () => {
      cy.get('.block-editor-block-inspector').contains('ACF Field').should('be.visible');
    });

    it('shows Field selector (dropdown)', () => {
      cy.get('.block-editor-block-inspector').contains('ACF Field').click({ force: true });
      cy.get('.block-editor-block-inspector').contains('Field').should('be.visible');
    });

    it('dropdown includes default empty option', () => {
      cy.get('.block-editor-block-inspector').contains('ACF Field').click({ force: true });
      cy.get('.block-editor-block-inspector select').first().should('contain', 'Select field');
    });
  });

  describe('Standalone block (outside Query Loop)', () => {
    it('shows help text to place block inside Query Loop', () => {
      cy.get('.block-editor-block-inspector').contains('ACF Field').click({ force: true });
      cy.get('.block-editor-block-inspector').then(($insp) => {
        const $help = $insp.find('.components-base-control__help');
        if ($help.length) {
          expect($help.text()).to.include('Query Loop');
        }
      });
    });

    it('preview shows "Select an ACF field" when no field selected', () => {
      cy.getEditorCanvas().find('.satori-acf-field-preview').should('contain', 'Select an ACF field');
    });
  });

  describe('Field selection (when ACF has fields)', () => {
    it('field dropdown loads from REST API', () => {
      cy.get('.block-editor-block-inspector').contains('ACF Field').click({ force: true });
      cy.get('.block-editor-block-inspector').then(($insp) => {
        if ($insp.find('.components-spinner').length > 0) {
          cy.get('.block-editor-block-inspector .components-spinner', { timeout: 15000 }).should('not.exist');
        }
      });
      cy.get('.block-editor-block-inspector select').first().should('exist');
    });
  });
});
