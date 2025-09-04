
# Imtiaj Iqbal Mahfuj — GitHub Pages Site

## Quick Start
1. Create a new GitHub repo named `imtiaj-portfolio` (or any name).
2. Upload the files from this folder to the repo root.
3. In **Settings → Pages**, set:
   - **Branch**: `main` (or `master`), folder `/root`.
4. Wait for the green check. Your site will be live at `https://<your-username>.github.io/<repo>/`.

## How to edit content (no coding)
All data lives in **`data.js`**. Edit text, dates, links, images, tags there. The UI updates automatically.

### Change the order of publication sections
In `data.js → publications.ordering`, rearrange the array, e.g.:
```js
ordering:["Conference proceedings", "Journal Articles", "Reports", "Book Chapters"]
```

### Add a project
Add an object to `SITE.projects`:
```js
{
  id:"p-new-id",
  title:"My New Project",
  tags:["GIS","ML"],
  image:"your-image-url.jpg",
  github:"https://github.com/...",
  details:"projects.html#p-new-id"
}
```
It automatically shows in:
- Featured slider (if you also add to `featuredSlides`),
- Home **Projects** carousel (3 cards desktop / 2 on tablet),
- **All Projects** page.

### Update Featured Projects slideshow
Edit `SITE.featuredSlides`. Each `id` should match a project `id`. Click goes to the project on the All Projects page.

### Education — location and links
Edit `SITE.education`. Only the **arrow icon** opens the institution website. Cards are hover-only as requested.

### Buttons
All clickable items use fast, smooth hover animations (`hover-smart`).

### Email buttons (open in new tab)
Both email buttons use `mailto:<address>` and `target="_blank"`.

### About paragraph — line breaks
Add `<br>` where you want a line space. For a larger gap use `<br><br>`.

### Project Tags filter
On the home Projects section, click a tag to filter. To clear, reload the page (or you can extend with a “Clear” tag).

### Change footer links
Edit `SITE.socials` list.

## Local preview
Open `index.html` in a browser (double-click). No build step required.

## 404 page
Modern black theme 404 (`404.html`). GitHub Pages uses it automatically when a route is missing.

## Loading screen
Shows only on first load of a page and auto-hides ~1.2s after the page finishes loading.
