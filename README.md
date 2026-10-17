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

Step 7 lets her write anything she wants. To receive those notes, create a free form at
[formspree.io](https://formspree.io) and paste its address into `noteEndpoint` in `script.js`
(for example `https://formspree.io/f/abcdwxyz`). Notes then arrive in your email.
