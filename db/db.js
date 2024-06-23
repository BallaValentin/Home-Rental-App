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
  `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='felhasznalok' and xtype='U')
    CREATE TABLE felhasznalok (
      felhID INT PRIMARY KEY IDENTITY(5, 5),
      nev varchar(20) unique,
      szerep varchar(20),
      hash varchar(255),
      salt varchar(255),
    )
    `,
);
console.log('Table exists successfully');

await pool.query(
  `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='hirdetesek' and xtype='U')
    CREATE TABLE hirdetesek (
      hirdetesID INT PRIMARY KEY IDENTITY(2, 2),
      felhID INT FOREIGN KEY REFERENCES felhasznalok(felhID),
      varosnev varchar(100),
      negyednev varchar(100),
      ar int,
      szobakSzama int,
      felszTerulet int,
      feltDatum date
    )
    `,
);
console.log('Table exists successfully');

await pool.query(
  `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='kepek' and xtype='U')
    CREATE TABLE kepek (
      kepID INT PRIMARY KEY IDENTITY(2, 2),
      hirdetesID INT FOREIGN KEY REFERENCES hirdetesek(hirdetesID),
      elUtvonal VARCHAR(100)
    )
    `,
);
console.log('Table exists successfully');

await pool.query(
  `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='csevegesek' and xtype='U')
    CREATE TABLE csevegesek (
      csevegesID INT PRIMARY KEY IDENTITY(1, 1),
      felh1ID INT FOREIGN KEY REFERENCES felhasznalok(felhID),
      felh2ID INT FOREIGN KEY REFERENCES felhasznalok(felhID),
    )
    `,
);
console.log('Table exists successfully');

await pool.query(
  `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='uzenetek' and xtype='U')
    CREATE TABLE uzenetek (
      uzenetID INT PRIMARY KEY IDENTITY(1, 1),
      csevegesID INT FOREIGN KEY REFERENCES csevegesek(csevegesID),
      kuldoID INT FOREIGN KEY REFERENCES felhasznalok(felhID),
      szoveg VARCHAR(1000),
      kuldesiIdo DATETIME,
    )
    `,
);
console.log('Table exists successfully');

export const findAllUsers = async () => {
  const query = 'SELECT felhID, nev, szerep FROM felhasznalok';
  const data = await pool.query(query);
  return 'recordset' in data ? data.recordset : [];
};

export const findUserIdByName = async (name) => {
  const query = `
  SELECT felhID FROM felhasznalok WHERE nev = '${name}'
`;
  const result = await pool.query(query);
  return result.recordset.length > 0 ? result.recordset[0].felhID : null;
};

export const insertUser = async (user) => {
  const query = `INSERT INTO felhasznalok (nev, hash, salt, szerep)
                VALUES (@nev, @hash, @salt, 'user')`;
  const request = pool
    .request()
    .input('nev', sql.VarChar, user.username)
    .input('hash', sql.VarChar, user.hash)
    .input('salt', sql.VarChar, user.salt);
  const result = await request.query(query);
  return result;
};

