const fetch = require('node-fetch');
const fs = require('fs');

async function getGifs(channel, slug) {
  slug ? fs.mkdirSync(`./${slug}`) : fs.mkdirSync(`./${channel}`);

  let channelURL = `https://giphy.com/api/v1/channels/${channel}/`;
  const response = await fetch(channelURL);
  let channelData = await response.json();
  if(channelData.children.length > 0) {
    for (let i = 0; i < channelData.children.length; i++) {
      let child = channelData.children[i];
      await getGifs(child.id, child.slug);
    }
  }

  let more = true;
  let currentURL = `https://giphy.com/api/v1/channels/${channel}/gifs/?is=1&json=true&page=1`;

  while(more) {
    const response = await fetch(currentURL);
    const json = await response.json();
    const page = currentURL.split('page=')[1] || '1';
    console.log(page, json.results.length);
    fs.writeFileSync(slug ? `${slug}/${page}.json` : `${channel}/${page}.json`, JSON.stringify(json), 'utf-8');
    if(json.next) {
      currentURL = json.next;
    } else {
      more = false;
    }
  }
}

getGifs(2056)
  .then(() => {
    console.log('Done!');
  });
