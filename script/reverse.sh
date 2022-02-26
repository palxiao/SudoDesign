#!/bin/bash

target="src" # 填写目标配置的目录路径
name="config.ts" # 目标文件名

path=$(dirname $0)

set -e

mv -f ${path}/${name} ${target}