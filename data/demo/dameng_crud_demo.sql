-- 达梦数据库 CRUD 操作演示
-- 基于达梦数据库官方文档示例
-- 文档参考：https://eco.dameng.com/document/dm/zh-cn/sql-dev/

-- ========================================
-- 1. 创建表结构 (CREATE)
-- ========================================

-- 创建员工表
CREATE TABLE EMPLOYEE
(
    EMP_ID         NUMBER(6) PRIMARY KEY,
    FIRST_NAME     VARCHAR2(20) NOT NULL,
    LAST_NAME      VARCHAR2(25) NOT NULL,
    EMAIL          VARCHAR2(25) UNIQUE NOT NULL,
    PHONE_NUMBER   VARCHAR2(20),
    HIRE_DATE      DATE NOT NULL,
    JOB_ID         VARCHAR2(10) NOT NULL,
    SALARY         NUMBER(8,2),
    COMMISSION_PCT NUMBER(2,2),
    MANAGER_ID     NUMBER(6),
    DEPARTMENT_ID  NUMBER(4)
);

-- 创建部门表
CREATE TABLE DEPARTMENT
(
    DEPT_ID     NUMBER(4) PRIMARY KEY,
    DEPT_NAME   VARCHAR2(30) NOT NULL,
    MANAGER_ID  NUMBER(6),
    LOCATION_ID NUMBER(4)
);

-- 创建职位表
CREATE TABLE JOB
(
    JOB_ID     VARCHAR2(10) PRIMARY KEY,
    JOB_TITLE  VARCHAR2(35) NOT NULL,
    MIN_SALARY NUMBER(6),
    MAX_SALARY NUMBER(6)
);

-- ========================================
-- 2. 插入数据 (INSERT)
-- ========================================

-- 插入职位数据
INSERT INTO JOB (JOB_ID, JOB_TITLE, MIN_SALARY, MAX_SALARY)
VALUES ('IT_PROG', 'Programmer', 4000, 10000);

INSERT INTO JOB (JOB_ID, JOB_TITLE, MIN_SALARY, MAX_SALARY)
VALUES ('SA_MAN', 'Sales Manager', 10000, 20000);

INSERT INTO JOB (JOB_ID, JOB_TITLE, MIN_SALARY, MAX_SALARY)
VALUES ('SA_REP', 'Sales Representative', 6000, 12000);

-- 插入部门数据
INSERT INTO DEPARTMENT (DEPT_ID, DEPT_NAME, MANAGER_ID, LOCATION_ID)
VALUES (10, 'Administration', 200, 1700);

INSERT INTO DEPARTMENT (DEPT_ID, DEPT_NAME, MANAGER_ID, LOCATION_ID)
VALUES (20, 'Marketing', 201, 1800);

INSERT INTO DEPARTMENT (DEPT_ID, DEPT_NAME, MANAGER_ID, LOCATION_ID)
VALUES (30, 'Purchasing', 114, 1700);

INSERT INTO DEPARTMENT (DEPT_ID, DEPT_NAME, MANAGER_ID, LOCATION_ID)
VALUES (40, 'Human Resources', 203, 2400);

-- 插入员工数据
INSERT INTO EMPLOYEE (EMP_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, HIRE_DATE, JOB_ID, SALARY, COMMISSION_PCT,
                      MANAGER_ID, DEPARTMENT_ID)
VALUES (100, 'Steven', 'King', 'SKING', '515.123.4567', DATE '2003-06-17', 'SA_MAN', 24000, NULL, NULL, 10);

INSERT INTO EMPLOYEE (EMP_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, HIRE_DATE, JOB_ID, SALARY, COMMISSION_PCT,
                      MANAGER_ID, DEPARTMENT_ID)
VALUES (101, 'Neena', 'Kochhar', 'NKOCHHAR', '515.123.4568', DATE '2005-09-21', 'SA_MAN', 17000, NULL, 100, 10);

INSERT INTO EMPLOYEE (EMP_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, HIRE_DATE, JOB_ID, SALARY, COMMISSION_PCT,
                      MANAGER_ID, DEPARTMENT_ID)
VALUES (102, 'Lex', 'De Haan', 'LDEHAAN', '515.123.4569', DATE '2001-01-13', 'SA_MAN', 17000, NULL, 100, 10);

INSERT INTO EMPLOYEE (EMP_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, HIRE_DATE, JOB_ID, SALARY, COMMISSION_PCT,
                      MANAGER_ID, DEPARTMENT_ID)
VALUES (103, 'Alexander', 'Hunold', 'AHUNOLD', '590.423.4567', DATE '2006-01-03', 'IT_PROG', 9000, NULL, 102, 20);

INSERT INTO EMPLOYEE (EMP_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, HIRE_DATE, JOB_ID, SALARY, COMMISSION_PCT,
                      MANAGER_ID, DEPARTMENT_ID)
