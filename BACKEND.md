# StudyBuddy FE -> Backend Contract (Schema + APIs + Simple Architecture)

This document is derived from the current frontend codebase in `src/`.

The FE is currently mock-driven (`src/data/mockData.js`) with no real API client yet. The goal here is to define the backend data model and APIs needed to support all existing screens:
- Home
- Materials
- Discussion
- Quiz
- Leaderboard

## 1) Core Domain Model

## 1. `users`
- `id` (uuid, pk)
- `name` (text)
- `avatar` (text, short initials or image URL)
- `email` (text, unique)
- `role` (enum: `student`, `faculty`, `admin`)
- `current_semester` (smallint, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## 2. `semesters`
- `id` (smallint, pk)  // 1..8
- `label` (text)

## 3. `subjects`
- `id` (text, pk)  // matches FE IDs like `cs101`
- `semester_id` (smallint, fk -> `semesters.id`)
- `code` (text, unique)  // e.g. `MA101`
- `name` (text)
- `is_active` (boolean)

## 4. `units`
- `id` (uuid, pk)
- `subject_id` (text, fk -> `subjects.id`)
- `unit_key` (text)  // optional FE alias like `u1`
- `number` (smallint)
- `name` (text)
- `teacher_name` (text)
- `sort_order` (smallint)
- `created_at` (timestamptz)

## 5. `user_unit_progress`
- `user_id` (uuid, fk -> `users.id`)
- `unit_id` (uuid, fk -> `units.id`)
- `progress_percent` (smallint, 0..100)
- `updated_at` (timestamptz)
- PK: (`user_id`, `unit_id`)

## 6. `materials`
- `id` (uuid, pk)
- `subject_id` (text, fk -> `subjects.id`)
- `unit_id` (uuid, fk -> `units.id`)
- `name` (text)
- `type` (enum: `pdf`, `image`, `link`)
- `file_url` (text, nullable)  // for pdf/image in object storage
- `external_url` (text, nullable)  // for links
- `size_bytes` (bigint, nullable)
- `teacher_name` (text)
- `uploaded_by` (uuid, fk -> `users.id`, nullable)
- `created_at` (timestamptz)

## 7. `tags`
- `id` (uuid, pk)
- `name` (text, unique)

## 8. `threads`
- `id` (uuid, pk)
- `subject_id` (text, fk -> `subjects.id`)
- `unit_id` (uuid, fk -> `units.id`, nullable)
- `title` (text)
- `description` (text)
- `author_id` (uuid, fk -> `users.id`)
- `upvotes_count` (int, default 0)
- `downvotes_count` (int, default 0)
- `comments_count` (int, default 0)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## 9. `thread_tags`
- `thread_id` (uuid, fk -> `threads.id`)
- `tag_id` (uuid, fk -> `tags.id`)
- PK: (`thread_id`, `tag_id`)

## 10. `thread_votes`
- `thread_id` (uuid, fk -> `threads.id`)
- `user_id` (uuid, fk -> `users.id`)
- `vote` (smallint, allowed: `-1`, `1`)
- `created_at` (timestamptz)
- PK: (`thread_id`, `user_id`)

## 11. `thread_comments`
- `id` (uuid, pk)
- `thread_id` (uuid, fk -> `threads.id`)
- `author_id` (uuid, fk -> `users.id`)
- `text` (text)
- `upvotes_count` (int, default 0)
- `created_at` (timestamptz)

## 12. `quizzes`
- `id` (uuid, pk)
- `subject_id` (text, fk -> `subjects.id`)
- `unit_id` (uuid, fk -> `units.id`)
- `unit_label` (text)  // optional display field like `Unit 1`
- `name` (text)
- `difficulty` (enum: `Easy`, `Medium`, `Hard`)
- `time_limit_min` (int)
- `is_published` (boolean)
- `created_by` (uuid, fk -> `users.id`)
- `created_at` (timestamptz)

## 13. `quiz_questions`
- `id` (uuid, pk)
- `quiz_id` (uuid, fk -> `quizzes.id`)
- `question_text` (text)
- `options` (jsonb array of strings)
- `correct_option_index` (smallint)
- `sort_order` (smallint)

## 14. `quiz_attempts`
- `id` (uuid, pk)
- `quiz_id` (uuid, fk -> `quizzes.id`)
- `user_id` (uuid, fk -> `users.id`)
- `started_at` (timestamptz)
- `submitted_at` (timestamptz, nullable)
- `score_percent` (smallint, nullable)
- `correct_answers` (smallint, nullable)
- `total_questions` (smallint, nullable)
- `time_left_seconds` (int, nullable)

## 15. `quiz_attempt_answers`
- `attempt_id` (uuid, fk -> `quiz_attempts.id`)
- `question_id` (uuid, fk -> `quiz_questions.id`)
- `selected_option_index` (smallint)
- `is_correct` (boolean)
- PK: (`attempt_id`, `question_id`)

## 16. `user_subject_stats` (for leaderboard)
- `user_id` (uuid, fk -> `users.id`)
- `subject_id` (text, fk -> `subjects.id`)
- `total_points` (int)
- `quizzes_taken` (int)
- `streak_days` (int)
- `badge` (text)
- `updated_at` (timestamptz)
- PK: (`user_id`, `subject_id`)

## 17. `user_unit_stats` (for unit-wise leaderboard)
- `user_id` (uuid, fk -> `users.id`)
- `unit_id` (uuid, fk -> `units.id`)
- `points` (int)
- `quizzes_taken` (int)
- `updated_at` (timestamptz)
- PK: (`user_id`, `unit_id`)

## 2) API Surface (REST)

Base path: `/api/v1`

Auth can be JWT/session, but all endpoints below assume authenticated user (`me`) unless noted.

## 1. Bootstrap / Catalog
- `GET /semesters`
  - Returns semester list.
- `GET /semesters/:semesterId/subjects`
  - Returns subjects for selected semester.
- `GET /subjects/:subjectId/units`
  - Returns units for subject + user progress + material counts.
- `GET /subjects/:subjectId/home-summary`
  - Returns `completedCount`, `inProgressCount`, `notStartedCount`, `totalMaterials`, `averageProgress`, optional highlights.

## 2. Materials
- `GET /subjects/:subjectId/materials?type=all|pdf|image|link&q=&unitId=`
  - Returns grouped-by-unit materials (shape FE already expects).
- `POST /materials`
  - Multipart upload or metadata create.
- `GET /materials/:materialId/download`
  - Returns signed URL for file types.

## 3. Discussion
- `GET /subjects/:subjectId/threads?q=&tag=&unitId=&page=&limit=`
  - Returns thread cards with tags, vote counts, comment count, author.
- `POST /subjects/:subjectId/threads`
  - Body: `{ title, description, unitId?, tags[] }`
- `GET /threads/:threadId`
  - Returns thread details + comments.
- `POST /threads/:threadId/comments`
  - Body: `{ text }`
- `PUT /threads/:threadId/vote`
  - Body: `{ vote: 1 | -1 | 0 }` (`0` clears vote).

## 4. Quiz
- `GET /subjects/:subjectId/quizzes?difficulty=All|Easy|Medium|Hard&q=`
  - Returns quiz cards + last attempt summary.
- `POST /quizzes/:quizId/attempts/start`
  - Creates attempt, returns questions **without** correct answers.
- `POST /quizzes/attempts/:attemptId/submit`
  - Body: `{ answers: [{ questionId, selectedOptionIndex }], timeLeftSeconds }`
  - Returns `{ scorePercent, correctAnswers, totalQuestions, completedAt }`.
- `GET /users/me/quiz-attempts?subjectId=&quizId=`
  - Returns attempt summaries used in quiz cards.

## 5. Leaderboard
- `GET /subjects/:subjectId/leaderboard?mode=total|unit&unitId=&limit=50`
  - Returns ranked entries, including current user marker.

## 3) Response Shapes Needed by FE

Use these field names to minimize FE refactor:

## Subject
```json
{
  "id": "cs101",
  "name": "Engineering Mathematics I",
  "code": "MA101"
}
```

## Unit
```json
{
  "id": "u1",
  "number": 1,
  "name": "Differential Calculus",
  "teacher": "Dr. Priya Sharma",
  "materialCount": 12,
  "progress": 88
}
```

## Material group
```json
{
  "unitId": "u1",
  "unitName": "Differential Calculus",
  "files": [
    {
      "id": "m1",
      "name": "Limits and Continuity Notes.pdf",
      "type": "pdf",
      "date": "2026-01-05T10:00:00Z",
      "teacher": "Dr. Priya Sharma",
      "size": "2.4 MB",
      "url": "https://..."
    }
  ]
}
```

## Thread card
```json
{
  "id": "t1",
  "title": "How do I solve ...",
  "description": "I get stuck when...",
  "tags": ["Unit 1", "Differentiation", "Help"],
  "author": { "name": "Arjun Mehta", "avatar": "AM" },
  "upvotes": 28,
  "downvotes": 2,
  "commentCount": 2,
  "timeAgo": "2 hours ago"
}
```

## Quiz list item
```json
{
  "id": "qz_1",
  "unitId": "u1",
  "unitName": "Unit 1",
  "name": "Limits and Continuity Basics",
  "questionCount": 10,
  "timeLimit": 15,
  "difficulty": "Easy",
  "lastAttempt": {
    "scorePercent": 80,
    "correctAnswers": 8,
    "totalQuestions": 10,
    "completedAt": "Feb 28, 2026"
  }
}
```

## Leaderboard entry
```json
{
  "rank": 1,
  "name": "Sneha Patel",
  "avatar": "SP",
  "badge": "Gold Scholar",
  "score": 2840,
  "quizzesTaken": 18,
  "streak": 14,
  "isCurrentUser": false
}
```

## 4) Simple Backend Architecture

## Recommended simple setup
- `API service`: Node.js + Express/NestJS
- `DB`: PostgreSQL
- `Cache`: Redis (optional early, useful for leaderboard + frequent reads)
- `File storage`: S3-compatible bucket for PDFs/images
- `AI`: LLM provider via one backend endpoint (`/ai/chat`)

## Internal modules
- `AuthModule`
- `CatalogModule` (semesters, subjects, units, progress)
- `MaterialsModule`
- `DiscussionModule`
- `QuizModule`
- `LeaderboardModule`
- `AIModule`

## Async/background jobs
- Recompute/update leaderboard stats after quiz submission
- Generate signed upload/download URLs for materials
- Optional: moderation checks for discussion and AI prompts

## High-level flow
1. FE calls catalog endpoints to load semester -> subject -> units.
2. Feature tabs call their own endpoints (`materials`, `threads`, `quizzes`, `leaderboard`, `ai`).
3. Quiz submit updates attempts and triggers leaderboard stat update.
4. Leaderboard reads precomputed stats tables for fast ranking.

## 5) Implementation Order (to match current FE quickly)

1. Implement read-only endpoints first:
- semesters/subjects/units
- materials list
- threads list + details
- quizzes list
- leaderboard

2. Implement writes:
- create thread
- add comment
- vote thread
- quiz attempt submit
- material upload

3. Add AI endpoint + conversation persistence.

4. Replace `src/data/mockData.js` usage with API calls per tab.

## 6) Notes from FE Review

- FE currently stores thread votes and quiz attempts in local component state only.
- FE expects grouped materials by unit.
- FE currently displays `timeAgo` strings; backend can return `createdAt` and FE can format relative time.
- Quiz answers should be validated server-side; avoid sending `correct` option values in quiz-start responses.
