-- Segédállomány, hogy előkészítsünk egy MS SQL adatbázist a példaprogramnak.
-- Futtatás konzolról (UNIX rendszeren): 
--     sqlcmd -U sa -i setup.sql

-- készít egy felhasználót, aki minden műveletet végrehajthat ezen adatbázisban
CREATE LOGIN webprog WITH PASSWORD = '12345';
CREATE USER webprog FOR LOGIN webprog;
GRANT CREATE DATABASE TO webprog;
GO

SETUSER 'webprog'
GO

-- készít egy adatbázist
CREATE DATABASE [webprog]
GO

USE webprog
SELECT * FROM felhasznalok
