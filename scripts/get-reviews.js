import fs from "fs";
import path from "path";
import { Octokit } from "@octokit/rest";
const octokit = new Octokit( { auth: process.env.IV_REVIEWERS_TOKEN } );

const countReviews = {};
const registerPRS = {};
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
          const reviewerLogin = element.user.login;
          if ( reviewerLogin != owner) {
            if ( ! (reviewerLogin in countReviews)) {
              countReviews[reviewerLogin] = 1;
            } else {
              countReviews[reviewerLogin] = countReviews[reviewerLogin] + 1;
            }
            fs.writeFileSync("../reviews.json", JSON.stringify(countReviews));
            if (!(reviewerLogin in registerPRS)) {
              registerPRS[reviewerLogin] = { [review]: true };
            } else {
              registerPRS[reviewerLogin][review] = true;
            }
            fs.writeFileSync("../reviewed-prs.json", JSON.stringify(registerPRS));
          }
        });
    });
}
