# QuickNotes REST API Specification

This document specifies the backend REST API endpoints for the production QuickNotes service.

---

## 1. API Endpoints Table

| Method | Path | Description | Success Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notes` | List paginated notes for the authenticated user | `200 OK` |
| `POST` | `/api/v1/notes` | Create a new note | `201 Created` |
| `GET` | `/api/v1/notes/{id}` | Get details of a single note by ID | `200 OK` |
| `PUT` | `/api/v1/notes/{id}` | Fully update an existing note | `200 OK` |
| `DELETE` | `/api/v1/notes/{id}` | Soft-delete a note | `200 OK` / `204 No Content` |
| `GET` | `/api/v1/tags` | List all tags created by the user | `200 OK` |

---

## 2. Request and Response JSON Examples

### A. Create Note (`POST /api/v1/notes`)

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
