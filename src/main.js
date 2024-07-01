import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store"; // Add this line
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

const app = createApp(App);

app.use(router);
app.use(store); // Add this line
app.mount("#app");
