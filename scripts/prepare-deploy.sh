#!/bin/bash

# 设置变量
DEPLOY_DIR="deploy"
DEPLOY_REPO_DIR="deploy-repo"

# 确保目录存在
mkdir -p $DEPLOY_DIR
mkdir -p $DEPLOY_REPO_DIR

# 清理旧的部署文件
rm -rf $DEPLOY_DIR/*

# 临时移除 .env.local（如果存在）
[ -f .env.local ] && mv .env.local .env.local.backup

# 运行生产构建
NODE_ENV=production npm run build

# 恢复 .env.local（如果之前存在）
[ -f .env.local.backup ] && mv .env.local.backup .env.local

# 复制必要的文件到部署目录
cp -r .next $DEPLOY_DIR/
# 删除缓存文件
rm -rf $DEPLOY_DIR/.next/cache

cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/
cp .env.production $DEPLOY_DIR/ 2>/dev/null || echo "No .env.production file"
cp ecosystem.config.js $DEPLOY_DIR/ 2>/dev/null || echo "No ecosystem.config.js file"

# 创建精简的 package.json（只包含生产依赖）
node -e "
const pkg = require('./package.json');
const newPkg = {
  name: pkg.name,
  version: pkg.version,
  private: pkg.private,
  scripts: {
    start: 'next start'
  },
  dependencies: pkg.dependencies
};
require('fs').writeFileSync('$DEPLOY_DIR/package.json', JSON.stringify(newPkg, null, 2));
"

# 复制到Git部署仓库（使用cp -a来保留所有属性，包括隐藏文件）
cp -a $DEPLOY_DIR/. $DEPLOY_REPO_DIR/

# 输出提示信息
echo "部署文件已准备完成！"
echo "文件位置: $DEPLOY_REPO_DIR"
echo ""
echo "接下来的步骤："
echo "1. cd $DEPLOY_REPO_DIR"
echo "2. git add ."
echo "3. git commit -m 'Deploy update'"
echo "4. git push origin main"