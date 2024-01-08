import fs from "fs";
import path from "path";
import { Octokit } from "@octokit/rest";
const octokit = new Octokit( { auth: process.env.IV_REVIEWERS_TOKEN } );

const countReviews = {};
for ( const objetivo in [0,1,2,3,4,5,6,7,8,9] ) {
  const objetivoPath = path.join('..', 'IV-', 'proyectos', `objetivo-${objetivo}.md`);
  const objetivoContent = fs.readFileSync(objetivoPath, 'utf8');
  const objetivoReviews = objetivoContent.match(/https:\/\/github.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/pull\/[0-9]+/g);
  objetivoReviews.map( async review => {
        const url = new URL(review);
        const fragments = url.pathname.split('/');
        const owner = fragments[1];
        const repo = fragments[2];
        const pr = fragments[4];
        const { data: reviews } = await octokit.request(
          "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
          {
            owner: owner,
            repo: repo,
            pull_number: pr,
            headers: {
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        );
        reviews.forEach(element => {
            if ( ! (element.user.login in countReviews)) {
                countReviews[element.user.login] = 1;
            } else {
                countReviews[element.user.login] = countReviews[element.user.login] + 1;
            }
            console.log(countReviews);
        });
    });
}
