import { createRouter, createWebHistory } from 'vue-router'
import Auth from '@/views/Auth.vue'
import Layout from '@/views/Layout.vue'
import ArticleList from '@/views/article/ArticleList.vue'
import ArticleListByCategory from '@/views/article/ArticleListByCategory.vue'
import ArticleListByUser from '@/views/article/ArticleListByUser.vue'
import ArticleListByTag from '@/views/article/ArticleListByTag.vue'
import Article from '@/views/article/Article.vue'
import AdminLayout from '@/views/admin/Layout.vue'
import AdminIndex from '@/views/admin/Welcome.vue'
import AdminArticle from '@/views/admin/Article.vue'

const routes = [
  { path: '/auth', component: Auth },
  {
    path: '/', component: Layout, children: [
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
      { path: '/admin/article', component: AdminArticle }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes
})

export default router