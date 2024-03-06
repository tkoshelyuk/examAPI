import post from '../fixtures/post.json'
import { faker } from '@faker-js/faker';

const user_email = faker.internet.email({ firstName: 'Jeanne', lastName: 'Doe', provider: 'some.fakeMail.qa', allowSpecialCharacters: false });
const user_password = faker.internet.password();
const comment = faker.lorem.sentence();

describe('Set test data', () => {




  it('Get all posts', () => {
    cy.log('Get all posts');
    cy.request('GET', '/posts').then(response => {
      expect(response.status).to.be.equal(200);
      expect(response.headers['content-type']).contains('application/json');
      })
    })

  it('Get first 10 posts', () => {
    cy.log('Get first 10 posts and verify length is 10');
    cy.request('GET', '/posts?_start=0&_end=10').then(response => {
      expect(response.status).to.be.equal(200);

      const dataArray = response.body;
      expect(dataArray).to.have.lengthOf(10);
      expect(response.body[0].id).to.be.equal(1);


    })
  })

  it('Get 2 posts', () => {
    cy.log('Get 2 posts');
    cy.request('GET', '/posts?id=55&id=60')
        .then(response => {
      expect(response.status).to.be.equal(200);
      expect(response.body[0].id).to.be.equal(55);
      expect(response.body[1].id).to.be.equal(60);
    })
  })

  it('Create post 401', () => {
    cy.log('Create post 401');
    cy.request({
      method: 'POST',
      url: `/664/posts`,
      failOnStatusCode: false
    })
  .then(verifyResponse => {
    expect(verifyResponse.status).to.equal(401);
    })
  })

    it('Create post with authorization', () => {
        cy.log('Create post with authorization');
        post.body=comment;
        const user_email = faker.internet.email();
        const user_password = faker.internet.password();

        cy.log('Create user');
        cy.request('POST', '/register',
            {
                "email": `${user_email}`,
                "password": `${user_password}`,
                "firstname": "aaa",
                "lastname": "bbb",
                "age": 13
            })
            .then(response => {
                expect(response.status).to.be.equal(201);
                expect(response.body.user.email).to.be.equal(`${user_email}`);

                cy.log('Save tocken');
                const accToken = response.body.accessToken;
                const userId = response.body.user.id;

                cy.log('Post new post with tocken')
                cy.request({
                    method: 'POST',
                    url: '/664/posts',
                    body: {
                        "title": "at nam consequatur ea labore ea harum",
                        "body": comment,
                        "userId": userId
                    },
                    headers: {
                        "Authorization": 'Bearer ' + accToken
                    }
                })
                    .then(response => {
                        expect(response.status).to.be.equal(201);
                        expect(response.body.userId).to.be.equal(userId);
                    })

            })



    })

  it('Create post', () => {
    cy.log('Create post');
    post.body=comment;
    cy.request('POST', '/posts', post)
        .then(response => {
          expect(response.status).to.be.equal(201);
          expect(response.body.body).to.be.equal(`${post.body}`);

          const postId = response.body.id;

            cy.log('Get created post');
            cy.request('GET', `/posts/${postId}`).then(response => {
                expect(response.status).to.be.equal(200);
            })
    })

  })

  it('Create and update post', () => {
    cy.log('Create and update post');
    post.body=comment;
    cy.request('POST', '/posts', post)
        .then(response => {
          expect(response.status).to.be.equal(201);
            expect(response.body.body).to.be.equal(`${post.body}`);

          const postID = response.body.id;

          cy.request('PUT', `/posts/${postID}`, {"body": "yet 17"})
              .then(response => {
                expect(response.status).to.be.equal(200);
                expect(response.body.body).to.be.equal('yet 17');
              })


        })
  })

  it('Update non existing post', () => {
    cy.log('Update non existing post');
    cy.request({
      method: 'PUT',
      url: '/posts/10000',
      failOnStatusCode: false
    },{"body": "yet 17"})
        .then(verifyResponse => {
          expect(verifyResponse.status).to.equal(404);
        })
  })

  it('Delete non existing post', () => {
    cy.log('Delete non existing post');
    cy.request({
      method: 'DELETE',
      url: '/posts/10000',
      failOnStatusCode: false
    })
        .then(verifyResponse => {
          expect(verifyResponse.status).to.equal(404);
        })
  })

  it('CRUD post', () => {
    cy.log('CRUD post');
    cy.request('POST', '/posts', post)
        .then(response => {
          expect(response.status).to.be.equal(201);

          const postID = response.body.id;
          cy.log('Update post')
          cy.request('PUT', `/posts/${postID}`, {"title": "yet 17"})
              .then(response => {
                expect(response.status).to.be.equal(200);
                expect(response.body.title).to.be.equal('yet 17');
              })

            cy.log('Delete post')
            cy.request('DELETE', `/posts/${postID}`)
              .then(response => {
                expect(response.status).to.be.equal(200);
              })

          cy.log('Check that post is removed');
          cy.request({
            method: 'GET',
            url: `/posts/${postID}`,
            failOnStatusCode: false
          }).then(verifyResponse => {
            expect(verifyResponse.status).to.equal(404);
          })
        })
  })


})