VALUES (104, 'Bruce', 'Ernst', 'BERNST', '590.423.4568', DATE '2007-05-21', 'IT_PROG', 6000, NULL, 103, 20);

-- 批量插入示例
INSERT
ALL
    INTO EMPLOYEE (EMP_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, HIRE_DATE, JOB_ID, SALARY, COMMISSION_PCT, MANAGER_ID, DEPARTMENT_ID)
    VALUES (105, 'David', 'Austin', 'DAUSTIN', '590.423.4569', DATE '2005-06-25', 'IT_PROG', 4800, NULL, 103, 20)
    INTO EMPLOYEE (EMP_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, HIRE_DATE, JOB_ID, SALARY, COMMISSION_PCT, MANAGER_ID, DEPARTMENT_ID)
    VALUES (106, 'Valli', 'Pataballa', 'VPATABAL', '590.423.4560', DATE '2006-02-05', 'IT_PROG', 4800, NULL, 103, 20)
SELECT *
FROM DUAL;

-- ========================================
-- 3. 查询数据 (SELECT)
-- ========================================

-- 基本查询
SELECT *
FROM EMPLOYEE;

-- 条件查询
SELECT EMP_ID, FIRST_NAME, LAST_NAME, SALARY
FROM EMPLOYEE
WHERE SALARY > 8000;

-- 排序查询
SELECT EMP_ID, FIRST_NAME, LAST_NAME, SALARY
FROM EMPLOYEE
ORDER BY SALARY DESC;

-- 分组查询
SELECT DEPARTMENT_ID, COUNT(*) AS EMP_COUNT, AVG(SALARY) AS AVG_SALARY
FROM EMPLOYEE
GROUP BY DEPARTMENT_ID
HAVING COUNT(*) > 1;

-- 连接查询
SELECT e.FIRST_NAME, e.LAST_NAME, e.SALARY, d.DEPT_NAME, j.JOB_TITLE
FROM EMPLOYEE e
         INNER JOIN DEPARTMENT d ON e.DEPARTMENT_ID = d.DEPT_ID
         INNER JOIN JOB j ON e.JOB_ID = j.JOB_ID
WHERE e.SALARY > 5000;

-- 子查询
SELECT FIRST_NAME, LAST_NAME, SALARY
FROM EMPLOYEE
WHERE SALARY > (SELECT AVG(SALARY) FROM EMPLOYEE);

-- 分页查询（达梦数据库使用 LIMIT 语法）
SELECT EMP_ID, FIRST_NAME, LAST_NAME, SALARY
FROM EMPLOYEE
ORDER BY SALARY DESC LIMIT 5
OFFSET 0;
-- 查询前5条记录

-- 模糊查询
SELECT EMP_ID, FIRST_NAME, LAST_NAME
FROM EMPLOYEE
WHERE FIRST_NAME LIKE 'A%';

-- 范围查询
SELECT EMP_ID, FIRST_NAME, LAST_NAME, SALARY
FROM EMPLOYEE
WHERE SALARY BETWEEN 5000 AND 10000;

-- 空值查询
SELECT EMP_ID, FIRST_NAME, LAST_NAME, COMMISSION_PCT
FROM EMPLOYEE
WHERE COMMISSION_PCT IS NULL;

-- ========================================
-- 4. 更新数据 (UPDATE)
-- ========================================

-- 单条记录更新
UPDATE EMPLOYEE
SET SALARY = 25000
WHERE EMP_ID = 100;

-- 多字段更新
UPDATE EMPLOYEE
SET SALARY       = SALARY * 1.1,
    PHONE_NUMBER = '515.123.9999'
WHERE DEPARTMENT_ID = 20;

-- 条件更新
UPDATE EMPLOYEE
SET COMMISSION_PCT = 0.05
WHERE JOB_ID = 'SA_REP'
  AND SALARY > 8000;

-- 基于子查询的更新
UPDATE EMPLOYEE
SET SALARY = (SELECT MAX_SALARY
              FROM JOB
              WHERE JOB.JOB_ID = EMPLOYEE.JOB_ID)
WHERE EMP_ID = 104;

-- 连接更新
UPDATE EMPLOYEE e
SET SALARY = (SELECT j.MAX_SALARY * 0.8
              FROM JOB j
              WHERE j.JOB_ID = e.JOB_ID)
WHERE EXISTS (SELECT 1
              FROM JOB j
              WHERE j.JOB_ID = e.JOB_ID
                AND j.MAX_SALARY > e.SALARY);

-- ========================================
-- 5. 删除数据 (DELETE)
-- ========================================

-- 条件删除
DELETE
FROM EMPLOYEE
WHERE EMP_ID = 106;

-- 批量删除
DELETE
FROM EMPLOYEE
WHERE DEPARTMENT_ID = 30;

