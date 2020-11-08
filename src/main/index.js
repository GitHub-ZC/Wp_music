'use strict'

import { app, BrowserWindow, Tray, Menu, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import axios from 'axios'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 700,
    minWidth: 1000,
    minHeight: 700,
    useContentSize: true,
    frame: false,
    width: 1100,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 关闭窗口
  ipcMain.on('close', () => {
    mainWindow.hide()
  })

  // 最小化窗口
  ipcMain.on('minimize', () => {
    mainWindow.minimize()
  })

  // 最大化窗口
  ipcMain.on('maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  })

  // 设置托盘
  const tray = new Tray(path.join(__static, 'tray.png'))
  // 设置托盘菜单
  const trayContextMenu = Menu.buildFromTemplate([
    {
      label: '打开',
      click: () => {
        mainWindow.show()
      }
    }, {
      label: '退出',
      click: () => {
        app.quit()
      }
    }
  ])
  tray.setToolTip('myApp')
  tray.on('click', () => {
    mainWindow.show()
  })
  tray.on('right-click', () => {
    tray.popUpContextMenu(trayContextMenu)
  })
}
ipcMain.on('downloadSong', (event, e, song, url) => {
  let type = {
    '128': '.mp3',
    '320': '.mp3',
    'flac': '.flac'
  }
  let desktop = path.join(require('os').homedir(), 'Desktop/Wp_music')
  axios({
    method: 'get',
    url: url,
    responseType: 'stream'
  })
    .then(function (response) {
      fs.stat(desktop, function (err, stat) {
        if (err) {
          fs.mkdirSync(desktop)
          response.data.pipe(fs.createWriteStream(path.join(desktop, song.name + type[e])))
        } else {
          // 是否是目录:
          if (stat.isDirectory()) {
            response.data.pipe(fs.createWriteStream(path.join(desktop, song.name + type[e])))
          } else {
            fs.mkdirSync(desktop)
            response.data.pipe(fs.createWriteStream(path.join(desktop, song.name + type[e])))
          }
        }
      })
    })
})

app.on('ready', () => {
  // 创建渲染窗口
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
