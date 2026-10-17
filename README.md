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

Step 7 lets her write anything she wants. Notes are saved in Supabase, and you read them on the
admin page at `admin.html` (it isn't linked from the birthday page). The Supabase address and
public anon key are already in `notes-config.js`.

One-time setup in the Supabase dashboard:

1. **SQL Editor → New query**: paste everything from `supabase/setup.sql` and click **Run**.
   This creates the `notes` table and the rules: anyone can add a note, only a signed-in admin can read.
2. **Authentication → Users → Add user → Create new user**: enter your email and a password you choose
   (tick *Auto Confirm User*). This is your admin login.
3. **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up", so nobody else
   can create an account and read the notes.
4. Open `your-site/admin.html` and sign in with that email and password.

Notes also show up in Supabase under **Table Editor → notes**.
