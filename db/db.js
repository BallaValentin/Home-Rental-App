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

export const findAllUsers = async () => {
  const query = 'SELECT nev FROM felhasznalok';
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
  const query = `INSERT INTO felhasznalok (nev, hash, salt)
                VALUES (@nev, @hash, @salt)`;
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
