CREATE TABLE users (
	id BIGSERIAL PRIMARY KEY,
	username	VARCHAR(50)  NOT NULL,
	password	VARCHAR(200) NOT NULL,
	created_on	TIMESTAMPTZ  NOT NULL,
	last_login	TIMESTAMPTZ,
	UNIQUE (username)
);

CREATE TABLE documents (
	user_id		BIGINT NOT NULL,
	folder		VARCHAR(65536) NOT NULL,
	title		VARCHAR(50) NOT NULL,
	delta		VARCHAR(10485760) NOT NULL,
	created		TIMESTAMPTZ NOT NULL,
	modified	TIMESTAMPTZ,
	PRIMARY KEY (user_id, folder, title),
	FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE
);

SET TIMEZONE = 'America/Denver';

INSERT INTO users (username, password, created_on)
VALUES ('test', '', NOW()), ('dummy', '', NOW());

INSERT INTO documents (user_id, folder, title, delta, created)
SELECT id, folder, title, delta, created FROM users
RIGHT JOIN (VALUES
	('test', 'Look at me!!!', 'root', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}', NOW()),
	('test', 'same document', 'root/school', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}', NOW()),
	('test', 'yuhyuh', 'root/school', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}',		 NOW()),
	('test', 'youknowthedrill', 'root/school/CSCI 3308', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}', NOW()),
	('test', 'alldeezfiles', 'root/personal', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}',NOW()),
	('test', 'anotha one', 'root/personal', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}',	 NOW()),
	('dummy', 'anotha one', 'root/personal', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}', NOW())
) AS doc (owner, title, folder, delta, created)
ON owner = username;

