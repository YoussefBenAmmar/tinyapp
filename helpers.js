const lookupUsersEmail = (email, database) => {
  for (let i in database) {
    if (database[i].email === email) {
      return database[i];
    }
  }
  return undefined;
};


const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  while (randomString.length < 6) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
};


const urlsForUser = (id, database) => {
  let userURL = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userURL[shortURL] = database[shortURL];
    }
  }
  return userURL;
};



module.exports = { lookupUsersEmail, urlsForUser, generateRandomString }