import { createRouter, createWebHistory } from 'vue-router'
import Auth from '@/views/Auth.vue'
import FrontLayout from '@/views/front/Layout.vue'
import ArticleList from '@/views/front/ArticleList.vue'
import ArticleListByCategory from '@/views/front/ArticleListByCategory.vue'
import ArticleListByUser from '@/views/front/ArticleListByUser.vue'
import ArticleListByTag from '@/views/front/ArticleListByTag.vue'
import Article from '@/views/front/Article.vue'
import AdminLayout from '@/views/admin/Layout.vue'
import AdminIndex from '@/views/admin/Index.vue'
import ManageArticle from '@/views/admin/Article.vue'
import ManageCategory from '@/views/admin/Category.vue'
import ManageTag from '@/views/admin/Tag.vue'
import ManageUser from '@/views/admin/User.vue'

const routes = [
  { path: '/auth', component: Auth },
  {
    path: '/', component: FrontLayout, children: [
      { path: '/', component: ArticleList },
      { path: '/category/:slug', component: ArticleListByCategory },
      { path: '/user/:id', component: ArticleListByUser },
      { path: '/tag/:slug', component: ArticleListByTag },
      { path: '/article/:id', component: Article}
    ]
  },
  {
    path: '/admin', component: AdminLayout, children: [
      { path: '/admin', component: AdminIndex },
      { path: '/admin/article', component: ManageArticle },
      { path: '/admin/category', component: ManageCategory },
      { path: '/admin/tag', component: ManageTag },
      { path: '/admin/user', component: ManageUser }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

export default router