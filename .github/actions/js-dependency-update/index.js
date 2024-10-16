const core = require('@actions/core');
const exec = require('@actions/core');

const validateBranchName = ({ branchName }) =>
  /^[a-zA-Z0-9_\-\.\/]+$/.test(branchName);
const validateDirName = ({ dirName }) => /^[a-zA-Z0-9_\-\.\/]+$/.test(dirName);

async function run() {
  /*

    */
  const baseBranch = core.getInput('base-branch');
  const targetBranch = core.getInput('target-branch');
  const ghToken = core.getInput('gh-token');
  const workingDir = core.getInput('working-directory');
  const debug = core.getBooleanInput('debug');

  core.setSecret(ghToken);

  if (!validateBranchName({ branchName: baseBranch })) {
    core.setFailed('invalid base branch name');
    return;
  }
  if (!validateBranchName({ branchName: targetBranch })) {
    core.setFailed('invalid target branch name');
    return;
  }
  if (!validateDirName({ dirName: workingDir })) {
    core.setFailed('invalid directory name');
    return;
  }

  core.info(`[js-dependdency-update] : base branch is ${baseBranch}`);
  core.info(`[js-dependdency-update] : target branch is ${baseBranch}`);
  core.info(`[js-dependdency-update] : working directoy is ${workingDir}`);

  await exec.exec('npm update', [], { cwd: workingDir });

  const gitStatus = await exec.getExecOutput('git status -s package*.json');
  if (gitStatus.stdout.length > 0) {
    core.info('[js-dependdency-update] : There are updates available');
  } else {
    core.info('[js-dependdency-update] : No updates available');
  }
}

run();