-- 基于子查询的删除
DELETE
FROM EMPLOYEE
WHERE SALARY < (SELECT AVG(SALARY)
                FROM (SELECT SALARY
                      FROM EMPLOYEE) temp);

-- 删除重复记录（保留一条）
DELETE
FROM EMPLOYEE e1
WHERE EXISTS (SELECT 1
              FROM EMPLOYEE e2
              WHERE e2.EMAIL = e1.EMAIL
                AND e2.EMP_ID > e1.EMP_ID);

-- ========================================
-- 6. 高级操作示例
-- ========================================

-- 使用 MERGE 语句进行 UPSERT 操作
MERGE INTO EMPLOYEE target
    USING (SELECT 107               as EMP_ID,
                  'John'            as FIRST_NAME,
                  'Doe'             as LAST_NAME,
                  'JDOE'            as EMAIL,
                  '555.123.4567'    as PHONE_NUMBER,
                  DATE '2023-01-01' as HIRE_DATE,
                  'IT_PROG'         as JOB_ID,
                  7000              as SALARY,
                  NULL              as COMMISSION_PCT,
                  103               as MANAGER_ID,
                  20                as DEPARTMENT_ID
           FROM DUAL) source ON (target.EMP_ID = source.EMP_ID)
    WHEN MATCHED THEN
        UPDATE SET
            SALARY = source.SALARY,
            PHONE_NUMBER = source.PHONE_NUMBER
    WHEN NOT MATCHED THEN
        INSERT (EMP_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, HIRE_DATE, JOB_ID, SALARY, COMMISSION_PCT,
                MANAGER_ID, DEPARTMENT_ID)
            VALUES (source.EMP_ID, source.FIRST_NAME, source.LAST_NAME, source.EMAIL, source.PHONE_NUMBER,
                    source.HIRE_DATE, source.JOB_ID, source.SALARY, source.COMMISSION_PCT, source.MANAGER_ID,
                    source.DEPARTMENT_ID);

-- 使用 CTE（公共表表达式）
WITH dept_salary_stats AS (SELECT DEPARTMENT_ID,
                                  AVG(SALARY) as avg_salary,
                                  MAX(SALARY) as max_salary,
                                  MIN(SALARY) as min_salary,
                                  COUNT(*)    as emp_count
                           FROM EMPLOYEE
                           GROUP BY DEPARTMENT_ID)
SELECT d.DEPT_NAME,
       s.avg_salary,
       s.max_salary,
       s.min_salary,
       s.emp_count
FROM dept_salary_stats s
         JOIN DEPARTMENT d ON s.DEPARTMENT_ID = d.DEPT_ID
ORDER BY s.avg_salary DESC;

-- 窗口函数示例
SELECT EMP_ID,
       FIRST_NAME,
       LAST_NAME,
       SALARY,
       DEPARTMENT_ID,
       ROW_NUMBER() OVER (PARTITION BY DEPARTMENT_ID ORDER BY SALARY DESC) as salary_rank, DENSE_RANK() OVER (ORDER BY SALARY DESC) as overall_rank, LAG(SALARY, 1) OVER (PARTITION BY DEPARTMENT_ID ORDER BY SALARY) as prev_salary, LEAD(SALARY, 1) OVER (PARTITION BY DEPARTMENT_ID ORDER BY SALARY) as next_salary
FROM EMPLOYEE
ORDER BY DEPARTMENT_ID, SALARY DESC;

-- ========================================
-- 7. 事务控制示例
-- ========================================

-- 开始事务
BEGIN;

-- 执行多个操作
INSERT INTO EMPLOYEE (EMP_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, HIRE_DATE, JOB_ID, SALARY, COMMISSION_PCT,
                      MANAGER_ID, DEPARTMENT_ID)
VALUES (108, 'Test', 'User', 'TUSER', '555.999.8888', SYSDATE, 'IT_PROG', 5000, NULL, 103, 20);

UPDATE EMPLOYEE
SET SALARY = SALARY + 1000
WHERE DEPARTMENT_ID = 20;

-- 提交事务
COMMIT;

-- 回滚事务示例
BEGIN;
DELETE
FROM EMPLOYEE
WHERE EMP_ID = 108;
-- 如果需要回滚，使用：
-- ROLLBACK;
COMMIT;

-- ========================================
-- 8. 清理数据（可选）
-- ========================================

-- 删除表数据
-- TRUNCATE TABLE EMPLOYEE;
-- TRUNCATE TABLE DEPARTMENT;
-- TRUNCATE TABLE JOB;

-- 删除表结构
-- DROP TABLE EMPLOYEE;
-- DROP TABLE DEPARTMENT;
-- DROP TABLE JOB;

-- 查看执行结果
SELECT 'CRUD操作演示完成' as MESSAGE
FROM DUAL;