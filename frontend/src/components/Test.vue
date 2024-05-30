<script setup>

</script>

<template>
<div>
  <div className="container p-4">
    <div className="row">
      <div className="col-12">
        <h1>Welcome to the Dapp!</h1>
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

</style>