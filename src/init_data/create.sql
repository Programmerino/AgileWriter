CREATE TABLE users(
	id BIGSERIAL PRIMARY KEY NOT NULL,
	username VARCHAR(50) UNIQUE NOT NULL,
	password VARCHAR(200) NOT NULL,
	created_on TIMESTAMPTZ NOT NULL,
	last_login TIMESTAMPTZ
);

CREATE TABLE documents(
	user_id BIGINT NOT NULL,
	title VARCHAR(100) NOT NULL,
	folder VARCHAR (50) NOT NULL,
	delta VARCHAR(10485760) NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users (id),
	CONSTRAINT unique_file UNIQUE (user_id, title, folder)
);

SET TIMEZONE = 'America/Denver';

INSERT INTO users (username, password, created_on)
VALUES ('admin', '', NOW()), ('lackey', '', NOW());

INSERT INTO documents (user_id, title, folder, delta)
SELECT id, title, folder, delta FROM users
RIGHT JOIN (VALUES
	('admin', 'same document',		'jamesfolder', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}'),
	('admin', 'yuhyuh',				'jamesfolder', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}'),
	('admin', 'youknowthedrill',	'jamesfolder', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}'),
	('admin', 'alldeezfiles',		'jamesfolder', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}'),
	('admin', 'anotha one',			'jamesfolder', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}'),
	('lackey', 'anotha one',		'jamesfolder', '{{"ops": [{"insert": "Gandalf the Grey\n"}]}}')
) AS doc (owner, title, folder, delta)
ON owner = username;

