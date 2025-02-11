import './assets/main.css';

import { createApp, provide, h } from "vue";
import App from './App.vue';
import { DefaultApolloClient } from "@vue/apollo-composable";
import { apolloClient } from './apollo';

createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },
  render() {
    return h(App);
  }
}).mount("#app");
