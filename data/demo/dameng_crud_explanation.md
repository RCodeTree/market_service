# 达梦数据库 CRUD 操作详解

本文档详细解释了达梦数据库中的 CRUD（创建、读取、更新、删除）操作，基于达梦官方文档 <mcreference link="https://eco.dameng.com/document/dm/zh-cn/sql-dev/" index="0">0</mcreference> 的最佳实践。

## 1. CREATE（创建）操作

### 1.1 表结构创建

```sql
CREATE TABLE EMPLOYEE (
    EMP_ID NUMBER(6) PRIMARY KEY,
    FIRST_NAME VARCHAR2(20) NOT NULL,
    LAST_NAME VARCHAR2(25) NOT NULL,
    EMAIL VARCHAR2(25) UNIQUE NOT NULL,
    PHONE_NUMBER VARCHAR2(20),
    HIRE_DATE DATE NOT NULL,
    JOB_ID VARCHAR2(10) NOT NULL,
    SALARY NUMBER(8,2),
    COMMISSION_PCT NUMBER(2,2),
    MANAGER_ID NUMBER(6),
    DEPARTMENT_ID NUMBER(4)
);
```

**关键特点：**
- `NUMBER(6)`: 数字类型，最多6位整数
- `VARCHAR2(20)`: 变长字符串，最大20个字符
- `PRIMARY KEY`: 主键约束
- `NOT NULL`: 非空约束
- `UNIQUE`: 唯一约束
- `NUMBER(8,2)`: 数字类型，总共8位，小数点后2位

### 1.2 数据插入

#### 单条插入
```sql
INSERT INTO JOB (JOB_ID, JOB_TITLE, MIN_SALARY, MAX_SALARY) VALUES
('IT_PROG', 'Programmer', 4000, 10000);
```

#### 批量插入
```sql
INSERT ALL
    INTO EMPLOYEE (...) VALUES (...)
    INTO EMPLOYEE (...) VALUES (...)
SELECT * FROM DUAL;
```

**达梦数据库特点：**
- 支持 `INSERT ALL` 语法进行批量插入
- 使用 `DATE '2003-06-17'` 格式插入日期
- `DUAL` 是系统虚拟表，用于批量插入的语法要求

## 2. READ（读取）操作

### 2.1 基本查询
```sql
SELECT * FROM EMPLOYEE;
SELECT EMP_ID, FIRST_NAME, LAST_NAME, SALARY FROM EMPLOYEE WHERE SALARY > 8000;
```

### 2.2 高级查询特性

#### 分页查询
```sql
SELECT EMP_ID, FIRST_NAME, LAST_NAME, SALARY
FROM EMPLOYEE
ORDER BY SALARY DESC
LIMIT 5 OFFSET 0;
```

**达梦数据库分页特点：**
- 使用 `LIMIT n OFFSET m` 语法
- `LIMIT 5` 表示返回5条记录
- `OFFSET 0` 表示从第0条开始（跳过0条）

#### 连接查询
```sql
SELECT e.FIRST_NAME, e.LAST_NAME, e.SALARY, d.DEPT_NAME, j.JOB_TITLE
FROM EMPLOYEE e
INNER JOIN DEPARTMENT d ON e.DEPARTMENT_ID = d.DEPT_ID
INNER JOIN JOB j ON e.JOB_ID = j.JOB_ID
WHERE e.SALARY > 5000;
```

#### 窗口函数
```sql
SELECT 
    EMP_ID,
    FIRST_NAME,
    SALARY,
    ROW_NUMBER() OVER (PARTITION BY DEPARTMENT_ID ORDER BY SALARY DESC) as salary_rank,
    DENSE_RANK() OVER (ORDER BY SALARY DESC) as overall_rank,
    LAG(SALARY, 1) OVER (PARTITION BY DEPARTMENT_ID ORDER BY SALARY) as prev_salary
FROM EMPLOYEE;
```

