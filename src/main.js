import { getInput, getMultilineInput, setFailed, setOutput } from "@actions/core";
import { deletePackages } from './github';

async function run() {
    console.log('run action');
    try {
        const githubToken = getInput('github_token');
        const owner = getInput('owner');
        const repo = getInput('repo');
        const packages = getMultilineInput('packages');
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
    }
    catch (err) {
        setFailed(err.message);
    }
}

run();