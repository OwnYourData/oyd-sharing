import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Home from '../views/Home.vue';
import SharingInfo from '../views/SharingInfo.vue';
import Survey from '../views/Survey.vue';
import DataSeries from '../views/DataSeries.vue';
import Review from '../views/Review.vue';
import ThankYou from '../views/ThankYou.vue';

Vue.use(VueRouter);

export const HOME = 'Home';
export const SHARING_INFO = 'Sharing Info';
export const SURVEY = 'Survey';
export const THANK_YOU = 'Thank You';
export const DATA_SERIES = 'Data Series';
export const REVIEW = 'Review';

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: HOME,
    component: Home,
  },
  {
    path: '/info',
    name: SHARING_INFO,
    component: SharingInfo,
  },
  {
    path: '/survey',
    name: SURVEY,
    component: Survey,
  },
  {
    path: '/data-series/:page?',
    name: DATA_SERIES,
    component: DataSeries,
  },
  {
    path: '/review',
    name: REVIEW,
    component: Review,
  },
  {
    path: '/thank-you',
    name: THANK_YOU,
    component: ThankYou
  }
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue'),
  // },
];

const router = new VueRouter({
  routes,
});

export default router;
