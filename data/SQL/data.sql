-- set modal
set schema MARKET;

-- create user table
create table USERS
(
    user_id  NUMBER(6) primary key,
    username VARCHAR2(30),
    age      NUMBER(3)
);

-- add data into user table
insert into MARKET.USERS
values (12, 'user1', 18);
insert into MARKET.USERS
values (2, 'user2', 19);
insert into MARKET.USERS
values (3, 'user3', 20);

-- query user table
select * from MARKET.USERS;

-- clean user table
delete from MARKET.USERS;
