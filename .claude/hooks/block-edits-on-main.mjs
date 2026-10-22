// PreToolUse hook: blocks Edit/Write/NotebookEdit on project files while the current branch is main.
// Exit 0 lets the tool call proceed; exit 2 blocks it and shows stderr to Claude.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

function allowWithWarning(message) {
  process.stderr.write(`block-edits-on-main: ${message}; edit allowed.\n`);
  process.exit(0);
}

function git(cwd, args) {
  return execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  allowWithWarning('could not parse hook input');
}

const filePath = input?.tool_input?.file_path ?? input?.tool_input?.notebook_path;
if (!filePath) {
  allowWithWarning('no file path in tool input');
}

const projectDir = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const target = path.resolve(projectDir, filePath);
const relative = path.relative(projectDir, target);

// Files outside the project (memory, scratchpad, ~/.claude) are not guarded.
if (relative === '' || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
  process.exit(0);
}

// Run git from the file's nearest existing folder, so a git worktree inside the project is judged by its own branch.
let gitDir = path.dirname(target);
while (!existsSync(gitDir) && gitDir !== projectDir) {
  gitDir = path.dirname(gitDir);
}

let branch;
try {
  branch = git(gitDir, ['branch', '--show-current']);
} catch {
  allowWithWarning('could not read the current git branch');
}

// Any other branch, or a detached HEAD (empty name), is fine.
if (branch !== 'main') {
  process.exit(0);
}

// Ignored files never reach a commit, so editing them on main is harmless.
try {
  git(gitDir, ['check-ignore', '-q', '--', target]);
  process.exit(0);
} catch (error) {
  // Exit 1 means the file is not ignored; anything else is a git failure.
  if (error.status !== 1) {
    allowWithWarning('could not check .gitignore');
  }
}

process.stderr.write(
  `Правки на main запрещены (${relative.replaceAll('\\', '/')}): создайте ветку через start-task. `
  + 'Для срочной правки на main попросите пользователя разрешить временно отключить хук в .claude/settings.json.\n',
);
process.exit(2);