**窗口函数说明：**
- `ROW_NUMBER()`: 行号，相同值也会有不同行号
- `DENSE_RANK()`: 密集排名，相同值排名相同，下一个排名连续
- `LAG()`: 获取前一行的值
- `LEAD()`: 获取后一行的值
- `PARTITION BY`: 分组
- `ORDER BY`: 排序

#### CTE（公共表表达式）
```sql
WITH dept_salary_stats AS (
    SELECT 
        DEPARTMENT_ID,
        AVG(SALARY) as avg_salary,
        MAX(SALARY) as max_salary,
        COUNT(*) as emp_count
    FROM EMPLOYEE
    GROUP BY DEPARTMENT_ID
)
SELECT d.DEPT_NAME, s.avg_salary, s.max_salary, s.emp_count
FROM dept_salary_stats s
JOIN DEPARTMENT d ON s.DEPARTMENT_ID = d.DEPT_ID;
```

## 3. UPDATE（更新）操作

### 3.1 基本更新
```sql
UPDATE EMPLOYEE 
SET SALARY = 25000 
WHERE EMP_ID = 100;
```

### 3.2 多字段更新
```sql
UPDATE EMPLOYEE 
SET SALARY = SALARY * 1.1, 
    PHONE_NUMBER = '515.123.9999'
WHERE DEPARTMENT_ID = 20;
```

### 3.3 基于子查询的更新
```sql
UPDATE EMPLOYEE 
SET SALARY = (
    SELECT MAX_SALARY 
    FROM JOB 
    WHERE JOB.JOB_ID = EMPLOYEE.JOB_ID
) 
WHERE EMP_ID = 104;
```

### 3.4 连接更新
```sql
UPDATE EMPLOYEE e
SET SALARY = (
    SELECT j.MAX_SALARY * 0.8
    FROM JOB j
    WHERE j.JOB_ID = e.JOB_ID
)
WHERE EXISTS (
    SELECT 1 FROM JOB j 
    WHERE j.JOB_ID = e.JOB_ID AND j.MAX_SALARY > e.SALARY
);
```

## 4. DELETE（删除）操作

### 4.1 条件删除
```sql
DELETE FROM EMPLOYEE WHERE EMP_ID = 106;
```

### 4.2 基于子查询的删除
```sql
DELETE FROM EMPLOYEE 
WHERE SALARY < (
    SELECT AVG(SALARY) 
    FROM (
        SELECT SALARY FROM EMPLOYEE
    ) temp
);
```

### 4.3 删除重复记录
```sql
DELETE FROM EMPLOYEE e1
WHERE EXISTS (
    SELECT 1 FROM EMPLOYEE e2
    WHERE e2.EMAIL = e1.EMAIL 
    AND e2.EMP_ID > e1.EMP_ID
);
```

## 5. 高级操作

### 5.1 MERGE 语句（UPSERT）
```sql
MERGE INTO EMPLOYEE target
USING (
    SELECT 107 as EMP_ID, 'John' as FIRST_NAME, 'Doe' as LAST_NAME, 
           'JDOE' as EMAIL, '555.123.4567' as PHONE_NUMBER, 
           DATE '2023-01-01' as HIRE_DATE, 'IT_PROG' as JOB_ID, 
           7000 as SALARY, NULL as COMMISSION_PCT, 103 as MANAGER_ID, 20 as DEPARTMENT_ID
    FROM DUAL
) source ON (target.EMP_ID = source.EMP_ID)
WHEN MATCHED THEN
    UPDATE SET 
        SALARY = source.SALARY,
        PHONE_NUMBER = source.PHONE_NUMBER
WHEN NOT MATCHED THEN
    INSERT (EMP_ID, FIRST_NAME, LAST_NAME, EMAIL, PHONE_NUMBER, HIRE_DATE, JOB_ID, SALARY, COMMISSION_PCT, MANAGER_ID, DEPARTMENT_ID)
    VALUES (source.EMP_ID, source.FIRST_NAME, source.LAST_NAME, source.EMAIL, source.PHONE_NUMBER, source.HIRE_DATE, source.JOB_ID, source.SALARY, source.COMMISSION_PCT, source.MANAGER_ID, source.DEPARTMENT_ID);
```

