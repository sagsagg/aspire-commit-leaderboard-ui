import './assets/main.css';

import { createApp } from "vue";
import App from './App.vue';
import { apolloClient } from './apollo';

const app = createApp(App);

// Make Apollo Client globally available via app.config.globalProperties
app.config.globalProperties.$apolloClient = apolloClient;

// Provide Apollo Client for inject/provide pattern
app.provide('apolloClient', apolloClient);

app.mount("#app");
