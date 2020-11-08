# Wp_music
一款基于 `W_PlatformMusicApi` 接口的三平台音乐播放器

## 软件构造：

`Electron` + `Node.js` + `vue2`

## 软件截图：

![](https://github-zc.github.io/Wp_music/image-20201108144448024.png)



![](https://github-zc.github.io/Wp_music/image-20201108150138820.png)

![](https://github-zc.github.io/Wp_music/image-20201108150330963.png)

## 软件下载界面

[Wp_music发布页](https://github.com/GitHub-ZC/Wp_music/releases)



## 自行构建：

> 当然你也可以自行构建

```shell
$ git clone https://github.com/GitHub-ZC/Wp_music.git
$ npm install
#构建win安装包
$ npm run build
#构建免安装安装包
$ npm run build:dir
#构建linux安装包
$ npm run build:linux_deb
```



## 使用说明：
`右键菜单`：歌曲列表中的每一首歌曲，鼠标右键可以打开右键菜单，右键菜单中的 _复制歌曲信息_ 当前版本无任何效果

`音质选择`：只对企鹅平台音乐有效果，网易、咪咕默认都是普通音质

`播放下载`：播放或者下载音乐时，无音乐源会在窗口顶部有警告提示

`播放顺序`：默认为列表播放，当前版本未添加其他播放方式，如果想要单曲循环，可以让播放列表只有一首歌曲

`下载地址`：会自动在桌面生成Wp_music文件夹，默认歌曲都在其中，企鹅可以下载无损、高标准，网易、咪咕仅普通

## 关于作者：
如果此软件侵犯您相关内容，请联系作者 QQ邮箱：153140965@qq.com
