<template>
  <div id="app">
    <nav>
      <router-link to="/home">Inicio</router-link> |
      <router-link to="/transaction/new">Nueva Transacción</router-link> |
      <router-link to="/history">Historial de Movimientos</router-link> |
      <router-link to="/analysis">Análisis de Portafolio</router-link>
    </nav>
    <router-view />
  </div>
</template>

<style>
/* Estilos generales para toda la aplicación */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
