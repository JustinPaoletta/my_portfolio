# JP-CLI terminal guide

The top row shows the macOS window dots and Justin Paoletta's name, Software
Engineer title, and Angular / React / TypeScript stack. Narrow screens retain
the name. The red dot shows an × on hover or keyboard focus; activating it has
the same result as `exit`. Yellow and green are decorative and do not respond.

The terminal opens with `Welcome to JP-CLI`, then displays the command
instructions 500ms later. Reduced-motion preference shows both immediately.
The prompt follows the latest output and scrolls with the transcript.
Submitting or clearing brings it into view; scrolling up lets you read history.
This is a portfolio command interface, with no access to your filesystem.

## Explore with ls and cd

```text
ls
cd projects
ls
cd 1
cd ..
cd /experience/1
cd ~/contact
cd /resume
cd /
```

`ls` lists the current directory. `cd <path>` enters a directory and displays
its content. Projects, skills, experience, and dogs contain numbered directories
shown by `ls`; entering one displays its details and real links.

Paths support `/`, `~`, `.`, and `..`. `cd` without a path returns home.
`ls <path>` inspects another directory without changing the current location.
Invalid paths produce guidance and leave the current directory unchanged.
The prompt and `pwd` show your current location.

## Commands

| Command                                  | Result                                                           |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `ls [path]`                              | List the current or specified directory                          |
| `cd [path]`                              | Enter a relative or absolute directory; no argument returns home |
| `pwd`                                    | Show the current directory                                       |
| `help` / `help <topic>`                  | Command guidance and examples                                    |
| `theme <minimal\|engineer\|cosmic\|cli>` | Change the portfolio theme                                       |
| `mode <light\|dark\|system>`             | Change the color preference                                      |
| `exit` / `quit`                          | Return to the Minimal visual portfolio                           |
| `history`                                | Show commands from this session                                  |
| `clear` / `cls`                          | Clear output and restore the welcome at home                     |
| `dog <n> treat` / `dog <n> scritch`      | Record the corresponding pet interaction                         |

Root directories are `about`, `projects`, `experience`, `skills`, `github`,
`contact`, `resume`, and `dogs`. Source, email, professional profile, and PDF
links remain keyboard-accessible. `help dogs` explains pet interactions.

Earlier named commands and numeric shortcuts remain compatibility aliases;
the opening guide and directory output use `ls` and `cd`. Appearance changes
persist on reload, including sessions opened with theme/mode URL overrides.

## Keyboard and touch

- Enter executes a command. Empty Enter does nothing.
- Up/Down recall history and restore an unfinished draft after the newest entry.
- Left/Right edit text normally.
- Ctrl+Space completes commands and directory paths, or shows matches.
- Ctrl+L clears output. Ctrl+C cancels the draft when no text is selected.
- Selected text can be copied normally; Tab and Shift+Tab move focus without a trap.

Mobile input does not open the keyboard automatically. Tap the prompt and use
the keyboard's submit key. Text wraps and the transcript scrolls within the
viewport. The session retains up to 300 output lines and 100 commands, and is
not saved across reloads. Screen-reader and physical mobile-keyboard acceptance
remain separate from automated checks.
