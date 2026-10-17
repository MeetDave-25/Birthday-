# 🎂 Birthday Surprise

A cute, pastel birthday wish website. Each button reveals the next surprise:

1. 🎁 **Gift** – tap to open it (confetti and sparkles)
2. 🎂 **Cake** – blow out the candles with the button, or blow into your mic. Then the "Happy Birthday" tune plays.
3. 🌷 **Garden** – tulips grow and bloom, then petals rain down
4. 🐶 **Puppy** – a puppy in a party hat pops up. Tap it for hearts and woofs.
5. 💌 **Letter** – an envelope opens and your message types itself out
6. 🎉 **Finale** – balloons, confetti and a flower polaroid

## Personalize

Open `script.js` and edit the `CONFIG` block at the top:

```js
const CONFIG = {
  name: "Sweetheart",   // birthday person's name
  from: "Me",           // your name
  candles: 5,
  message: [ "...", "..." ]  // one string per paragraph
};
```

You can also set the names in the link without editing code:

```
index.html?name=Riya&from=Dave
```

## Run / share

There's no build step. Open `index.html` in a browser, or host the folder for free with **GitHub Pages**
(Settings → Pages → Deploy from branch). The mic option needs the site to be served over `https`.
