import http from 'http';
import { handleRequest } from './routes.js';
import { readProductData } from './utils.js';

const PORT = 8004;
const HOST = '127.0.0.1';

const server = http.createServer(handleRequest);

readProductData().then(() => {
    server.listen(PORT, HOST, () => {
        console.log(`Server running at http://${HOST}:${PORT}`);
    });
});