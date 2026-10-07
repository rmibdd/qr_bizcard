# RMI VCF Generator

A standalone contact card generator based on vCard 3.0. Enter contact details, preview the contact, and download a `.vcf` file.

## Files

- `index.html`: complete app, including HTML, CSS, and JavaScript.
- `.gitignore`: excludes common local files and generated contact cards.

## Run locally

Open `index.html` in your browser. No installation, npm, backend, or API key is required.

## Upload to GitHub

1. Create a repository or open the repository you want to use.
2. Upload the contents of this folder to the repository root, with `index.html` at the root.
3. Commit the files.

If you want a hosted page, configure GitHub Pages to serve the repository root from your chosen branch. The app is a static page and needs no build step. Uploading the files alone does not configure hosting.

## Use

1. Enter the person's name and contact details.
2. Review the live preview.
3. Click **Download .vcf**.
4. Open the downloaded file with a contacts app to import it.

**Load example** uses fictional example details. **Reset** clears personal details and restores the editable RMI company, address, and website defaults.

## Customize

Edit the defaults in `index.html` to change the company, address, website, branding, or colours.

## Data handling

The app processes form input locally in the browser. It does not upload contact details or save them in local storage. Downloaded `.vcf` files are saved on the user's device. The sample employee's email and phone from the original reference are not included in this repository package.

## Validation

The original generator's export logic was checked for name field order, CRLF line endings, special character escaping, UTF-8 line folding, sample loading, and download action. Import rendering can differ by contacts app.
