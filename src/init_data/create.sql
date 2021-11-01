CREATE TABLE users (
	id BIGSERIAL PRIMARY KEY,
	username	VARCHAR(50)  NOT NULL,
	password	VARCHAR(200) NOT NULL,
	created_on	TIMESTAMPTZ  NOT NULL,
	last_login	TIMESTAMPTZ,
	UNIQUE (username)
);

CREATE TABLE file_directory (
	user_id		BIGINT NOT NULL,
	directory	VARCHAR(65536) NOT NULL,
	collapsed	BOOLEAN DEFAULT TRUE,
	PRIMARY KEY (user_id, directory),
	FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE
);

CREATE TABLE documents (
	user_id		BIGINT NOT NULL,
	folder		VARCHAR(65536) NOT NULL,
	title		VARCHAR(50) NOT NULL,
	delta		VARCHAR(10485760) NOT NULL,
	created		TIMESTAMPTZ NOT NULL,
	modified	TIMESTAMPTZ,
	PRIMARY KEY (user_id, folder, title),
	FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE,
	FOREIGN KEY (user_id, folder) REFERENCES file_directory (user_id, directory) ON UPDATE CASCADE
);

SET TIMEZONE = 'America/Denver';

INSERT INTO users (username, password, created_on)
VALUES ('test', '', NOW()), ('dummy', '', NOW());

INSERT INTO file_directory (user_id, directory)
SELECT id, folder FROM users
RIGHT JOIN (VALUES
	('test', 'root'),
	('test', 'root/School'),
	('test', 'root/School/CSCI 3308'),
	('test', 'root/School/CSCI 3308/All these layers'),
	('test', 'root/School/CSCI 3308/All these layers/Stop'),
	('test', 'root/School/CSCI 3308/All these layers/Stop/Dont keep going'),
	('test', 'root/School/CSCI 3308/All these layers/Stop/Dont keep going/Please'),
	('test', 'root/School/CSCI 3308/All these layers/Stop/Dont keep going/Please/Please Stop'),
	('test', 'root/School/CSCI 3308/All these layers/Stop/Dont keep going/Please/Please Stop/Secret Folder'),
	('test', 'root/School/CSCI 3308/All these layers/Stop/Dont keep going/Please/Please Stop/Secret Folder/Empty folder'),
	('test', 'root/Personal'),
	('test', 'root/Personal/Work Life Balance'),
	('test', 'root/Empty folder'),
	('dummy', 'root'),
	('dummy', 'root/Personal')
) AS dir (owner, folder)
ON owner = username;

INSERT INTO documents (user_id, folder, title, delta, created)
SELECT id, folder, title, delta, created FROM users
RIGHT JOIN (VALUES
	('test', 'Look at me!!!', 'root', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}', NOW()),
	('test', 'same document', 'root/School', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}', NOW()),
	('test', 'yuhyuh', 'root/School', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}',		 NOW()),
	('test', 'youknowthedrill', 'root/School/CSCI 3308', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}', NOW()),
	('test', 'alldeezfiles', 'root/Personal', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}',NOW()),
	('test', 'anotha one', 'root/Personal', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}',	 NOW()),
	('dummy', 'anotha one', 'root/Personal', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}', NOW())
) AS doc (owner, title, folder, delta, created)
ON owner = username;

