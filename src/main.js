import { getInput, setFailed, setOutput } from '@actions/core';
import { context } from '@actions/github';
import { deletePackages } from './github';

async function run() {
  console.log('run action');
  try {
    const githubToken = getInput('token');
    const owner = getInput('owner') || context.repo.owner;
    const repo = getInput('repo') || context.repo.repo;
    const packages = getInput('packages').split(',');
    const packageType = getInput('package_type');
    const dryRun = getInput('dry_run');

    await deletePackages({
      githubToken,
      owner,
      repo,
      packages,
      packageType,
      dryRun
    });

    setOutput('time', new Date().toTimeString());
  } catch (err) {
    setFailed(err.message);
  }
}

run();
