const http = require('http');
const fs = require('fs');
const { exec } = require('child_process');
const url = require('url');
const path = require('path');

// Basic UUID function (simple)
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function serveStaticFile(req, res) {
  const filePath = "." + url.parse(req.url).pathname;
  const extname = path.extname(filePath).toLowerCase();

  const mimeTypes = {
    '.wav': 'audio/wav',
    '.json': 'application/json',
  };

  fs.readFile(filePath, function (error, content) {
    if (error) {
      res.writeHead(404);
      res.end("Not Found");
    } else {
      res.writeHead(200, { 'Content-Type': mimeTypes[extname] || 'text/plain' });
      res.end(content, 'utf-8');
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/generate') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      const { text } = JSON.parse(body);
      const id = generateId();
      const wavPath = `output/${id}.wav`;
      const jsonPath = `output/${id}.json`;

      // Generate TTS using external API
      const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(text)}`;
      const audioReq = http.get(ttsUrl, (audioRes) => {
        const file = fs.createWriteStream(wavPath);
        audioRes.pipe(file);

        file.on('finish', () => {
          file.close(() => {
            // Run Rhubarb on the saved WAV file
            exec(`rhubarb "${wavPath}" -o "${jsonPath}" --machineReadable`, (err) => {
              if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: "Rhubarb failed" }));
                return;
              }

              const visemes = JSON.parse(fs.readFileSync(jsonPath));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                audioUrl: `http://localhost:3000/${wavPath}`,
                visemes: visemes.mouthCues
              }));
            });
          });
        });
      });

      audioReq.on('error', (err) => {
        res.writeHead(500);
        res.end("TTS request failed");
      });
    });
  } else if (req.method === 'GET' && req.url.startsWith('Rhubarb-Lip-Sync-1.13.0-Windows/')) {
    serveStaticFile(req, res);
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
