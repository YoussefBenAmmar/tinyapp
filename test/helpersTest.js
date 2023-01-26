const { assert } = require('chai');

const { lookupUsersEmail } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('lookupUsersEmail', function() {
  it('should return a user with valid email', function() {
    const user = lookupUsersEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, testUsers.userRandomID);
  });

  it('should return undefined for non-existent email', () => {
    const user = lookupUsersEmail('ghostperson@example.com', testUsers);
    assert.equal(user, undefined);
  });
});