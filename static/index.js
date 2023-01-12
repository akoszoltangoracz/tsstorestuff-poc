const PageHeader = Vue.component('page-header', {
  template: `<div>
    <router-link to="/"><h1>File Store</h1></router-link>
  </div>`,
});
  
const routes = [
  {path: '/', redirect: '/files'},
  {path: '/files', component: FilesPage},
  {path: '/upload', component: UploadPage},
];
  
const router = new VueRouter({
  routes
});
  
const app = new Vue({
  el: "#app",
  router,
  store,
  template: `
    <router-view/>
  `
});
