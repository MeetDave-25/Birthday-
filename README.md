# ✿ a bouquet for vidhi

A soft, hand-drawn birthday site in a "digital bouquet" style: warm paper background, storybook flower
illustrations, typewriter labels and a handwritten card.

1. **cover**: a wrapped bouquet that sways, "happy birthday, vidhi"
2. **pick your blooms**: 10 illustrated flowers, some already picked, add or remove any
3. **your bouquet**: flowers pop into the wrap one by one. Tap a flower for its meaning, or shuffle the arrangement
4. **make a wish**: blow out the candles (button or mic). A music-box "happy birthday" plays
5. **a tiny visitor**: a puppy brings a tulip. Tap it for hearts and woofs
6. **a card for you**: flip the card and the message writes itself
7. **finale**: her bouquet, confetti and falling petals

## Personalize

Edit `CONFIG` at the top of `script.js`: `name`, `from`, the pre-picked `bouquet`, and `message`
(one string per paragraph). Names can also go in the link: `index.html?name=Vidhi&from=Meet`.

## Share

No build step. Open `index.html`, or host it for free with GitHub Pages (Settings → Pages → deploy from branch).
The mic option needs an `https` link.

## Notes from her

Step 7 lets her write anything she wants. Notes are saved to a Google Sheet, and you read them on
the password-protected admin page at `admin.html` (it isn't linked from the birthday page).

One-time setup (about 5 minutes, free):

1. Create a new Google Sheet. Open **Extensions → Apps Script**.
2. Replace the code there with everything in `apps-script/Code.gs`, then save.
3. Open **Project Settings** (gear icon) → **Script Properties** → add `ADMIN_KEY` with a password you choose.
4. Click **Deploy → New deployment** → type **Web app**. Set *Execute as* to **Me** and
   *Who has access* to **Anyone**. Deploy, allow the permissions, and copy the **Web app URL**.
5. Paste that URL into `notes-config.js`: `window.NOTES_ENDPOINT = "https://script.google.com/macros/s/.../exec";`
6. Open `your-site/admin.html`, enter your password, and her notes appear. They're also in the Sheet.

If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
