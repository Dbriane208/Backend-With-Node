import { URL } from 'url';
import {
    headers,
    getRequestBody,
    serveStaticFile,
    productData,
    writeProductData
} from './utils.js';

export const handleRequest = async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathSegments = url.pathname.split('/').filter(Boolean);

    if (pathSegments[0] === 'api' && pathSegments[1] === 'product') {
        await handleApiRequests(req, res, pathSegments);
    } else {
        await serveStaticFile(url.pathname, res);
    }
};

const handleApiRequests = async (req, res, pathSegments) => {
    const id = pathSegments[2] ? parseInt(pathSegments[2]) : null;

    switch (req.method) {
        case 'GET':
            await handleGetRequest(res, id);
            break;
        case 'POST':
            await handlePostRequest(req, res);
            break;
        case 'PATCH':
            await handlePatchRequest(req, res, id);
            break;
        case 'DELETE':
            await handleDeleteRequest(res, id);
            break;
        default:
            res.writeHead(405, headers);
            res.end('Method Not Allowed');
    }
};

const handleGetRequest = async (res, id) => {
    if (id) {
        const product = productData.find(p => p.id === id);
        if (product) {
            res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
            res.end(JSON.stringify(product));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
            res.end(JSON.stringify({ message: "Product not found" }));
        }
    } else {
        res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
        res.end(JSON.stringify(productData));
    }
};

const handlePostRequest = async (req, res) => {
    const body = await getRequestBody(req);
    const newProduct = { id: productData.length + 1, ...JSON.parse(body) };
    productData.push(newProduct);
    await writeProductData();
    res.writeHead(201, { 'Content-Type': 'application/json', ...headers });
    res.end(JSON.stringify(newProduct));
};

const handlePatchRequest = async (req, res, id) => {
    const index = productData.findIndex(p => p.id === id);
    if (index > -1) {
        const body = await getRequestBody(req);
        const updatedProduct = { ...productData[index], ...JSON.parse(body) };
        productData[index] = updatedProduct;
        await writeProductData();
        res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
        res.end(JSON.stringify(updatedProduct));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
        res.end(JSON.stringify({ message: "Product not found" }));
    }
};

const handleDeleteRequest = async (res, id) => {
    const index = productData.findIndex(p => p.id === id);
    if (index > -1) {
        productData.splice(index, 1);
        await writeProductData();
        res.writeHead(200, { 'Content-Type': 'application/json', ...headers });
        res.end(JSON.stringify({ message: "Successfully deleted" }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json', ...headers });
        res.end(JSON.stringify({ message: "Product not found" }));
    }
};