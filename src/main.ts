import './assets/main.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import { initializeApp } from 'firebase/app'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Menubar from 'primevue/menubar'

import App from './App.vue'
import router from './router'

const firebaseConfig = {
  apiKey: 'AIzaSyAgy_fnnVn-VX-6jz_i3d2uabDXlNiXnkw',
  authDomain: 'interviews-vue-app.firebaseapp.com',
  projectId: 'interviews-vue-app',
  storageBucket: 'interviews-vue-app.appspot.com',
  messagingSenderId: '809483682696',
  appId: '1:809483682696:web:de3d21c84d761e1d39b03d'
}

initializeApp(firebaseConfig)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue)

app.component('app-menubar', Menubar)

app.mount('#app')
