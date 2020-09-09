
const http = require('http');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');

const documentRoot = 'C:/Code/exp';
// 自定义根目录

// const fileType = {
//   DIR: 'dir', // 目录
//   FILE: 'file', // 文件
//   IMAGE: 'image' // 图片
// }

// 文件节点
// interface fileNode {
//   name: String;
//   path: String;
//   type: String;
//   children: fileNode;
// };

// 获取文件树结构
const getFileTree = async function(pathParams) {
  const particalTree = []
  // 遍历当前文件目录
  const dirs = await fs.readdirSync(pathParams)
  for await (let file of dirs) {
    const state = await fs.statSync(path.join(pathParams, file))
    let fileNode = {}
    fileNode.name = file
    fileNode.path = path.join(pathParams, file)
    if (state.isDirectory()) { // 如果子文件是文件夹
      const childrenTree = await getFileTree(path.join(pathParams, file))
      fileNode.children = childrenTree
    }
    particalTree.push(fileNode)
  }
  return particalTree
};

// 获取文件节点
const getList = async function(url) {
  const res = await getFileTree(url)
  return res
};

const requestListener = async function (request, response) {

  const fileAbsoluteUrl = documentRoot + request.url;

  response.writeHeader(200, {
    'content-type': 'text/html;charset="utf-8"'
  });
  const res = await getList(fileAbsoluteUrl)
  drawTree(res)
  response.write(JSON.stringify(res));
  response.end();
};

// 绘图
const drawTree = function(data) {
  if (data.length > 0) {
    data.forEach(item => {
      if (item.children) {
        console.log(chalk.green(`${item.name}`))
        drawTree(item.children)
      } else {
        console.log(`  |- ${item.name}`)
      }
    })
  }
}

try {
  const server = http.createServer(requestListener).listen(9527);
  console.log(chalk.green(`服务器创建成功：localhost:9527`));
} catch (err) {
  console.error(err)
}

