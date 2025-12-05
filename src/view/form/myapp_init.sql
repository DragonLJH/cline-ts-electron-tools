-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS myapp DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE myapp;

-- 创建用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    email VARCHAR(100) UNIQUE COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    nickname VARCHAR(50) COMMENT '昵称',
    real_name VARCHAR(50) COMMENT '真实姓名',
    gender TINYINT COMMENT '性别：1男，2女',
    birthday DATE COMMENT '生日',
    avatar VARCHAR(255) COMMENT '头像URL',
    status TINYINT DEFAULT 1 COMMENT '状态：1正常，0禁用',
    is_deleted TINYINT DEFAULT 0 COMMENT '是否删除：0否，1是',
    last_login_time DATETIME COMMENT '最后登录时间',
    last_login_ip VARCHAR(45) COMMENT '最后登录IP',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_phone (phone)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户表';

-- 创建角色表
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL COMMENT '角色名称',
    code VARCHAR(50) UNIQUE NOT NULL COMMENT '角色编码',
    description VARCHAR(255) COMMENT '角色描述',
    status TINYINT DEFAULT 1 COMMENT '状态：1启用，0禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '角色表';

-- 创建权限表
CREATE TABLE permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL COMMENT '权限名称',
    code VARCHAR(100) UNIQUE NOT NULL COMMENT '权限编码',
    type TINYINT DEFAULT 1 COMMENT '类型：1菜单，2按钮，3接口',
    parent_id BIGINT DEFAULT 0 COMMENT '父权限ID',
    path VARCHAR(255) COMMENT '权限路径',
    method VARCHAR(10) COMMENT '请求方法',
    description VARCHAR(255) COMMENT '权限描述',
    status TINYINT DEFAULT 1 COMMENT '状态：1启用，0禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_parent_id (parent_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '权限表';

-- 创建用户角色关联表
CREATE TABLE user_roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_role (user_id, role_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '用户角色关联表';

-- 创建角色权限关联表
CREATE TABLE role_permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL COMMENT '角色ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_role_permission (role_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id),
    FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = '角色权限关联表';

-- 插入示例数据（可选）
-- 插入管理员角色
INSERT INTO
    roles (name, code, description)
VALUES (
        '超级管理员',
        'SUPER_ADMIN',
        '拥有所有权限'
    );

INSERT INTO
    roles (name, code, description)
VALUES ('普通用户', 'USER', '普通用户权限');

-- 插入一些基础权限
INSERT INTO
    permissions (
        name,
        code,
        type,
        path,
        method,
        description
    )
VALUES (
        '用户管理',
        'user:manage',
        1,
        '/users',
        'GET',
        '查看用户列表'
    ),
    (
        '添加用户',
        'user:add',
        2,
        '/users',
        'POST',
        '添加新用户'
    ),
    (
        '编辑用户',
        'user:edit',
        2,
        '/users/*',
        'PUT',
        '编辑用户信息'
    ),
    (
        '删除用户',
        'user:delete',
        2,
        '/users/*',
        'DELETE',
        '删除用户'
    );

-- 给超级管理员角色分配所有权限
INSERT INTO
    role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE
    r.code = 'SUPER_ADMIN';

-- 插入更多角色
INSERT INTO
    roles (name, code, description)
VALUES ('管理员', 'ADMIN', '系统管理员'),
    ('编辑员', 'EDITOR', '内容编辑员'),
    ('访客', 'GUEST', '访客用户');
-- 插入用户示例数据（密码使用MD5加密示例，实际应用中应使用更安全的加密方式）
INSERT INTO
    users (
        username,
        password,
        email,
        phone,
        nickname,
        real_name,
        gender,
        birthday,
        avatar,
        status,
        is_deleted
    )
VALUES (
        'admin',
        MD5('admin123'),
        'admin@example.com',
        '13800138001',
        '超级管理员',
        '张三',
        1,
        '1980-01-01',
        '/avatars/admin.jpg',
        1,
        0
    ),
    (
        'editor',
        MD5('editor123'),
        'editor@example.com',
        '13800138002',
        '编辑小王',
        '李四',
        2,
        '1990-05-15',
        '/avatars/editor.jpg',
        1,
        0
    ),
    (
        'user1',
        MD5('user123'),
        'user1@example.com',
        '13800138003',
        '用户小明',
        '王五',
        1,
        '1995-08-20',
        '/avatars/user1.jpg',
        1,
        0
    ),
    (
        'user2',
        MD5('user123'),
        'user2@example.com',
        '13800138004',
        '用户小红',
        '赵六',
        2,
        '1992-12-10',
        '/avatars/user2.jpg',
        1,
        0
    ),
    (
        'guest',
        MD5('guest123'),
        'guest@example.com',
        '13800138005',
        '访客用户',
        '刘七',
        1,
        '1988-03-25',
        '/avatars/guest.jpg',
        1,
        0
    );

-- 分配用户角色
INSERT INTO
    user_roles (user_id, role_id)
VALUES (1, 1), -- admin -> SUPER_ADMIN
    (2, 3), -- editor -> EDITOR
    (3, 4), -- user1 -> USER
    (4, 4), -- user2 -> USER
    (5, 5);
-- guest -> GUEST