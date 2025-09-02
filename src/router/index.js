import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import HomeView from "../views/HomeView.vue";
import HistoryView from "../views/HistoryView.vue";
import TransactionForm from "../views/TransactionForm.vue";
import AnalysisView from "../views/AnalysisView.vue";

const routes = [
  {
    path: "/",
    name: "login",
    component: LoginView,
  },
  {
    path: "/home",
    name: "home",
    component: HomeView,
  },
  {
    path: "/history",
    name: "history",
    component: HistoryView,
  },
  {
    path: "/transaction/new",
    name: "new-transaction",
    component: TransactionForm,
  },
  {
    path: "/transaction/edit/:id",
    name: "edit-transaction",
    component: TransactionForm,
    props: true,
  },
  {
    path: "/analysis", // <-- Nueva ruta para el análisis
    name: "analysis",
    component: AnalysisView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guardia de navegación (opcional, pero recomendado)
router.beforeEach((to, from, next) => {
  const userId = localStorage.getItem("user_id");
  if (to.name !== "login" && !userId) {
    next({ name: "login" });
  } else if (to.name === "login" && userId) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