export const findUserByName = async (username) => {
  const query = `
  SELECT * FROM felhasznalok WHERE nev = @nev
`;
  const request = pool.request().input('nev', sql.VarChar, username);
  const result = await request.query(query);
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const findUserById = async (userId) => {
  const query = `
  SELECT * FROM felhasznalok WHERE felhID = @felhID
`;
  const request = pool.request().input('felhID', sql.Int, userId);
  const result = await request.query(query);
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const insertAdvertisement = async (advertisement) => {
  const query = `INSERT INTO hirdetesek (felhID, varosnev, negyednev, ar, szobakSzama, felszTerulet, feltDatum)
                VALUES (@felhID, @varosnev, @negyednev, @ar, @szobakSzama, @felszTerulet, @feltDatum)`;
  const request = pool
    .request()
    .input('felhID', sql.Int, advertisement.UID)
    .input('varosnev', sql.VarChar, advertisement.city)
    .input('negyednev', sql.VarChar, advertisement.city_quarter)
    .input('ar', sql.Int, advertisement.price)
    .input('szobakSzama', sql.Int, advertisement.number_of_rooms)
    .input('felszTerulet', sql.Int, advertisement.surface_area)
    .input('feltDatum', sql.Date, advertisement.upload_date);
  const result = await request.query(query);
  return result;
};

export const getAllAdvertisements = async () => {
  const query = 'SELECT * FROM hirdetesek';
  const data = await pool.query(query);
  return 'recordset' in data ? data.recordset : [];
};

export const searchAdvertisements = async (searchParameters) => {
  let query = 'SELECT * FROM hirdetesek WHERE 1=1';
  const request = pool.request();

  if (searchParameters.city_name) {
    query += ' AND varosnev = @city_name';
    request.input('city_name', sql.VarChar, searchParameters.city_name);
  }

  if (searchParameters.city_quarter_name) {
    query += ' AND negyednev = @city_quarter_name';
    request.input('city_quarter_name', sql.VarChar, searchParameters.city_quarter_name);
  }

  if (searchParameters.min_price) {
    query += ' AND ar >= @min_price';
    request.input('min_price', sql.Int, searchParameters.min_price);
  }

  if (searchParameters.max_price) {
    query += ' AND ar <= @max_price';
    request.input('max_price', sql.Int, searchParameters.max_price);
  }

  const data = await request.query(query);
  return 'recordset' in data ? data.recordset : [];
};

export const findAdvertisementById = async (advertisementId) => {
  const query = 'SELECT * FROM hirdetesek WHERE hirdetesID = @advertisementId';
  const result = await pool.request().input('advertisementId', sql.Int, advertisementId).query(query);
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const findPhotosByAdvertisementId = async (advertisementId) => {
  const query = 'SELECT * FROM kepek WHERE hirdetesID = @advertisementID';
  const request = pool.request().input('advertisementId', sql.Int, advertisementId);
  const data = await request.query(query);
  return 'recordset' in data ? data.recordset : [];
};

export const findPhotoById = async (pictureId) => {
  const query = 'SELECT * FROM kepek WHERE kepID = @pictureId';
  const request = pool.request().input('pictureId', sql.Int, pictureId);
  const data = await request.query(query);
  return 'recordset' in data ? data.recordset : [];
};

export const deletePhoto = async (pictureId) => {
  const query = 'DELETE FROM kepek WHERE kepID = @pictureId';
  const request = pool.request().input('pictureId', sql.Int, pictureId);
  const result = await request.query(query);
  return result;
};

export const insertPhoto = async (advertisementId, filePath) => {
  const query = 'INSERT INTO Kepek (hirdetesID, elUtvonal) VALUES (@hirdetesID, @elUtvonal)';
  const request = pool
    .request()
    .input('hirdetesID', sql.Int, advertisementId)
    .input('elUtvonal', sql.VarChar, filePath);

  const result = await request.query(query);
  return result;
};

export const findOwnerByAdvertisementId = async (advertisementId) => {
  const query = 'SELECT felhID FROM hirdetesek WHERE hirdetesID = @advertisementID';
  const request = pool.request().input('advertisementId', sql.Int, advertisementId);
  const result = await request.query(query);
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const findOwnerByPictureId = async (pictureId) => {
  const query = 'SELECT hirdetesID FROM kepek WHERE kepID = @kepID';
  const request = pool.request().input('kepID', sql.Int, pictureId);
  const result = await request.query(query);
  const advertisementId = result.recordset.length > 0 ? result.recordset[0].hirdetesID : null;
  return findOwnerByAdvertisementId(advertisementId);
};

export const findDiscussionsByUserId = async (userId) => {
  const query = 'SELECT * FROM csevegesek WHERE felh1ID = @felh1ID OR felh2ID = @felh2ID';
  const request = pool.request().input('felh1ID', sql.Int, userId).input('felh2ID', sql.Int, userId);
  const result = await request.query(query);
  return 'recordset' in result ? result.recordset : [];
};

export const selectLatestMessageByDiscussionId = async (discussionId) => {
  const query = `SELECT * FROM uzenetek WHERE csevegesID = @csevegesID AND  kuldesiIdo = (
      SELECT MAX(kuldesiIdo) FROM uzenetek
      WHERE csevegesID = @csevegesID
  )`;
  const request = pool.request().input('csevegesID', sql.Int, discussionId);
  const result = await request.query(query);
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const selectAllMessagesByDiscussionId = async (discussionId) => {
  const query = 'SELECT * FROM uzenetek WHERE csevegesID = @csevegesID ORDER BY kuldesiIdo';
  const request = pool.request().input('csevegesID', sql.Int, discussionId);
  const result = await request.query(query);
  return 'recordset' in result ? result.recordset : [];
};

export const checkIfDiscussionExists = async (user1Id, user2Id) => {
  const query = `SELECT * FROM csevegesek WHERE
                  (felh1ID = @felh1ID AND felh2ID = @felh2ID)
                  OR (felh1ID = @felh2ID AND felh1ID = @felh2ID)`;
  const request = pool.request().input('felh1ID', sql.Int, user1Id).input('felh2ID', sql.Int, user2Id);
  const result = await request.query(query);
  return result.recordset.length > 0 ? result.recordset[0] : null;
};

export const addNewDiscussion = async (user1Id, user2Id) => {
  const query = `INSERT INTO csevegesek(felh1ID, felh2ID)
                  VALUES (@felh1ID, @felh2ID)`;
  const request = pool.request().input('felh1ID', sql.Int, user1Id).input('felh2ID', sql.Int, user2Id);
  const result = await request.query(query);
  return result;
};

export const addNewMessageToDiscussion = async (discussionId, newMessage) => {
  const query = `INSERT INTO uzenetek(csevegesID, kuldoID, szoveg, kuldesiIdo)
                  VALUES (@csevegesID, @kuldoID, @szoveg, GETDATE())`;
  const request = pool
    .request()
    .input('csevegesID', sql.Int, discussionId)
    .input('kuldoID', sql.Int, newMessage.userID)
    .input('szoveg', sql.VarChar, newMessage.text);
  const result = await request.query(query);
  console.log(result);
  return result;
};

export const findAllMessagesOfDiscussion = async (discussionId) => {
  const query = 'SELECT * FROM uzenetek WHERE csevegesID = @csevegesID ORDER BY kuldesiIdo';
  const request = pool.request().input('csevegesID', sql.Int, discussionId);
  const result = await request.query(query);
  return 'recordset' in result ? result.recordset : [];
};

export const updateUserRole = async (userId, newRole) => {
  const query = 'UPDATE felhasznalok SET szerep = @szerep WHERE felhID = @felhID';
  const request = pool.request().input('szerep', sql.VarChar, newRole).input('felhID', sql.Int, userId);
  const result = await request.query(query);
  return result;
};

export const findUsersByPattern = async (pattern) => {
  const query = 'SELECT felhID, nev, szerep FROM felhasznalok WHERE nev LIKE @pattern';
  const request = pool.request().input('pattern', sql.VarChar, `${pattern}%`);
  const result = await request.query(query);
  return 'recordset' in result ? result.recordset : [];
};

export const deletePicturesByAdvertisementID = async (advertisementId) => {
  const query = 'DELETE FROM kepek WHERE hirdetesID = @hirdetesID';
  const request = pool.request().input('hirdetesID', sql.Int, advertisementId);
  const result = await request.query(query);
  return result;
};

export const deleteAdvertisementByID = async (advertisementId) => {
  const query = 'DELETE FROM hirdetesek WHERE hirdetesID = @hirdetesID';
  const request = pool.request().input('hirdetesID', sql.Int, advertisementId);
  const result = await request.query(query);
  return result;
};
