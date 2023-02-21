import { actions } from "../support/pageObjects.js/actions"

describe('api test', () => {
  beforeEach('login', () => {
    cy.intercept('GET', 'https://api.realworld.io/api/tags', {fixture: 'tags.json'})
    actions.logIn()
  })
  it('1', () => {

    cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles')

    cy.get('div.container').find('li.nav-item').find('i.ion-compose').click()
    cy.get('[placeholder="Article Title"]').type('This is an title')
    cy.get('[formcontrolname="description"]').type('This is a description')
    cy.get('fieldset.form-group').find('textarea').type('The text of article')
    cy.get('button').click()

    cy.wait('@postArticles') //tutaj zrobił screena konsoli na stronie i spisywał wartości, statuscode itd....
.then( xhr => {
  console.log(xhr)
  expect(xhr.response.statusCode).to.equal(200)
  expect(xhr.request.body.article.body).to.equal('The text of article')
  expect(xhr.response.body.article.description).to.equal('This is a description')
})

})

it('verify popular tags are displayed', () => {

 cy.get('.tag-list').should('contain', 'cypress').and('contain', 'automation').and('contain', 'testing')
})

it('verify global feed likes count', () => {
  cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', {"articles":[],"articlesCount":0})
  cy.intercept('GET', 'https://api.realworld.io/api/articles*', { fixture: 'articles.json' })
  cy.contains('Global Feed').click()
  cy.get('app-article-list button').then(heartList => {
    expect(heartList[0]).to.contain('1')
    expect(heartList[1]).to.contain('5')
  })

  cy.fixture('articles.json').then(file => {
    const articleLink = file.articles[1].slug
    file.articles[1].favouritesCount = 6
    cy.intercept('POST', 'https://api.realworld.io/api/articles/'+articleLink+'/favorite', file)
  })

  cy.get('app-article-list button').eq(1).click().should('contain', '6')
})

it.only('delete a new article in a global feed', () => {
const userCredentials = {
  "user": {
    "email": "ada.pokorska@itmagination.com",
    "password": "newpassword"
  }

}

const bodyRequest = {article: { tagList: [], title: "My title", description: "My description", body: "Happy"}

}

cy.request('POST', 'https://conduit.productionready.io/api/users/login', userCredentials)
.its('body').then(body =>{
  const token= body.user.token

  cy.request({
    url: 'https://conduit.productionready.io/api/articles',
    headers: { 'Authorization': 'Token '+token},
    method: 'POST',
    body: bodyRequest
  }).then( response => {
    expect(response.status).to.equal(200)
  })
  cy.contains('Global Feed').click()
  cy.get('.article-preview').first().click()
  cy.get('.article-actions').contains('Delete Article').click()

  cy.request({
    url: 'https://conduit.productionready.io/api/articles?limit=10&offset=0',
    headers: { 'Authorization': 'Token '+token},
    method: 'GET'
  }).its('body').then( body => {
    console.log(body)
  })
})
})
})