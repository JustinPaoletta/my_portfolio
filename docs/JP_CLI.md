# JP_CLI terminal guide

The CLI theme presents the portfolio as one terminal session. The introduction,
command guide, output, and prompt live in the same scrollable surface. There is
no option sidebar, window-control toolbar, or floating theme menu.

This is a portfolio command interface. It does not execute operating-system
commands or provide access to a filesystem.

## Start exploring

Type a command at the prompt and press Enter:

```text
projects
project 1
experience
exp 1
resume
contact
```

`help` lists the available commands. `help <topic>` explains a command. After
list and detail commands, the output explains useful next steps. Source,
profile, email, and résumé links remain ordinary keyboard-accessible links.

## Commands

| Command                                  | Result                                                      |
| ---------------------------------------- | ----------------------------------------------------------- |
| `about`                                  | Background and engineering approach                         |
| `projects` / `project <n>`               | Project list or one project's evidence and links            |
| `skills` / `skill <n>`                   | Skills and supporting work                                  |
| `experience` / `exp <n>`                 | Employment and education list or details                    |
| `github`                                 | GitHub data with honest loading and unavailable states      |
| `contact`                                | Email and professional profile links                        |
| `resume`                                 | Link to the existing downloadable PDF                       |
| `dogs` / `dog <n>`                       | Optional pet section and details                            |
| `dog <n> treat` / `dog <n> scritch`      | Record the corresponding pet interaction                    |
| `help` / `help <topic>`                  | General or contextual command guidance                      |
| `history`                                | Commands entered during this session                        |
| `back`                                   | Return from a detail to its list, then to the command guide |
| `menu`                                   | Return to the command guide                                 |
| `ls`                                     | List items in the current portfolio context                 |
| `pwd`                                    | Show the current portfolio context                          |
| `clear` / `cls`                          | Clear output while keeping the introduction and guidance    |
| `theme <minimal\|engineer\|cosmic\|cli>` | Change the portfolio theme                                  |
| `mode <light\|dark\|system>`             | Change the color mode                                       |
| `exit` / `quit`                          | Return to the Minimal website theme                         |

The numeric aliases remain available: `1` About, `2` Projects, `3` Skills,
`4` Experience, `5` GitHub, `6` Contact, `7` Dogs, `8` Résumé, `9` Help, and
`0` Clear. Within a list, a number selects an item. Use named commands to jump
directly between sections regardless of the current list.

Other retained aliases include `education`, `gh`, `doggos`, `pets`, `cv`, and
`h`. Appearance commands preserve the chosen setting on reload, including
when the session started with theme or mode query parameters.

## Keyboard and touch

- Enter executes the typed command. Empty Enter does nothing.
- Up/Down recall command history and restore an unfinished draft after the newest entry.
- Left/Right retain normal text editing.
- Ctrl+Space completes a command or shows matching possibilities.
- Ctrl+L clears output.
- Ctrl+C cancels the current draft when no text is selected. Selected text can still be copied normally.
- Tab and Shift+Tab move through links and the prompt; they do not trap focus in the terminal.

On mobile, tap the prompt and use the keyboard's submit key. The input does
not automatically open the mobile keyboard. Text wraps at narrow widths and
the transcript scrolls within the viewport.

Output is a normal readable region rather than a live region that repeats
the entire transcript. A concise status message announces command results.
The session retains up to 300 output lines and 100 commands; it is not saved
across reloads. Human screen-reader and physical mobile-keyboard acceptance
remain separate from automated checks.
