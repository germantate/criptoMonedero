<template>
  <div class="transaction-form-container">
    <h1>{{ isEditMode ? "Editar Transacción" : "Nueva Transacción" }}</h1>
    <form @submit.prevent="submitTransaction">
      <div class="form-group">
        <label for="actionType">Tipo de Movimiento:</label>
        <select id="actionType" v-model="transaction.action" required>
          <option value="purchase">Compra</option>
          <option value="sale">Venta</option>
        </select>
      </div>

      <div class="form-group">
        <label for="cryptoCode">Criptomoneda:</label>
        <select id="cryptoCode" v-model="transaction.crypto_code" required>
          <option value="">Seleccione una criptomoneda</option>
          <option value="bitcoin">Bitcoin</option>
          <option value="usdc">USDC</option>
          <option value="ethereum">Ethereum</option>
        </select>
      </div>

      <div class="form-group">
        <label for="cryptoAmount">Cantidad de Criptomoneda:</label>
        <input
          type="number"
          id="cryptoAmount"
          v-model.number="transaction.crypto_amount"
          step="0.00000001"
          min="0.00000001"
          required
        />
      </div>

      <div class="form-group">
        <label for="money">Dinero (ARS):</label>
        <input
          type="number"
          id="money"
          v-model.number="transaction.money"
          step="0.01"
          min="0.01"
          required
        />
      </div>

      <div class="form-group">
        <label for="datetime">Fecha y Hora:</label>
        <input
          type="datetime-local"
          id="datetime"
          v-model="datetimeLocal"
          required
        />
      </div>

      <button type="submit">
        {{ isEditMode ? "Guardar Cambios" : "Registrar Transacción" }}
      </button>
    </form>
    <p v-if="message" :class="messageType">{{ message }}</p>
  </div>
</template>

<script>
import apiClient from "../services/apiClient"; // Importa tu cliente API

export default {
  name: "TransactionForm",
  props: {
    id: {
      // Propiedad para recibir el ID de la transacción si estamos en modo edición
      type: String,
      default: null,
    },
  },
  data() {
    return {
      transaction: {
        user_id: "", // Se llenará desde localStorage
        action: "purchase", // 'purchase' o 'sale'
        crypto_code: "",
        crypto_amount: null,
        money: null,
        datetime: "", // Formato DD-MM-YYYY hh:ss
      },
      datetimeLocal: "", // Para el input type="datetime-local"
      message: "",
      messageType: "", // 'success' o 'error'
      isEditMode: false, // Para saber si estamos creando o editando
    };
  },
  watch: {
    // Observa cambios en datetimeLocal y actualiza transaction.datetime
    datetimeLocal(newValue) {
      this.transaction.datetime = this.formatDateForAPI(newValue);
    },
  },
  async created() {
    // Al cargar el componente, obtener el user_id de localStorage
    this.transaction.user_id = localStorage.getItem("user_id");

    // Si hay un ID en las props, significa que estamos editando una transacción
    if (this.id) {
      this.isEditMode = true;
      await this.loadTransaction(this.id);
    } else {
      // Si es una nueva transacción, establece la fecha y hora actual por defecto
      this.setInitialDateTime();
    }
  },
  methods: {
    setInitialDateTime() {
      const now = new Date();
      // Formato YYYY-MM-DDTHH:MM para input type="datetime-local"
      this.datetimeLocal = now.toISOString().slice(0, 16);
    },
    formatDateForAPI(isoString) {
      if (!isoString) return "";
      const date = new Date(isoString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Meses son 0-11
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    },
    parseDateFromAPI(apiDateString) {
      // Convierte "DD-MM-YYYY hh:ss" a "YYYY-MM-DDThh:mm" para el input datetime-local
      if (!apiDateString) return "";
      const [datePart, timePart] = apiDateString.split(" ");
      const [day, month, year] = datePart.split("-");
      return `${year}-${month}-${day}T${timePart}`;
    },
    async loadTransaction(id) {
      try {
        this.message = "Cargando transacción...";
        this.messageType = "";
        const response = await apiClient.get(`transactions/${id}`);
        const data = response.data;

        // Mapea los datos de la API a tu modelo de transacción
        this.transaction = {
          user_id: data.user_id,
          action: data.action,
          crypto_code: data.crypto_code,
          crypto_amount: parseFloat(data.crypto_amount), // Convertir a número
          money: parseFloat(data.money), // Convertir a número
          datetime: this.formatDateForAPI(data.datetime), // Mantener el formato de la API
        };
        this.datetimeLocal = this.parseDateFromAPI(data.datetime); // Para el input datetime-local

        this.message = ""; // Limpiar mensaje de carga
      } catch (error) {
        console.error("Error al cargar la transacción:", error);
        this.message = "Error al cargar la transacción.";
        this.messageType = "error";
      }
    },
    async submitTransaction() {
      this.message = ""; // Limpiar mensajes anteriores
      this.messageType = "";

      // Validaciones adicionales
      if (this.transaction.crypto_amount <= 0 || this.transaction.money <= 0) {
        this.message =
          "La cantidad de criptomoneda y el dinero deben ser mayores a 0.";
        this.messageType = "error";
        return;
      }
      if (!this.transaction.crypto_code) {
        this.message = "Por favor, seleccione una criptomoneda.";
        this.messageType = "error";
        return;
      }
      // Puedes añadir más validaciones de fecha si es necesario

      try {
        let response;
        if (this.isEditMode) {
          // Si estamos en modo edición, usamos PATCH
          this.message = "Actualizando transacción...";
          response = await apiClient.patch(
            `transactions/${this.id}`,
            this.transaction
          );
          this.message = "Transacción actualizada con éxito.";
        } else {
          // Si no, es una nueva transacción, usamos POST
          this.message = "Registrando transacción...";
          response = await apiClient.post("transactions", this.transaction);
          this.message = "Transacción registrada con éxito.";
        }
        this.messageType = "success";
        console.log("Transacción enviada/actualizada:", response.data);

        // Opcional: Redirigir al historial después de registrar/editar
        setTimeout(() => {
          this.$router.push("/history"); // Esta ruta la crearemos en el siguiente paso
        }, 1500); // Espera 1.5 segundos antes de redirigir
      } catch (error) {
        console.error("Error al registrar/actualizar transacción:", error);
        this.message = `Error al registrar/actualizar transacción: ${error.message}. Verifica tu ID de usuario o conexión.`;
        this.messageType = "error";
      }
    },
  },
};
</script>

<style scoped>
.transaction-form-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

.transaction-form-container h1 {
  color: #333;
  margin-bottom: 25px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group input[type="datetime-local"],
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 1em;
}

button[type="submit"] {
  background-color: #42b983;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1em;
  margin-top: 20px;
  width: 100%;
  transition: background-color 0.3s ease;
}

button[type="submit"]:hover {
  background-color: #36a473;
}

.message {
  margin-top: 20px;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
}

.success {
  background-color: #e6ffe6;
  color: #008000;
  border: 1px solid #008000;
}

.error {
  background-color: #ffe6e6;
  color: #ff0000;
  border: 1px solid #ff0000;
}
</style>
