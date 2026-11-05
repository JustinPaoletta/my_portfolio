# JP-CLI terminal guide

The terminal presents portfolio content. It does not run operating-system commands or access the visitor's files.
The title row shows Justin Paoletta, Software Engineer, and Angular / React / TypeScript.
Narrow screens retain the name. The red dot runs `exit`; yellow and green are decorative.

The terminal shows `Welcome to JP-CLI`, then reveals instructions after 500 ms.
Reduced motion and visual-test mode show both immediately.
The prompt follows the transcript. New output scrolls into view; visitors can scroll back through history.

## Explore with named directories

```text
ls
cd projects
ls
cd bitstockerz
cd ..
cd /experience/accesso
cd ~/contact
cd /resume
cd /
```

`ls` lists entries. `cd <path>` enters a directory and displays its content.
Projects, skills, experience, and dogs use named entries shown by `ls`.
Numbers are not directory names or selection shortcuts.

Paths support `/`, `~`, `.`, and `..`. `cd` without a path returns home.
`ls <path>` inspects another directory without changing location.
Invalid paths show guidance and preserve the current directory.
The prompt shows `~/…`; `pwd` prints `portfolio:/…`.

## Commands

| Command                                          | Result                                             |
| ------------------------------------------------ | -------------------------------------------------- |
| `ls [path]`                                      | List the current or specified directory            |
| `cd [path]`                                      | Enter a directory; no argument returns home        |
| `pwd`                                            | Show the current portfolio path                    |
| `help` / `help <topic>`                          | Show command guidance and examples                 |
| `project <name>` / `skill <name>` / `exp <name>` | Show a named entry                                 |
| `dog <name>`                                     | Show a dog profile                                 |
| `dog <name> treat` / `dog <name> scritch`        | Record a pet interaction                           |
| `theme <minimal\|engineer\|cosmic\|cli>`         | Change the portfolio theme                         |
| `mode <light\|dark\|system>`                     | Change the color preference                        |
| `exit` / `quit`                                  | Return to the Minimal portfolio                    |
| `history`                                        | Show commands from this session                    |
| `clear` / `cls`                                  | Clear output and return home; keep command history |
| `back`                                           | Go to the parent directory                         |
| `menu`                                           | Show the root directories                          |

Root directories are `about`, `projects`, `experience`, `skills`, `github`, `contact`, `resume`, and `dogs`.
Direct commands such as `projects`, `contact`, and `resume` remain available.
Aliases include `h`, `gh`, `cv`, `education`, `pets`, and `doggos`.
Use `help aliases` for the supported list.
Source, email, professional-profile, and PDF links remain keyboard-accessible.
Appearance selections persist on reload, including sessions opened with theme/mode URL overrides.

## Keyboard and touch

- Enter executes a command. Empty Enter does nothing.
- Up/Down recall history and restore an unfinished draft after the newest entry.
- Left/Right edit text normally.
- Ctrl+Space completes commands and named paths, or lists matches.
- Ctrl+L clears output. Ctrl+C cancels the draft when no text is selected.
- Tab and Shift+Tab move among the transcript, links, and prompt.
- Selected text can be copied normally.

Mobile input does not open the keyboard automatically. Tap the prompt and use the submit key.
The session retains at most 300 output lines and 100 commands. Reloading resets the session.
A polite status region announces command completion; the transcript remains separately browsable.
Human screen-reader and physical mobile-keyboard acceptance require separate sessions.

Source: `src/components/sections/Hero/CliTerminal.tsx`.
