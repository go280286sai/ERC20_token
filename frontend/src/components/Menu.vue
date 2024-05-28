<script setup>
</script>
<template>
<div>
  <div className="container p-4">
    <div className="row">
      <div className="col-12">
        <ul className="menu">
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/client">PayClient</router-link></li>
          <li><router-link to="/server">PayServer</router-link></li>
          <li><router-link to="/test">Test</router-link></li>
        </ul>
      </div>
    </div>
    <hr />
  </div>
</div>
</template>
<script>

export default {
  data() {
    return {
      state: {
        tokenData: undefined,
        selectedAddress: undefined,
        balance: undefined,
        txBeingSent: undefined,
        transactionError: undefined,
        networkError: undefined,
      },
    };
  },
  methods: {}
}
</script>
<style scoped>
.menu {
  display: flex;
  justify-content:   space-around ;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #333;
  border-radius: 5px;
  box-shadow: #fd9d0d 0 0 10px;
}
.menu li {
  float: left;
  list-style-type: none;
}
.menu li a {
  display: block;
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
}
.menu li a:hover {
  background-color: #116aad;
}
</style>