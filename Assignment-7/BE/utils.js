import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDirectory = path.join(__dirname, 'FE');
const dataFilePath = path.join('../BE/db.txt');

export const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
};

export const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, GET, POST, PUT, PATCH, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export let productData = [];

export const readProductData = async () => {
    try {
        const data = await fs.readFile(dataFilePath, 'utf8');
        productData = JSON.parse(data);
    } catch (error) {
        console.error('Error reading or parsing product data:', error);
    }
};

export const writeProductData = async () => {
    try {
        await fs.writeFile(dataFilePath, JSON.stringify(productData, null, 2));
    } catch (error) {
        console.error('Error writing product data:', error);
    }
};

export const getRequestBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => resolve(body));
        req.on('error', reject);
    });
};

export const serveStaticFile = async (pathname, res) => {
    const filePath = path.join(staticDirectory, pathname === '/' ? 'index.html' : pathname);
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    try {
        const content = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType, ...headers });
        res.end(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            const content404 = await fs.readFile(path.join(staticDirectory, '404.html'));
            res.writeHead(404, { 'Content-Type': 'text/html', ...headers });
            res.end(content404);
        } else {
            res.writeHead(500, headers);
            res.end(`Server Error: ${error.code}`);
        }
    }
};