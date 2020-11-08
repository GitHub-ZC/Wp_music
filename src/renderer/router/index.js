import Vue from 'vue'
import Router from 'vue-router'

import Search from '@/components/main/Search'
import Top from '@/components/main/Top'
import SongList from '@/components/main/SongList'
import Setting from '@/components/main/Setting'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/search',
      name: 'Search',
      component: Search
    },
    {
      path: '/top',
      name: 'Top',
      component: Top
    },
    {
      path: '/songlist',
      name: 'SongList',
      component: SongList
    },
    {
      path: '/setting',
      name: 'Setting',
      component: Setting
    },
    {
      path: '*',
      redirect: '/search'
    }
  ]
})
