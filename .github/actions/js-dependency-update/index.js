const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github');

const validateBranchName = ({ branchName }) =>
  /^[a-zA-Z0-9_\-\.\/]+$/.test(branchName);
const validateDirName = ({ dirName }) => /^[a-zA-Z0-9_\-\.\/]+$/.test(dirName);

async function run() {
  /*

    */
  const baseBranch = core.getInput('base-branch', { required: true });
  const targetBranch = core.getInput('target-branch', { required: true });
  const ghToken = core.getInput('gh-token', { required: true });
  const workingDir = core.getInput('working-directory', { required: true });
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
  core.info(`[js-dependdency-update] : target branch is ${targetBranch}`);
  core.info(`[js-dependdency-update] : working directoy is ${workingDir}`);

  await exec.exec('npm update', [], { cwd: workingDir });

  const gitStatus = await exec.getExecOutput('git status -s package*.json');
  if (gitStatus.stdout.length > 0) {
    core.info('[js-dependdency-update] : There are updates available');
    await exec.exec('git config user.name "gh-automation"');
    await exec.exec('git config user.email "gh-automation@email.com"');
    await exec.exec('git checkout -b ${targetBranch}', [], {
      cwd: workingDir,
    });
    await exec.exec('git add package.json package-lock.json', [], {
      cwd: workingDir,
    });
    await exec.exec('git commit -m "core: update dependencies"', [], {
      cwd: workingDir,
    });
    await exec.exec('git push -u origin ${targetBranch} --force', [], {
      cwd: workingDir,
    });

    const octokit = github.getOctokit(ghToken);

    try {
      await octokit.rest.pulls.create({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        title: 'Update NPM dependencies',
        body: 'This pull request updates NPM packages',
        base: baseBranch,
        head: targetBranch,
      });
    } catch (e) {
      core.error('Something went wrong while creating PR');
      core.setFailed(e.message);
      core.error(e);
    }
  } else {
    core.info('[js-dependdency-update] : No updates available');
  }
}

run();
