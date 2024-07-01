import { createRouter, createWebHistory } from "vue-router";
import BoardList from "../views/BoardList.vue";
import BoardView from "../views/BoardView.vue";

const routes = [
  { path: "/", name: "BoardList", component: BoardList },
  {
    path: "/board/:id",
    name: "BoardView",
    component: BoardView,
    props: (route) => ({ fullscreen: route.query.fullscreen === "true" }),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
