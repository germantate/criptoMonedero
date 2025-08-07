<template>
  <div class="history-container">
    <h1>Historial de Movimientos</h1>
    <div v-if="loading" class="loading">Cargando historial...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="transactions.length === 0" class="no-data">
      No hay movimientos registrados para este usuario.
    </div>
    <table v-else>
      <thead>
        <tr>
          <th>ID de Usuario</th>
          <th>Acción</th>
          <th>Cripto</th>
          <th>Cantidad</th>
          <th>Dinero (ARS)</th>
          <th>Fecha y Hora</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="transaction in transactions" :key="transaction._id">
          <td>{{ transaction.user_id }}</td>
          <td>{{ transaction.action === "purchase" ? "Compra" : "Venta" }}</td>
          <td>{{ transaction.crypto_code }}</td>
          <td>{{ transaction.crypto_amount }}</td>
          <td>${{ transaction.money }}</td>
          <td>{{ transaction.datetime }}</td>
          <td>
            <button @click="editTransaction(transaction._id)">Editar</button>
            <button @click="deleteTransaction(transaction._id)">Borrar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import apiClient from "../services/apiClient";

export default {
  name: "HistoryView",
  data() {
    return {
      transactions: [],
      loading: false,
      error: null,
      userId: "",
    };
  },
  created() {
    this.userId = localStorage.getItem("user_id");
    if (this.userId) {
      this.fetchTransactions();
    } else {
      this.error = "No se encontró un ID de usuario. Por favor, inicie sesión.";
    }
  },
  methods: {
    async fetchTransactions() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get(
          `transactions?q={"user_id": "${this.userId}"}`
        );
        this.transactions = response.data;
      } catch (err) {
        console.error("Error al obtener las transacciones:", err);
        this.error = "Ocurrió un error al cargar el historial.";
      } finally {
        this.loading = false;
      }
    },
    editTransaction(id) {
      this.$router.push({ name: "edit-transaction", params: { id: id } });
    },
    async deleteTransaction(id) {
      if (confirm("¿Está seguro de que desea borrar esta transacción?")) {
        try {
          await apiClient.delete(`transactions/${id}`);
          // Refrescar la lista de transacciones después de borrar
          this.fetchTransactions();
        } catch (err) {
          console.error("Error al borrar la transacción:", err);
          this.error = "Ocurrió un error al borrar la transacción.";
        }
      }
    },
  },
};
</script>

<style scoped>
.history-container {
  max-width: 1000px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
th,
td {
  border: 1px solid #ccc;
  padding: 12px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
button {
  margin-right: 5px;
  padding: 8px 12px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
}
button:first-of-type {
  background-color: #42b983;
  color: white;
}
button:last-of-type {
  background-color: #dc3545;
  color: white;
}
.loading,
.error-message,
.no-data {
  text-align: center;
  margin-top: 20px;
  padding: 10px;
  border-radius: 5px;
}
.loading {
  color: #555;
}
.error-message {
  color: red;
  background-color: #ffe6e6;
}
.no-data {
  color: #888;
}
</style>
