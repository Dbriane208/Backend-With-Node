const fs = require('fs');
const path = require('path');

function directoryToTree(rootDir, depth) {
    // Helper function to get the size of a file or directory
    const getSize = (filePath) => {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            return fs.readdirSync(filePath).reduce((total, child) => {
                return total + getSize(path.join(filePath, child));
            }, 0);
        }
        return stats.size;
    };

    // Helper function to build the tree
    const buildTree = (dirPath, currentDepth) => {
        const stats = fs.statSync(dirPath);
        const node = {
            name: path.basename(dirPath),
            path: path.relative(process.cwd(), dirPath),
            type: stats.isDirectory() ? 'dir' : 'file',
            size: getSize(dirPath)
        };

        if (stats.isDirectory() && currentDepth > 0) {
            node.children = fs.readdirSync(dirPath).map(child => {
                return buildTree(path.join(dirPath, child), currentDepth - 1);
            });
        }

        return node;
    };

    return buildTree(path.resolve(rootDir), depth);
}

// Example usage
const tree = directoryToTree('dummy_dir/a_dir', 5);
console.log(JSON.stringify(tree, null, 2));
