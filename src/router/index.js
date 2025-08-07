import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import HomeView from "../views/HomeView.vue";
import HistoryView from "../views/HistoryView.vue"; // Importa la nueva vista
import TransactionForm from "../views/TransactionForm.vue"; // Importa el nuevo componente

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
    path: "/history", // <-- Ruta para el historial
    name: "history",
    component: HistoryView,
  },
  {
    path: "/transaction/new", // <-- Ruta para crear una nueva transacción
    name: "new-transaction",
    component: TransactionForm,
  },
  {
    path: "/transaction/edit/:id", // <-- Ruta para editar con un ID
    name: "edit-transaction",
    component: TransactionForm,
    props: true,
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
