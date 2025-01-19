import * as csv from '@fast-csv/parse';
import { readdirSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { cwd } from 'process';

if (!existsSync(path.join(cwd(), 'src/assets/data'))) {
  console.log('Creating data directory');
  mkdirSync(path.join(cwd(), 'src/assets/data'));
}

let rawFiles = readdirSync(path.join(cwd(), 'src/assets/raw'));

for (let file of rawFiles) {
  let programName = file.replace('.csv', '');
  let data = [];
  csv
    .parseFile(path.join(cwd(), `src/assets/raw/${file}`), {
      ignoreEmpty: true,
      headers: headers => headers.map(h => !["name", "id", "rank"].includes(h?.toLowerCase()) ? undefined : h.toLowerCase().replace(/ /g, '_')),
      renameHeaders: true,
    })
    .on('error', (e) => console.error(e))
    .on('data', (row) => {
      data.push(row);
    })
    .on('end', (rowCount) => {
      let destPath = path.join(cwd(), `src/assets/data/${programName}.json`);
      console.log(destPath);
      console.log(`Parsed ${rowCount} rows`);
      writeFileSync(destPath, JSON.stringify({
        name: programName,
        data: data,
      }));
    });
}