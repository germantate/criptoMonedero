<template>
  <div class="price-checker">
    <h1>Precios de Criptomonedas</h1>
    <p>Selecciona una criptomoneda y un exchange para ver el precio.</p>

    <div class="form-group">
      <label for="crypto">Criptomoneda:</label>
      <select id="crypto" v-model="selectedCrypto">
        <option value="btc">Bitcoin (BTC)</option>
        <option value="eth">Ethereum (ETH)</option>
        <option value="usdc">USDC</option>
      </select>
    </div>

    <div class="form-group">
      <label for="exchange">Exchange:</label>
      <select id="exchange" v-model="selectedExchange">
        <option value="satoshitango">SatoshiTango</option>
        <option value="binance">Binance</option>
        <option value="argenbtc">ArgenBTC</option>
      </select>
    </div>

    <button @click="fetchPrice">Consultar Precio</button>

    <div v-if="price" class="price-info">
      <h3>Precio en tiempo real (ARS)</h3>
      <p>Compra (Ask): **${{ price.ask }}**</p>
      <p>Venta (Bid): **${{ price.bid }}**</p>
    </div>
    <p v-if="loading">Cargando...</p>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      selectedCrypto: "btc",
      selectedExchange: "satoshitango",
      price: null,
      loading: false,
      error: null,
    };
  },
  methods: {
    async fetchPrice() {
      this.loading = true;
      this.error = null;
      this.price = null;
      const url = `https://criptoya.com/api/${this.selectedExchange}/${this.selectedCrypto}/ars`;

      try {
        const response = await axios.get(url);
        this.price = response.data;
      } catch (err) {
        console.error("Error fetching crypto price:", err);
        this.error = "No se pudo obtener el precio. Inténtalo de nuevo.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.price-checker {
  padding: 2rem;
  text-align: center;
}
.form-group {
  margin-bottom: 1rem;
}
.price-info {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
</style>
