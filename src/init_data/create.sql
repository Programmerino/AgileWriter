CREATE TABLE users (
	id BIGSERIAL PRIMARY KEY,
	username	VARCHAR(60)  NOT NULL,
	password	VARCHAR(60) NOT NULL,
	created_on	TIMESTAMPTZ  NOT NULL,
	last_login	TIMESTAMPTZ,
	UNIQUE (username)
);

CREATE TABLE file_directory (
	user_id		BIGINT NOT NULL,
	hash_id		VARCHAR(200) DEFAULT 'UNINITIALIZED',
	directory	VARCHAR(65536) NOT NULL,
	collapsed	BOOLEAN DEFAULT TRUE,
	PRIMARY KEY (user_id, directory),
	FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE,
	CONSTRAINT reserved_name CHECK (directory <> 'root/UpdateState')
);

CREATE TABLE documents (
	user_id		BIGINT NOT NULL,
	folder		VARCHAR(65536) NOT NULL,
	title		VARCHAR(60) NOT NULL,
	delta		JSON NOT NULL,
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
	('test', 'Look at me!!!', 'root',
		'{"ops":[{"attributes":{"size":"16px","color":"#000000","bold":true},"insert":"It was quiet. Almost too quiet."},{"attributes":{"size":"16px","color":"#000000"},"insert":" I could hear my heart pounding in my ears, and I was sure I could hear the slow, steady breathing of the person in the room with me. I was trying to stay calm, but I was having a hard time doing it. I was so scared."},{"insert":"\\n\\nI heard the footsteps of the person who was with me, and then I heard the sound of a door opening. The footsteps stopped, and then I heard the sound of a door closing. I was so scared. I had no idea what was going to happen next.\\n\\nI was sitting on the edge of my bed, and I could hear the footsteps of\\n"}]}'::jsonb,
	NOW()),
	('test', 'same document', 'root/School', 
		'{"ops":[{"attributes":{"size":"16px","color":"#000000","bold":true},"insert":"This is the same document. What do you think?"},{"insert":"\n\n"},{"attributes":{"size":"16px","color":"#000000","bold":true},"insert":"A:"},{"insert":"\n\n"},{"attributes":{"size":"16px","color":"#000000","bold":true},"insert":"This should be an answer."},{"insert":"\n"},{"attributes":{"size":"16px","color":"#000000","bold":true},"insert":"This is a PDF of the original version."},{"insert":"\n\n"},{"attributes":{"size":"16px","color":"#000000","bold":true},"insert":"A:"},{"insert":"\n\n"},{"attributes":{"size":"16px","color":"#000000","bold":true},"insert":"I would expect this to be a complete answer. "},{"insert":"\n"},{"attributes":{"size":"16px","color":"#000000","bold":true},"insert":"That said, there''s no such thing as an ''original version'' of a document. In this case, it is just a different version of the same document."},{"insert":"\n"}]}'::jsonb,
	NOW()),
	('test', 'yuhyuh', 'root/School',
		'{"ops":[{"attributes":{"size":"16px","color":"#000000","bold":true},"insert":"To prove that image of a linear transformation is a subspace of domain vectorial space you need use definitions."},{"insert":"\n"},{"attributes":{"size":"16px","color":"#000000"},"insert":"For your question it''s necessary to define:"},{"insert":"\n"},{"attributes":{"size":"16px","color":"#000000"},"insert":"$T: V\\\\to W$ "},{"insert":"\n"},{"attributes":{"size":"16px","color":"#000000"},"insert":"Linear transformation means:"},{"insert":"\n"},{"attributes":{"size":"16px","color":"#000000"},"insert":"T(v_1+v_2)=T(v_1)+T(v_2)"},{"insert":"\n"},{"attributes":{"size":"16px","color":"#000000","bold":true},"insert":"And subspace is:"},{"insert":"\n"},{"attributes":{"size":"16px","color":"#000000"},"insert":"$\\\\left\\\\{v_1+v_2|v_1,v_2\\\\in V\\\\right\\\\}$"},{"insert":"\n"},{"attributes":{"size":"16px","color":"#000000"},"insert":"So $Im(T)=\\\\left\\\\{T(v_1+v_2)|v_1,v_2\\\\in V\\\\right\\\\}$"},{"insert":"\n"},{"attributes":{"size":"16px","color":"#000000"},"insert":"Now you can start your"},{"insert":"\n"}]}'::jsonb,
	NOW()),
	('test', 'youknowthedrill', 'root/School/CSCI 3308',
		'{"ops":[{"attributes":{"size":"16px","color":"#000000","bold":true},"insert":"You know the drill"},{"attributes":{"size":"16px","color":"#000000"},"insert":". You’ve been there before."},{"insert":"\n\n"},{"attributes":{"size":"16px","color":"#000000"},"insert":"You get to the grocery store, pick up your list, and you start to make your way through the aisles. You’re thinking about what you’re going to make for dinner, and you start to think about what you’re going to make for breakfast. You’re going to make some breakfast, right? You’re going to make some breakfast."},{"insert":"\n\n"},{"attributes":{"size":"16px","color":"#000000"},"insert":"And then you start to think about lunch. You’re going to make some lunch, right? You’re going to make some lunch."},{"insert":"\n\n"},{"attributes":{"size":"16px","color":"#000000"},"insert":"And"},{"insert":"\n"}]}'::jsonb,
	NOW()),
	('test', 'alldeezfiles', 'root/Personal',
		'{"ops":[{"attributes":{"size":"16px","color":"#000000","bold":true},"insert":"All of these files and no way to organize them"},{"attributes":{"size":"16px","color":"#000000"},"insert":"."},{"insert":"\n"},{"attributes":{"size":"13px"},"insert":"Worse, I have no clue how to work with a spreadsheet program. I started using LibreOffice Calc, but I don''t even know how to open a spreadsheet file. I tried the \"Open with\" dialog, but it only has the LibreOffice Calc app available. How can I get my data organized? I have to say, it''s a real pain to have a data collection that is very well-organized, but a pain to view it. I''d be much happier with a way to store my data and a way to view it."},{"insert":"\n\n"},{"attributes":{"size":"13px","color":"#000000"},"insert":"Don''t even get me started with Visual Basic. The code is a "},{"attributes":{"size":"13px"},"insert":"catastrophic nightmare of indentation errors, dangling pointers, and possible memory leaks. You''re better off writing a C program and using a text editor to modify it. The only problem with C++ is that it is far too popular and the standard is overly complicated. I think that if a language is designed by committee, it will be a failure."},{"insert":"\n\n"},{"attributes":{"size":"13px"},"insert":"You can write a lot of C++ without ever dealing with pointers, stacks, or heaps. It is not as easy as it may seem at first."},{"insert":"\n"},{"attributes":{"size":"13px"},"insert":"The Java language, on the other hand,"},{"insert":" is a language that is very easy to use. It is easy to write programs in Java, and it is easy to write programs that use Java.\n\n"},{"attributes":{"bold":true},"insert":"Take this java code snippet for example:"},{"insert":"\npublic class Main {"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"  public static void main(String[] args) {"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    int[] array = new int[10];"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    for (int i = 0; i < array.length; i++) {"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"      array[i] = i;"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    }"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"    System.out.println(Arrays.toString(array));"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"  }"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"}"},{"attributes":{"code-block":true},"insert":"\n"},{"insert":"\nThe output is:\n[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]"},{"attributes":{"code-block":true},"insert":"\n"}]}'::jsonb,
	NOW()),
	('test', 'japacheeze', 'root/Personal/Work Life Balance',
		'{"ops":[{"attributes":{"size":"16px","bold":true},"insert":"The japanese have this saying about having a \"work-life balance\""},{"insert":"\nand it''s something I''m constantly working on. I don''t think it''s possible to have a \"perfect\" balance, but I do think it''s possible to have a good balance. I have a work-life balance and I have a personal life balance. I think it''s important to have both.\n\nSo, in this post, I''m going to talk about my work-life balance and my personal life balance. I''m going to talk about how I''ve been balancing my work and my personal life for the past two years and how I''m going to continue to balance them.\n\n"},{"attributes":{"size":"16px","bold":true},"insert":"The last two years..."},{"insert":"\nI''ll start with my current work-life balance. I started a job with some new clients at a design firm a little over two years ago. I started in the winter of 2015. I left my job at a magazine that I worked at from 2014 to 2015 to join a new firm. My personal life is almost always at a standstill when I''m at work because I''m working from 9-5 and I spend my free time doing stuff for my job, but I have the flexibility to spend as much time as I want to with friends and family, or do fun things like attend a museum or go hiking or camping or what have you. I didn''t really have a problem finding time to do fun things because I had a ton of free time in the winter when I was working and my workload wasn''t as bad.\n\nIn the summer of 2016, the new firm I joined started offering a part-time employee position and I decided to give it a try. I was one of two employees hired for the position. One of the two employees was me. We were both given the same position and had to take on the same amount of hours. We were both expected to come in every day at the same time and be at work for a similar\n"}]}'::jsonb,
	NOW()),
	('test', 'porn', 'root/School/CSCI 3308/All these layers/Stop/Dont keep going/Please/Please Stop/Secret Folder',
		'{"ops":[{"attributes":{"size":"16px","color":"#000000","bold":true},"insert":"The psychological factors that motivate porn"},{"attributes":{"size":"16px","color":"#000000"},"insert":" use, such as boredom, loneliness, and sexual desire, have been well-studied. However, the role of the brain’s reward circuitry in porn use has been largely overlooked."},{"insert":"\n\n"},{"attributes":{"size":"16px","color":"#000000"},"insert":"In the first part of this two-part series, we explored the role of the brain’s reward circuitry in addiction. In the second part, we will explore the role of the brain’s reward circuitry in porn use."},{"insert":"\n\n"},{"attributes":{"size":"16px","color":"#000000"},"insert":"Pornography is a form of addiction, and as such, it shares many of the same characteristics as other addictions. For example, the brain’s reward circuitry is involved"},{"insert":"\n"}]}'::jsonb,
	NOW()),
	('test', 'anotha one', 'root/Personal',
		'{"ops":[{"attributes":{"bold":true},"insert":"Gandalf"},{"insert":" the "},{"attributes":{"color":"#cccccc"},"insert":"Grey"},{"insert":"\n"}]}'::jsonb,
	NOW()),
	('dummy', 'anotha one', 'root/Personal',
		'{"ops":[{"attributes":{"bold":true},"insert":"Gandalf"},{"insert":" the "},{"attributes":{"color":"#cccccc"},"insert":"Grey"},{"insert":"\n"}]}'::jsonb,
	NOW())
) AS doc (owner, title, folder, delta, created)
ON owner = username;

