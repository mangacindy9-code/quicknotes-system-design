# QuickNotes Data Model Document

This document defines the relational database schema, entities, query examples, indexing strategies, and database selection rationale for QuickNotes.

---

## 1. Entities & Schema Definition

The database consists of four core tables:
1. `users`: Stores registered user account details.
2. `notes`: Stores notes created by users.
3. `tags`: Stores user-defined categories.
4. `note_tags`: Junction table establishing a many-to-many relationship between notes and tags.

### Relationships
* **User to Notes (One-to-Many):** One user can own multiple notes. Each note belongs to exactly one user (`users.id -> notes.user_id`).
* **Notes to Tags (Many-to-Many):** One note can have multiple tags, and one tag can be applied to multiple notes. This is realized via the `note_tags` junction table.

---

## 2. SQL CREATE TABLE Statements

```sql
-- 1. Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Notes Table
CREATE TABLE notes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tags Table
CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_tag UNIQUE (user_id, name)
);

-- 4. Note_Tags Junction Table
CREATE TABLE note_tags (
    note_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
