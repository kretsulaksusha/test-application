import { createRouter, createWebHistory } from "vue-router";
import AllApplications from "../views/AllApplications.vue";
import CreateApplication from "../views/CreateApplication.vue";
import CreateClient from "../views/CreateClient.vue";
import SingleApplicationDetails from "../views/SingleApplicationDetails.vue";

const routes = [
  {
    path: "/",
    alias: ["/applications"],
    name: "Applications",
    component: AllApplications,
  },
  {
    path: "/create-form",
    name: "CreateApplication",
    component: CreateApplication,
  },
  {
    path: "/create-client",
    name: "CreateClient",
    component: CreateClient,
  },
  {
    path: "/applications/:id",
    name: "SingleApplicationDetails",
    component: SingleApplicationDetails,
    props: (route) => ({
      id: route.params.id
    }),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

export default router;