**MERGE 语句特点：**
- 实现 UPSERT 操作（存在则更新，不存在则插入）
- `WHEN MATCHED THEN UPDATE`: 匹配时执行更新
- `WHEN NOT MATCHED THEN INSERT`: 不匹配时执行插入
- 提高数据同步效率

## 6. 事务控制

### 6.1 事务基本操作
```sql
-- 开始事务
BEGIN;

-- 执行操作
INSERT INTO EMPLOYEE (...) VALUES (...);
UPDATE EMPLOYEE SET SALARY = SALARY + 1000 WHERE DEPARTMENT_ID = 20;

-- 提交事务
COMMIT;

-- 或者回滚事务
-- ROLLBACK;
```

**事务特点：**
- `BEGIN`: 开始事务
- `COMMIT`: 提交事务，使更改永久生效
- `ROLLBACK`: 回滚事务，撤销所有更改
- 保证数据一致性和完整性

## 7. 达梦数据库特有特性

### 7.1 数据类型
- `NUMBER(p,s)`: 数字类型，p为总位数，s为小数位数
- `VARCHAR2(n)`: 变长字符串，最大n个字符
- `DATE`: 日期时间类型
- `CLOB`: 大文本对象
- `BLOB`: 大二进制对象

### 7.2 函数和操作符
- `SYSDATE`: 系统当前日期时间
- `DUAL`: 系统虚拟表
- `||`: 字符串连接操作符
- `NVL(expr1, expr2)`: 空值处理函数

### 7.3 索引和约束
```sql
-- 创建索引
CREATE INDEX idx_emp_salary ON EMPLOYEE(SALARY);

-- 添加约束
ALTER TABLE EMPLOYEE ADD CONSTRAINT fk_emp_dept 
FOREIGN KEY (DEPARTMENT_ID) REFERENCES DEPARTMENT(DEPT_ID);
```

## 8. 性能优化建议

### 8.1 查询优化
1. **使用索引**: 在经常查询的列上创建索引
2. **避免全表扫描**: 使用 WHERE 条件过滤数据
3. **合理使用连接**: 选择合适的连接类型
4. **分页查询**: 使用 LIMIT 限制返回结果数量

### 8.2 插入优化
1. **批量插入**: 使用 INSERT ALL 或批量操作
2. **禁用约束**: 大量数据插入时临时禁用约束
3. **使用绑定变量**: 避免硬解析

### 8.3 更新和删除优化
1. **使用索引**: 确保 WHERE 条件使用索引
2. **分批处理**: 大量数据更新时分批进行
3. **避免全表更新**: 使用具体的 WHERE 条件

## 9. 最佳实践

1. **命名规范**: 使用有意义的表名和列名
2. **数据类型选择**: 选择合适的数据类型和长度
3. **约束设计**: 合理设置主键、外键、唯一约束
4. **事务管理**: 合理控制事务范围
5. **错误处理**: 添加适当的错误处理机制
6. **性能监控**: 定期监控和优化查询性能

## 10. 常见问题和解决方案

### 10.1 字符集问题
- 确保客户端和服务器字符集一致
- 使用正确的字符集创建数据库

### 10.2 日期格式问题
- 使用 `DATE '2023-01-01'` 格式插入日期
- 使用 `TO_DATE()` 函数转换字符串为日期

### 10.3 性能问题
- 检查执行计划
- 优化 SQL 语句
- 创建合适的索引

这个 CRUD 演示涵盖了达梦数据库的主要操作，可以作为开发和学习的参考。建议在实际使用时根据具体业务需求进行调整和优化。