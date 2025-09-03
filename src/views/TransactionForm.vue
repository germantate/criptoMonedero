<template>
  <div class="transaction-form-container">
    <h1>{{ isEditMode ? "Editar Transacción" : "Nueva Transacción" }}</h1>
    <form @submit.prevent="submitTransaction">
      <div class="form-group">
        <label for="actionType">Tipo de Movimiento:</label>
        <select
          id="actionType"
          v-model="transaction.action"
          required
          @change="calculateMoney"
        >
          <option value="purchase">Compra</option>
          <option value="sale">Venta</option>
        </select>
      </div>

      <div class="form-group">
        <label for="cryptoCode">Criptomoneda:</label>
        <select
          id="cryptoCode"
          v-model="transaction.crypto_code"
          required
          @change="calculateMoney"
        >
          <option value="">Seleccione una criptomoneda</option>
          <option value="btc">Bitcoin</option>
          <option value="usdc">USDC</option>
          <option value="eth">Ethereum</option>
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
          @input="calculateMoney"
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
          readonly
        />
      </div>

      <p v-if="loading">Calculando importe...</p>

      <div class="form-group">
        <label for="datetime">Fecha y Hora:</label>
        <input
          type="datetime-local"
          id="datetime"
          v-model="datetimeLocal"
          required
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ isEditMode ? "Guardar Cambios" : "Registrar Transacción" }}
      </button>
    </form>
    <p v-if="message" :class="messageType">{{ message }}</p>
  </div>
</template>

<script>
import apiClient from "../services/apiClient";
import axios from "axios";

export default {
  name: "TransactionForm",
  props: {
    id: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      transaction: {
        user_id: "",
        action: "purchase",
        crypto_code: "",
        crypto_amount: null,
        money: null,
        datetime: "",
      },
      datetimeLocal: "",
      message: "",
      messageType: "",
      isEditMode: false,
      loading: false, //
    };
  },
  watch: {
    datetimeLocal(newValue) {
      this.transaction.datetime = this.formatDateForAPI(newValue);
    },
    "transaction.crypto_code": "calculateMoney",
    "transaction.action": "calculateMoney",
  },
  async created() {
    this.transaction.user_id = localStorage.getItem("user_id");

    if (this.id) {
      this.isEditMode = true;
      await this.loadTransaction(this.id);
    } else {
      this.setInitialDateTime();
    }
  },
  methods: {
    setInitialDateTime() {
      const now = new Date();
      this.datetimeLocal = now.toISOString().slice(0, 16);
    },
    formatDateForAPI(isoString) {
      if (!isoString) return "";
      const date = new Date(isoString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}-${month}-${year} ${hours}:${minutes}`;
    },
    parseDateFromAPI(apiDateString) {
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

        this.transaction = {
          user_id: data.user_id,
          action: data.action,
          crypto_code: data.crypto_code,
          crypto_amount: parseFloat(data.crypto_amount),
          money: parseFloat(data.money),
          datetime: this.formatDateForAPI(data.datetime),
        };
        this.datetimeLocal = this.parseDateFromAPI(data.datetime);

        this.message = "";
      } catch (error) {
        console.error("Error al cargar la transacción:", error);
        this.message = "Error al cargar la transacción.";
        this.messageType = "error";
      }
    },
    async submitTransaction() {
      this.message = "";
      this.messageType = "";

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

      try {
        let response;
        if (this.isEditMode) {
          this.message = "Actualizando transacción...";
          response = await apiClient.patch(
            `transactions/${this.id}`,
            this.transaction
          );
          this.message = "Transacción actualizada con éxito.";
        } else {
          this.message = "Registrando transacción...";
          response = await apiClient.post("transactions", this.transaction);
          this.message = "Transacción registrada con éxito.";
        }
        this.messageType = "success";
        console.log("Transacción enviada/actualizada:", response.data);

        setTimeout(() => {
          this.$router.push("/history");
        }, 1500);
      } catch (error) {
        console.error("Error al registrar/actualizar transacción:", error);
        this.message = `Error al registrar/actualizar transacción: ${error.message}. Verifica tu ID de usuario o conexión.`;
        this.messageType = "error";
      }
    },

    async calculateMoney() {
      // Si la cantidad es 0 o no se ha seleccionado una criptomoneda, no hacemos nada.
      if (
        this.transaction.crypto_amount <= 0 ||
        !this.transaction.crypto_code
      ) {
        this.transaction.money = 0;
        return;
      }

      this.loading = true;
      const cryptoCode = this.transaction.crypto_code;
      const amount = this.transaction.crypto_amount;

      try {
        // Obtenemos los precios de todos los exchanges para esa criptomoneda
        const response = await axios.get(
          `https://criptoya.com/api/${cryptoCode}/ars`
        );
        const data = response.data;

        let price = null;

        // Buscamos el primer exchange que tenga precios válidos
        for (const exchange in data) {
          if (data[exchange].bid && data[exchange].ask) {
            // Asignamos el precio de compra o venta y salimos del bucle
            price =
              this.transaction.action === "purchase"
                ? data[exchange].ask
                : data[exchange].bid;
            break; // Salimos del bucle una vez que encontramos un precio
          }
        }

        // Si encontramos un precio, realizamos el cálculo
        if (price) {
          this.transaction.money = price * amount;
        } else {
          console.error(
            "No se encontraron datos de precio para la criptomoneda seleccionada en ningún exchange."
          );
          this.transaction.money = 0;
          alert(
            "No se pudo obtener el precio en tiempo real. Por favor, revisa tu conexión o la criptomoneda seleccionada."
          );
        }
      } catch (error) {
        console.error("Error al obtener el precio en tiempo real:", error);
        alert(
          "No se pudo obtener el precio en tiempo real. Por favor, revisa tu conexión o la criptomoneda seleccionada."
        );
        this.transaction.money = 0;
      } finally {
        this.loading = false;
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
