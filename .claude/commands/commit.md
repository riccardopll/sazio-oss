# Commit Command

Analyze the current uncommitted changes in the repository and create a commit with a well-crafted message.

## Instructions

1. First, run `git status` to see what files have changed (do not use -uall flag)
2. Run `git diff` to see the actual changes (both staged and unstaged)
3. Analyze the changes and determine:
   - The type of change (feat, fix, docs, style, refactor, test, chore, build, ci, perf)
   - A brief description of what was changed

4. Generate a commit message following these rules:
   - Use conventional commit format: `type: description`
   - The entire message must be **all lowercase**
   - Keep it short and concise (under 72 characters)
   - Focus on the "what" and "why", not the "how"
   - Do not include a scope unless absolutely necessary

5. Stage all changes with `git add -A`

6. Create the commit using the generated message. Use a HEREDOC to pass the message:

   ```bash
   git commit -m "$(cat <<'EOF'
   type: your commit message here

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   EOF
   )"
   ```

7. Show the result with `git log -1` to confirm the commit was created

## Conventional Commit Types

- `feat`: a new feature
- `fix`: a bug fix
- `docs`: documentation only changes
- `style`: formatting, missing semicolons, etc (no code change)
- `refactor`: code change that neither fixes a bug nor adds a feature
- `test`: adding or updating tests
- `chore`: updating build tasks, configs, etc (no production code change)
- `build`: changes affecting build system or dependencies
- `ci`: changes to CI configuration
- `perf`: performance improvements

## Examples of Good Commit Messages

- `feat: add user authentication endpoint`
- `fix: resolve null pointer in payment flow`
- `docs: update readme with installation steps`
- `refactor: simplify database connection logic`
- `chore: update dependencies`
