DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS documents;

CREATE TABLE users
(id BIGSERIAL PRIMARY KEY NOT NULL,
username VARCHAR(200) UNIQUE NOT NULL,
password VARCHAR(200) NOT NULL);

CREATE TABLE documents
(docOwner VARCHAR(200) NOT NULL,
title VARCHAR(100) UNIQUE NOT NULL,
folder VARCHAR (50) NOT NULL,
deltaFile VARCHAR(10485760) NOT NULL);

INSERT INTO documents (docowner, title, folder, deltafile)
VALUES 
       ('james3', 'same document', 'jamesfolder', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}'),
       ('james3', 'yuhyuh', 'jamesfolder', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}'),
       ('james3', 'youknowthedrill', 'jamesfolder', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}'),
       ('james3', 'alldeezfiles', 'jamesfolder', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}'),
       ('james3', 'anotha one', 'jamesfolder', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}');

