DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS file_directory;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
	id BIGSERIAL PRIMARY KEY,
	username 	VARCHAR(60) NOT NULL,
	password 	VARCHAR(60) NOT NULL,
	created_on 	TIMESTAMPTZ NOT NULL,
	last_login 	TIMESTAMPTZ,
	UNIQUE (username)
);

CREATE TABLE IF NOT EXISTS file_directory (
	user_id 	BIGINT NOT NULL,
	parent_id 	SMALLINT NOT NULL,
	folder_id 	SMALLINT NOT NULL,
	folder_name VARCHAR(60) NOT NULL,
	collapsed 	BOOLEAN DEFAULT TRUE,
	UNIQUE (user_id, parent_id, folder_name),
	PRIMARY KEY (user_id, folder_id),
	FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
	user_id 	BIGINT NOT NULL,
	folder 		SMALLINT DEFAULT 0,
	title 		VARCHAR(60) NOT NULL,
	delta 		JSON,
	created 	TIMESTAMPTZ NOT NULL,
	modified 	TIMESTAMPTZ,heroku container:push web -a