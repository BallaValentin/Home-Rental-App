import sql from 'mssql';

const pool = await sql.connect({
  server: 'DESKTOP-7289R3V',
  user: 'webprog',
  password: '12345',
  database: 'webprog',
  options: {
    trustServerCertificate: true,
    trustedConnection: true,
  },
});
console.log('Connected to database succesfully');

await pool.query(
  `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' and xtype='U')
    CREATE TABLE users (
      userID INT PRIMARY KEY IDENTITY(5, 5),
      name varchar(20) unique,
      role varchar(20),
      hash varchar(255),
      salt varchar(255),
    )
    `,
);
console.log('Table has been created or already exists');

await pool.query(
  `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='advertisements' and xtype='U')
    CREATE TABLE advertisements (
      advertisementID INT PRIMARY KEY IDENTITY(2, 2),
      userID INT FOREIGN KEY REFERENCES users(userID),
      city varchar(100),
      cityQuarter varchar(100),
      price int,
      noRooms int,
      surfaceArea int,
      uploadDate date
    )
    `,
);
console.log('Table has been created or already exists');

await pool.query(
  `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='images' and xtype='U')
    CREATE TABLE images (
      imageID INT PRIMARY KEY IDENTITY(2, 2),
      advertisementID INT FOREIGN KEY REFERENCES advertisements(advertisementID),
      filePath VARCHAR(100)
    )
    `,
);
console.log('Table has been created or already exists');

await pool.query(
  `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='discussions' and xtype='U')
    CREATE TABLE discussions (
      discussionID INT PRIMARY KEY IDENTITY(1, 1),
      user1ID INT FOREIGN KEY REFERENCES users(userID),
      user2ID INT FOREIGN KEY REFERENCES users(userID),
    )
    `,
);
console.log('Table has been created or already exists');

await pool.query(
  `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='messages' and xtype='U')
    CREATE TABLE messages (
      messageID INT PRIMARY KEY IDENTITY(1, 1),
      discussionID INT FOREIGN KEY REFERENCES discussions(discussionID),
      senderID INT FOREIGN KEY REFERENCES users(userID),
      text VARCHAR(1000),
      sendDate DATETIME,
    )
    `,
);
console.log('Table has been created or already exists');

export const findAllUsers = async () => {
  const query = 'SELECT userID, name, role FROM users';
  const data = await pool.query(query);
  return 'recordset' in data ? data.recordset : [];
};

export const findUserIdByName = async (name) => {
  const query = `
  SELECT userID FROM users WHERE name = '${name}'
`;
  const result = await pool.query(query);
  return result.recordset.length > 0 ? result.recordset[0].userID : null;
};

export const insertUser = async (user) => {
  const query = `INSERT INTO users (name, hash, salt, role)
                VALUES (@name, @hash, @salt, 'user')`;
  const request = pool
    .request()
    .input('name', sql.VarChar, user.username)
    .input('hash', sql.VarChar, user.hash)
    .input('salt', sql.VarChar, user.salt);
  const result = await request.query(query);
  return result;
};

