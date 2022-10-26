CREATE TABLE userdata (
    userid SERIAL PRIMARY KEY,
    username varchar(20) UNIQUE,
    group_tag varchar(4),
    isadmin boolean NOT NULL,
    pwdhash varchar(60),
    salt varchar(60)
)