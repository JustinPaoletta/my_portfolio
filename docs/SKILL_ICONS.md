# Applied-skill icons

The four skill cards use local decorative logos above visible technology labels.
The cards cover frontend architecture, testing/release automation, backend/data, and AI-assisted development.
Existing Angular, React, TypeScript, RxJS, Playwright, Jenkins, Node.js, Claude Code, Codex, and Cursor assets are reused.
MySQL/MariaDB keeps both logos beside its shared label.

The following six SVGs were retrieved on 2026-10-11 from the existing Simple Icons
CDN source and stored in `public/icons/` to avoid runtime CDN requests:

| Skill          | Asset             | Source                                    |
| -------------- | ----------------- | ----------------------------------------- |
| SCSS           | sass.svg          | https://cdn.simpleicons.org/sass          |
| GitHub Actions | githubactions.svg | https://cdn.simpleicons.org/githubactions |
| NestJS         | nestjs.svg        | https://cdn.simpleicons.org/nestjs        |
| Prisma         | prisma.svg        | https://cdn.simpleicons.org/prisma        |
| MySQL          | mysql.svg         | https://cdn.simpleicons.org/mysql         |
| MariaDB        | mariadb.svg       | https://cdn.simpleicons.org/mariadb       |

Icons use empty alternative text inside an `aria-hidden` visual group.
A separate technology list exposes the names. Responsive frames and backing styles are defined in `Skills.css`.
