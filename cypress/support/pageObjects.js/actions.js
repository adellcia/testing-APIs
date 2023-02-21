export class Actions {

    logIn() {
        cy.visit('https://angular.realworld.io/')
    cy.get('div.container').find('li.nav-item').find('a.nav-link').eq(1).click()
    cy.get('fieldset.form-group').find('input').then( input => {
      cy.wrap(input).eq(0).type('ada.pokorska@itmagination.com')
      cy.wrap(input).eq(1).type('newpassword')
    })
    cy.get('button').click().wait(500)
    }
}
export const actions = new Actions