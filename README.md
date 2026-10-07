# RMI Contact Card Generator

## GitHub Pages setup

1. Extract this ZIP on your computer.
2. Open the qr_bizcard repository on GitHub and select the main branch (or your chosen publishing branch).
3. Upload index.html, README.md, .gitignore, and .nojekyll directly to the repository root. Do not upload the ZIP itself or place the files inside an extra folder.
4. Commit the files. Confirm that index.html appears alongside README.md in the repository file list. Its filename must be exactly index.html, in lowercase.
5. In repository Settings > Pages, set Source to Deploy from a branch. Select the branch containing these files and /(root), then save.
6. Wait for the Pages deployment to finish successfully, then reload https://rmibdd.github.io/qr_bizcard/ . If an old page remains visible, use Ctrl+Shift+R.

.nojekyll disables Jekyll processing for this standalone HTML app. Ensure your upload includes it; some file explorers hide dotfiles.

## Troubleshooting the page showing only qr_bizcard

That is consistent with a generated repository/README page instead of the app. Check that index.html is in the selected branch and publishing folder. If Pages is configured to serve /docs, either change it to /(root) or put the app files directly in /docs.

You can also try https://rmibdd.github.io/qr_bizcard/index.html after deployment. A 404 there means the app entry file is not available at that published path. Check the deployment status and selected publishing source.

## Run offline

Open index.html in your browser. No installation, npm, backend, or API key is required.

## Features

- Editable contact details with RMI company, address, and website defaults.
- Live contact preview and downloadable vCard 3.0 file.
- Fictional example contact; the original employee email and phone are excluded.
- Local browser processing, without uploading contact details or storing them in local storage.

## Use

Enter contact details, review the preview, and click Download .vcf. Open the downloaded file in a contacts app to import it. Reset restores the default form values.

## Reference

https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
