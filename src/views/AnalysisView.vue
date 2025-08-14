<template>
  <div class="analysis-container">
    <h1>Análisis de tu Cripto-Portfolio</h1>
    <div v-if="loading" class="loading">Cargando análisis...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else class="analysis-summary">
      <div class="summary-card">
        <h2>Total de Compras</h2>
        <p class="purchase-amount">${{ totals.purchases.toFixed(2) }}</p>
      </div>
      <div class="summary-card">
        <h2>Total de Ventas</h2>
        <p class="sale-amount">${{ totals.sales.toFixed(2) }}</p>
      </div>
      <div class="summary-card">
        <h2>Balance Total</h2>
        <p
          :class="[
            'balance-amount',
            { positive: totals.balance >= 0, negative: totals.balance < 0 },
          ]"
        >
          ${{ totals.balance.toFixed(2) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from "../services/apiClient";

export default {
  name: "AnalysisView",
  data() {
    return {
      transactions: [],
      loading: false,
      error: null,
      userId: "",
      totals: {
        purchases: 0,
        sales: 0,
        balance: 0,
      },
    };
  },
  created() {
    this.userId = localStorage.getItem("user_id");
    if (this.userId) {
      this.fetchAndAnalyzeTransactions();
    } else {
      this.error = "No se encontró un ID de usuario. Por favor, inicie sesión.";
    }
  },
  methods: {
    async fetchAndAnalyzeTransactions() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiClient.get(
          `transactions?q={"user_id": "${this.userId}"}`
        );
        this.transactions = response.data;
        this.calculateTotals();
      } catch (err) {
        console.error("Error al obtener las transacciones:", err);
        this.error = "Ocurrió un error al cargar el análisis.";
      } finally {
        this.loading = false;
      }
    },
    calculateTotals() {
      let totalPurchases = 0;
      let totalSales = 0;

      this.transactions.forEach((transaction) => {
        const money = parseFloat(transaction.money);
        if (transaction.action === "purchase") {
          totalPurchases += money;
        } else if (transaction.action === "sale") {
          totalSales += money;
        }
      });

      this.totals.purchases = totalPurchases;
      this.totals.sales = totalSales;
      this.totals.balance = totalPurchases - totalSales;
    },
  },
};
</script>

<style scoped>
.analysis-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

.analysis-container h1 {
  color: #333;
  margin-bottom: 30px;
}

.analysis-summary {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.summary-card {
  flex: 1;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.summary-card h2 {
  font-size: 1.2em;
  color: #555;
  margin-bottom: 15px;
}

.summary-card p {
  font-size: 2em;
  font-weight: bold;
  margin: 0;
}

.purchase-amount {
  color: #42b983; /* Verde para compras */
}

.sale-amount {
  color: #dc3545; /* Rojo para ventas */
}

.balance-amount {
  font-size: 2.2em;
}
.balance-amount.positive {
  color: #28a745; /* Verde para balance positivo */
}
.balance-amount.negative {
  color: #dc3545; /* Rojo para balance negativo */
}

.loading,
.error-message {
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
</style>
