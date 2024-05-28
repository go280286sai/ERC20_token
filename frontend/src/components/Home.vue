<script setup>

</script>

<template>
  <div>
    <div className="container p-4">
      <div className="row">
        <div class="to_pay">
          <h1>
            Dashboard
          </h1>
          <p>
            Your address: <strong class="p_tag">{{ this.state.selectedAddress }}</strong>
          </p>
          <p>
            Your balance: <strong class="p_tag" >{{ this.state.balance }}</strong>
          </p>
          <p>
            Your token: <strong class="p_tag" >{{ this.state.tokens }}</strong>
          </p>
          <p>
            Current price: <strong  class="p_tag">{{ this.state.priceToken }}</strong>
          </p>
          <p>
            Token name: <strong class="p_tag">{{ this.state.name }}</strong>
          </p>
          <p>
            Token symbol: <strong class="p_tag">{{ this.state.symbol }}</strong>
          </p>
          <p>
            Token total: <strong class="p_tag">{{ this.state.totalSupply }}</strong>
          </p>
        </div>
        <div class="btn btn-primary btn_connect" @click="_connectWallet">Connect Wallet</div>
      </div>
      <hr/>

    </div>
  </div>
</template>
<script>

import Web3 from "web3";
import abi from "./../contracts/Token.json";
import {Contract} from 'web3-eth-contract';
import contractAddress from "./../contracts/contract-address.json";
import axios from "axios";

const url = "http://127.0.0.1:8545";
const web3 = new Web3(url);
const contract = new web3.eth.Contract(abi.abi, contractAddress.Token);

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
        priceToken: undefined,
        symbol: undefined,
        name: undefined,
        totalSupply: undefined,
        tokens: undefined
      },
    };
  },
  methods: {
    async _connectWallet() {
      if (window.ethereum) {
        try {
          const addressArray = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          this.state.selectedAddress = addressArray[0];
          this.state.balance = await this._update_balance(addressArray[0]);
          this.state.priceToken = await this._price();
          this.state.name = await this._nameToken();
          this.state.symbol = await this._symbol();
          this.state.totalSupply = await this._tokenTotal();
          this.state.tokens = await this._tokens();
        } catch (err) {
          if (err.code === 4001) {
            this.state.networkError = "Please connect to MetaMask.";
          } else {
            console.error(err);
          }
        }
      }
    },
    async _update_balance(selectedAddress) {
      const balance = await window.ethereum.request({method: 'eth_getBalance', params: [selectedAddress, 'latest']});
      return web3.utils.fromWei(balance, 'ether') + ' ETH';
    },
    async _price() {
     return await contract.methods.getTokenPrice().call();
    },
    async _nameToken() {
     return await contract.methods.name().call();
    },
    async _symbol() {
      return await contract.methods.symbol().call();
    },
    async _tokenTotal(){
      return await contract.methods.totalSupply().call();
    },
    async _tokens(){
      return await contract.methods.balanceOf(this.state.selectedAddress).call();
    }
  }
}
</script>
<style scoped>
.msg_error {
  color: red;
  font-size: 18px;
  text-decoration: underline;
}

.to_pay {
  background-color: #fd7e14;
  padding: 50px;
  border-radius: 10px;
  box-shadow: #2b3035 0 0 10px;
  color: white;
  font-size: 18px;
}

.btn_connect {
  margin: 5px 5px 5px 0;
  width: 150px;
}

.btn_pay {
  width: 150px;
}

#price {
  width: 80%;
  background-color: #ffc107;
  border-radius: 10px;
}

.p_tag {
  font-size: 20px;
  color: #000000;
}
</style>