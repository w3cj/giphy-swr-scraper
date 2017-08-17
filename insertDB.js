const fs = require('fs');
const listDirectories = require('list-directories');
const monk = require('monk');

require('dotenv').config();

const db = monk(process.env.MONGO_URI);

const gifs = db.get('gifs');
gifs.drop();

const all = {};
const allArray = [];

(async function() {
  const directories = await listDirectories('.');
  for (let directory of directories.keys()) {
    const files = fs.readdirSync(directory);
    if(!directory.includes('node_modules')) {
      const category = directory.split('/giphy-sign-scraper/')[1];
      for (let file of files) {
        const json = require(`${directory}/${file}`);
        json.results.forEach(({id, images, tags, url}) => {
          const {fixed_height, fixed_height_small_still, fixed_width, original} = images;
          const result = {
            id,
            images: {
              fixed_height,
              fixed_height_small_still,
              fixed_width,
              original
            },
            url
          };

          result.allText = tags.filter(t => !t.match(/sign language|sign with robert|deaf|american sign language|swr|asl/))

          if(result.allText.length === 1) {
            result.text = result.allText[0];
          }

          if(!all[result.id]) {
            allArray.push(result);
          }

          all[result.id] = all[result.id] || result;
          all[result.id].categories = all[result.id].categories || [];
          category !== 'all' ? all[result.id].categories.push(category) : '';
        });
      }
    }
  }

  gifs
    .insert(allArray)
    .then(results => {
      console.log('Done!');
    })
})();
