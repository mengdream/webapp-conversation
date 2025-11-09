#!/bin/bash

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 切换到项目根目录
cd "$PROJECT_ROOT" || exit 1

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
if [ -d ".next" ]; then
  cp -r .next $DEPLOY_DIR/
  # 删除缓存文件
  rm -rf $DEPLOY_DIR/.next/cache
else
  echo "错误: .next 目录不存在，请先运行 npm run build"
  exit 1
fi

# Copy static files
if [ -d "public" ]; then
  cp -r public $DEPLOY_DIR/
else
  echo "警告: public 目录不存在"
fi

# Copy package files and configs
if [ -f "package.json" ]; then
  cp package.json $DEPLOY_DIR/
else
  echo "错误: package.json 不存在"
  exit 1
fi

if [ -f "package-lock.json" ]; then
  cp package-lock.json $DEPLOY_DIR/
else
  echo "警告: package-lock.json 不存在"
fi

cp .env.production $DEPLOY_DIR/ 2>/dev/null || echo "No .env.production file"
cp ecosystem.config.js $DEPLOY_DIR/ 2>/dev/null || echo "No ecosystem.config.js file"

# 创建精简的 package.json（只包含生产依赖）
PACKAGE_JSON_PATH="$PROJECT_ROOT/package.json"
DEPLOY_PACKAGE_JSON="$PROJECT_ROOT/$DEPLOY_DIR/package.json"

node -e "
const pkg = require('$PACKAGE_JSON_PATH');
const newPkg = {
  name: pkg.name,
  version: pkg.version,
  private: pkg.private,
  scripts: {
    start: 'next start'
  },
  dependencies: pkg.dependencies
};
require('fs').writeFileSync('$DEPLOY_PACKAGE_JSON', JSON.stringify(newPkg, null, 2));
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