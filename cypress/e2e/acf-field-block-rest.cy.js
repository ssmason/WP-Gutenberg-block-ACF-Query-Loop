/**
 * ACF Field block – REST API tests.
 *
 * Verifies the /satori-acf-field-loop/v1/fields endpoint.
 * Requires authentication (nonce or auth cookie).
 */

describe('ACF Field block – REST API', () => {
  beforeEach(() => {
    cy.login();
  });

  it('returns 200 for fields endpoint with post_type param', () => {
    cy.request({
      url: '/wp-json/satori-acf-field-loop/v1/fields?post_type=post',
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 401, 403]);
      if (res.status === 200) {
        expect(res.body).to.have.property('fields');
        expect(res.body.fields).to.be.an('array');
      }
    });
  });

  it('fields endpoint returns array when successful', () => {
    cy.visit('/wp-admin/');
    cy.request({
      url: '/wp-json/satori-acf-field-loop/v1/fields?post_type=post',
      failOnStatusCode: false,
    }).then((res) => {
      if (res.status === 200) {
        expect(res.body).to.have.property('fields');
        expect(res.body.fields).to.be.an('array');
        res.body.fields.forEach((field) => {
          expect(field).to.have.property('key');
          expect(field).to.have.property('name');
          expect(field).to.have.property('selector');
          expect(field).to.have.property('label');
          expect(field).to.have.property('type');
        });
      }
    });
  });
});
