CREATE TABLE CodeWave.student_data (
	student_id VARCHAR (50) NOT NULL PRIMARY KEY,
	full_name  VARCHAR (100) NOT NULL,
	stack VARCHAR (50) NOT NULL,
	email varchar  (100) unique
);

CREATE TABLE CodeWave.student_score (
	score_id varchar (50) not null primary key,
	student_id varchar (50) not null ,
	punctuality_score int not null,
	assignment_score int not null,
	total_score int generated always as (punctuality_score + assignment_score) stored,
	foreign key (student_id) references student_data(student_id)
);

INSERT INTO CodeWave.student_data (
	student_id,
	full_name,
	stack,
	email
) VALUE(
	uuid(),
	"Patrick Njoku",
	"Fullstack",
	"patrick.mydata@gmail.com"
),
(
	uuid(),
	"Michael Chukwu",
	"Frontend",
	"michael@gmail.com"
),
(
uuid(),
"Abraham Lincoln",
"Backend",
"abraham@gmail.com"
),
(
	uuid(),
	"Glory James",
	"Frontend",
	"glory@gmail.com"
),
(
	uuid(),
	"Peter Parker",
	"Backend",
	"peter@gmail.com"
);

INSERT INTO CodeWave.student_score (
	score_id,
	student_id,
	punctuality_score,
	assignment_score,
	total_score
) VALUE (
uuid(),
(SELECT student_id FROM CodeWave.student_data WHERE full_name = "Patrick Njoku"),

)
