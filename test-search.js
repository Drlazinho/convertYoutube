const youtubedl = require('youtube-dl-exec');
const query = 'musica boa';
const fs = require('fs');

async function test() {
  const info = await youtubedl(`ytsearch5:${query}`, {
    dumpSingleJson: true,
    noWarnings: true,
    callHome: false,
    noCheckCertificates: true,
    preferFreeFormats: true,
    youtubeSkipDashManifest: true,
    extractorArgs: 'youtube:player_client=android,web',
    flatPlaylist: true,
  });
  fs.writeFileSync('test-flat.json', JSON.stringify(info.entries, null, 2));
}

test();
