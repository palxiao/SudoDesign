#!/bin/bash

# 发布参数：
current_branch="main" # 当前分支
publish_branch="publish" # 发布分支

git add .
git commit -m 'init'
git checkout -b $publish_branch
rm -rf ./*
rm -rf ./.vscode
git add .
git commit -m 'init publish home'
git checkout $current_branch