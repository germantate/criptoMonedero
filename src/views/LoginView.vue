<template>
  <div class="login-container">
    <h1>Iniciar Sesión</h1>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="userId">ID de Usuario:</label>
        <input
          type="text"
          id="userId"
          v-model="userId"
          placeholder="Ingrese su ID alfanumérico"
          required
        />
      </div>
      <button type="submit">Entrar</button>
    </form>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  name: "LoginView",
  data() {
    return {
      userId: "", // Propiedad para almacenar lo que el usuario escribe
      errorMessage: "", // Para mostrar mensajes de error
    };
  },
  methods: {
    login() {
      // 1. Validar que el userId no esté vacío
      if (this.userId.trim() === "") {
        this.errorMessage = "Por favor, ingrese un ID de usuario.";
        return;
      }

      // 2. Guardar el ID de usuario en localStorage
      localStorage.setItem("user_id", this.userId.trim());
      console.log("ID de usuario guardado:", this.userId.trim());

      // 3. Redirigir al usuario a la página principal (Home)
      // Usamos Vue Router para navegar programáticamente
      this.$router.push("/home"); // La ruta '/home' la definiremos en el router en el siguiente paso
    },
  },
  // mounted() se ejecuta cuando el componente se monta en el DOM
  mounted() {
    // Opcional: Si ya hay un user_id en localStorage, redirigir directamente
    const storedUserId = localStorage.getItem("user_id");
    if (storedUserId) {
      this.$router.push("/home"); // Si ya está logueado, va a Home
    }
  },
};
</script>

<style scoped>
/* Estilos básicos para el formulario de login */
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.login-container h1 {
  color: #333;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box; /* Incluye padding y borde en el ancho */
}

button {
  background-color: #42b983;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
}

button:hover {
  background-color: #36a473;
}

.error-message {
  color: red;
  margin-top: 10px;
  font-size: 0.9em;
}
</style>