export const findUserByName = async (username) => {
  const query = `
  SELECT * FROM users WHERE name = @name
`;
  const request = pool.request().input('name', sql.VarChar, username);
  const result = await request.query(query);
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const findUserById = async (userId) => {
  const query = `
  SELECT * FROM users WHERE userID = @userID
`;
  const request = pool.request().input('userID', sql.Int, userId);
  const result = await request.query(query);
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const insertAdvertisement = async (advertisement) => {
  const query = `INSERT INTO advertisements (userID, city, cityQuarter, price, noRooms, surfaceArea, uploadDate)
                VALUES (@userID, @city, @cityQuarter, @price, @noRooms, @surfaceArea, @uploadDate)`;
  const request = pool
    .request()
    .input('userID', sql.Int, advertisement.UID)
    .input('city', sql.VarChar, advertisement.city)
    .input('cityQuarter', sql.VarChar, advertisement.city_quarter)
    .input('price', sql.Int, advertisement.price)
    .input('noRooms', sql.Int, advertisement.number_of_rooms)
    .input('surfaceArea', sql.Int, advertisement.surface_area)
    .input('uploadDate', sql.Date, advertisement.upload_date);
  const result = await request.query(query);
  return result;
};

export const getAllAdvertisements = async () => {
  const query = 'SELECT * FROM advertisements';
  const data = await pool.query(query);
  return 'recordset' in data ? data.recordset : [];
};

export const searchAdvertisements = async (searchParameters) => {
  let query = 'SELECT * FROM advertisements WHERE 1=1';
  const request = pool.request();

  if (searchParameters.city_name) {
    query += ' AND city = @city_name';
    request.input('city_name', sql.VarChar, searchParameters.city_name);
  }

  if (searchParameters.city_quarter_name) {
    query += ' AND cityQuarter = @city_quarter_name';
    request.input('city_quarter_name', sql.VarChar, searchParameters.city_quarter_name);
  }

  if (searchParameters.min_price) {
    query += ' AND price >= @min_price';
    request.input('min_price', sql.Int, searchParameters.min_price);
  }

  if (searchParameters.max_price) {
    query += ' AND price <= @max_price';
    request.input('max_price', sql.Int, searchParameters.max_price);
  }

  const data = await request.query(query);
  return 'recordset' in data ? data.recordset : [];
};

export const findAdvertisementById = async (advertisementId) => {
  const query = 'SELECT * FROM advertisements WHERE advertisementID = @advertisementId';
  const result = await pool.request().input('advertisementId', sql.Int, advertisementId).query(query);
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const findPhotosByAdvertisementId = async (advertisementId) => {
  const query = 'SELECT * FROM images WHERE advertisementID = @advertisementID';
  const request = pool.request().input('advertisementId', sql.Int, advertisementId);
  const data = await request.query(query);
  return 'recordset' in data ? data.recordset : [];
};

export const findPhotoById = async (pictureId) => {
  const query = 'SELECT * FROM images WHERE imageID = @pictureId';
  const request = pool.request().input('pictureId', sql.Int, pictureId);
  const data = await request.query(query);
  return 'recordset' in data ? data.recordset : [];
};

export const deletePhoto = async (pictureId) => {
  const query = 'DELETE FROM images WHERE imageID = @pictureId';
  const request = pool.request().input('pictureId', sql.Int, pictureId);
  const result = await request.query(query);
  return result;
};

export const insertPhoto = async (advertisementId, filePath) => {
  const query = 'INSERT INTO images (advertisementID, filePath) VALUES (@advertisementID, @filePath)';
  const request = pool
    .request()
    .input('advertisementID', sql.Int, advertisementId)
    .input('filePath', sql.VarChar, filePath);

  const result = await request.query(query);
  return result;
};

export const findOwnerByAdvertisementId = async (advertisementId) => {
  const query = 'SELECT userID FROM advertisements WHERE advertisementID = @advertisementID';
  const request = pool.request().input('advertisementId', sql.Int, advertisementId);
  const result = await request.query(query);
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const findOwnerByPictureId = async (pictureId) => {
  const query = 'SELECT advertisementID FROM images WHERE imageID = @imageID';
  const request = pool.request().input('imageID', sql.Int, pictureId);
  const result = await request.query(query);
  const advertisementId = result.recordset.length > 0 ? result.recordset[0].advertisementID : null;
  return findOwnerByAdvertisementId(advertisementId);
};

export const findDiscussionsByUserId = async (userId) => {
  const query = 'SELECT * FROM discussions WHERE user1ID = @user1ID OR user2ID = @user2ID';
  const request = pool.request().input('user1ID', sql.Int, userId).input('user2ID', sql.Int, userId);
  const result = await request.query(query);
  return 'recordset' in result ? result.recordset : [];
};

export const selectLatestMessageByDiscussionId = async (discussionId) => {
  const query = `SELECT * FROM messages WHERE discussionID = @discussionID AND  sendDate = (
      SELECT MAX(sendDate) FROM messages
      WHERE discussionID = @discussionID
  )`;
  const request = pool.request().input('discussionID', sql.Int, discussionId);
  const result = await request.query(query);
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const selectAllMessagesByDiscussionId = async (discussionId) => {
  const query = 'SELECT * FROM discussions WHERE discussionID = @discussionID ORDER BY sendDate';
  const request = pool.request().input('discussionID', sql.Int, discussionId);
  const result = await request.query(query);
  return 'recordset' in result ? result.recordset : [];
};

export const checkIfDiscussionExists = async (user1Id, user2Id) => {
  const query = `SELECT * FROM discussions WHERE
                  (user1ID = @user1ID AND user2ID = @user2ID)
                  OR (user1ID = @user2ID AND user2ID = @user1ID)`;
  const request = pool.request().input('user1ID', sql.Int, user1Id).input('user2ID', sql.Int, user2Id);
  const result = await request.query(query);
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const addNewDiscussion = async (user1Id, user2Id) => {
  const query = `INSERT INTO discussions(user1ID, user2ID)
                  VALUES (@user1ID, @user2ID)`;
  const request = pool.request().input('user1ID', sql.Int, user1Id).input('user2ID', sql.Int, user2Id);
  const result = await request.query(query);
  return result;
};

export const addNewMessageToDiscussion = async (discussionId, newMessage) => {
  const query = `INSERT INTO messages(discussionID, senderID, text, sendDate)
                  VALUES (@discussionID, @senderID, @text, GETDATE())`;
  const request = pool
    .request()
    .input('discussionID', sql.Int, discussionId)
    .input('senderID', sql.Int, newMessage.userID)
    .input('text', sql.VarChar, newMessage.text);
  const result = await request.query(query);
  console.log(result);
  return result;
};

export const findAllMessagesOfDiscussion = async (discussionId) => {
  const query = 'SELECT * FROM messages WHERE discussionID = @discussionID ORDER BY sendDate';
  const request = pool.request().input('discussionID', sql.Int, discussionId);
  const result = await request.query(query);
  return 'recordset' in result ? result.recordset : [];
};

export const updateUserRole = async (userId, newRole) => {
  const query = 'UPDATE users SET role = @role WHERE userID = @userID';
  const request = pool.request().input('role', sql.VarChar, newRole).input('userID', sql.Int, userId);
  const result = await request.query(query);
  return result;
};

export const findUsersByPattern = async (pattern) => {
  const query = 'SELECT userID, name, role FROM users WHERE name LIKE @pattern';
  const request = pool.request().input('pattern', sql.VarChar, `${pattern}%`);
  const result = await request.query(query);
  return 'recordset' in result ? result.recordset : [];
};

export const deletePicturesByAdvertisementID = async (advertisementId) => {
  const query = 'DELETE FROM images WHERE advertisementID = @advertisementID';
  const request = pool.request().input('advertisementID', sql.Int, advertisementId);
  const result = await request.query(query);
  return result;
};

export const deleteAdvertisementByID = async (advertisementId) => {
  const query = 'DELETE FROM advertisements WHERE advertisementID = @advertisementID';
  const request = pool.request().input('advertisementID', sql.Int, advertisementId);
  const result = await request.query(query);
  return result;
};

export const findCities = async () => {
  const query = 'SELECT DISTINCT city FROM advertisements';
  const request = pool.request();
  const result = await request.query(query);
  return 'recordset' in result ? result.recordset : [];
};

export const findCityQuarters = async () => {
  const query = 'SELECT DISTINCT cityQuarter FROM advertisements';
  const request = pool.request();
  const result = await request.query(query);
  return 'recordset' in result ? result.recordset : [];
};
