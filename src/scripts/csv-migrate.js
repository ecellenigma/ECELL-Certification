import * as csv from '@fast-csv/parse';
import { readdirSync, writeFileSync } from 'fs';
import path from 'path';
import { cwd } from 'process';

let rawFiles = readdirSync(path.join(cwd(), '../assets/raw'));

for (let file of rawFiles) {
  let programName = file.replace('.csv', '');
  let data = [];
  csv
    .parseFile(path.join(cwd(), `../assets/csv/${file}`), {
      ignoreEmpty: true,
      headers: headers => headers.map(h => !["name", "id", "rank"].includes(h?.toLowerCase()) ? undefined : h.toLowerCase().replace(/ /g, '_')),
      renameHeaders: true,
    })
    .on('error', (e) => console.error(e))
    .on('data', (row) => {
      data.push(row);
    })
    .on('end', (rowCount) => {
      console.log(`Parsed ${rowCount} rows`);
      let destPath = path.join(cwd(), `../assets/data/${programName}.json`);
      console.log(destPath);
      writeFileSync(destPath, JSON.stringify({
        name: programName,
        data: data,
      }));
    });
}