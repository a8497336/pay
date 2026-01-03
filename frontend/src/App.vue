<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
  const uuid = localStorage.getItem('payjhfluuid');
  if (!uuid) {
    localStorage.setItem('payjhfluuid', `${Math.random().toString(36).substring(2, 10)}-${Date.now()}`)
  }
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  background: linear-gradient(135deg, #e0f2fe 0%, #f3e7ff 100%);
  min-height: 100vh;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
  position: relative;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

input,
select,
button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  font-family: inherit;
}

button {
  cursor: pointer;
  border: none;
  outline: none;
}

input:focus,
select:focus {
  outline: none;
}
</style>
