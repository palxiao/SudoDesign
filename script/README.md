<!--
 * @Author: ShawnPhang
 * @Date: 2021-08-22 23:23:53
 * @Description: 部署脚本
 * @LastEditors: ShawnPhang
 * @LastEditTime: 2021-08-23 14:48:30
 * @site: book.palxp.com / blog.palxp.com
-->

package.json -> script
{
    "build": "node script/set config.json && xxxxxxxxxx && sh script/reverse.sh",

    "publish": "sh script/publish.sh",
    "publish-fast": "git add . && git commit -m 'build: auto publish' && sh script/publish.sh"
}

1. 检查每个脚本的配置
2. 检查 .drone.yml 中的配置
3. .gitignore 添加 config.json 过滤
4. 运行 sh script/init.sh 进行初始化
5. 添加 config.json , 修改项目中对应的config , 参数替代为 ${xxx}
6. npm run publish-fast
7. npm run publish