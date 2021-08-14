import { Octokit } from '@octokit/rest';
import semver from 'semver';

async function getAllPackages(params) {
  const octokit = new Octokit({ auth: params.githubToken });
  const promises = params.packages.map(async packageName => {
    try {
      const data = await octokit.paginate(
        octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg,
        {
          package_type: params.packageType,
          org: params.org,
          package_name: packageName,
          per_page: 100
        },
        response => response.data
      );
      const versions = data
        .map(pkg => ({ id: pkg.id, name: pkg.name }))
        .sort(({ name: a }, { name: b }) => semver.rcompare(a, b));
      const currentVersion = versions.find(
        ({ name }) => semver.prerelease(name) === null
      );

      return versions.filter(
        ({ name }) =>
          semver.prerelease(name) && semver.lt(name, currentVersion.name)
      );
    } catch (error) {
      return [];
    }
  });
  const resp = await Promise.all(promises);
  return params.packages.reduce((accumulator, currentValue, index) => {
    accumulator[currentValue] = resp[index];
    return accumulator;
  });
}

export async function deletePackages(params) {
  const packages = await getAllPackages(params);
  if (params.dryRun) {
    Object.keys(packages).forEach(async packageName => {
      console.log(`DRY RUN: would delete ${packageName}`);
      console.log(packages[packageName]);
    });
    return;
  }

  const octokit = new Octokit({ auth: params.githubToken });

  const deletePromises = Object.keys(packages).map(async packageName => {
    return packages[packageName].map(async version => {
      return octokit.packages.deletePackageVersionForOrg({
        package_type: params.packageType,
        package_version_id: version.id,
        package_name: packageName,
        org: params.org
      });
    });
  });

  await Promise.all(deletePromises);
}
