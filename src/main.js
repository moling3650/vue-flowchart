// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui'
import axios from 'axios'
// import { jsPlumb } from 'jsplumb'
import jsp from 'jsplumb'
import App from './App'

import 'reset.css'
import 'element-ui/lib/theme-default/index.css'

Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.prototype.$http = axios
Vue.prototype.$jsplumb = jsp.jsPlumb
Vue.prototype.$util = jsp.jsPlumbUtil

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
