<template>
  <div class="home-container">
    <h1>¡Bienvenido a tu Cripto-Portfolio!</h1>
    <p>Tu ID de usuario es: {{ userId }}</p>
    <p>Aquí se mostrará el panel principal de tu cartera.</p>
    <button @click="logout">Cerrar Sesión</button>
  </div>
</template>

<script>
export default {
  name: "HomeView",
  data() {
    return {
      userId: localStorage.getItem("user_id") || "No definido", // Recupera el ID del usuario
    };
  },
  methods: {
    logout() {
      localStorage.removeItem("user_id"); // Elimina el ID del usuario
      this.$router.push("/"); // Redirige al login
    },
  },
};
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}
button {
  background-color: #dc3545; /* Rojo para cerrar sesión */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
}

button:hover {
  background-color: #c82333;
}
</style>
