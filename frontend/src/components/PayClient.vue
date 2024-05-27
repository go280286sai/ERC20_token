<script setup>

</script>

<template>
  <div class="container">
    <div class="row">
      <div class="to_pay">
        <h1>
          Welcome to the Dapp!
        </h1>
        <p>
          Your address: {{ this.state.selectedAddress }}
        </p>
        <p>
          Your balance: {{ this.state.balance }}
        </p>
        <label for="price">Price</label> <br/>
        <input type="text" id="price" v-text="this.state.transferInfo" :value="this.state.transferInfo"  disabled>
        <div v-if="this.state.networkError===undefined">
          <div class="btn btn-primary btn_connect" @click="_connectWallet">Connect Wallet</div>
            <div v-if="this.status" class="btn btn-success btn_pay" @click="_pay">Pay</div>
            <p>Статус транзакции: {{this.state.statusTransaction}}</p>
            <p>Hash транзакции: {{ this.state.txBeingSent }}</p>
        </div>
          <div v-else>
            <p class="msg_error">{{ this.state.networkError }}</p>
          </div>
        </div>
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
        statusTransaction: undefined,
        transferInfo: undefined,
        price: undefined,
        current_price: undefined,
      },
      status: false,
    };
  },

  methods: {
    async _connectWallet() {
      if (window.ethereum) {
        this.state.price = await this.getKurs(this.state.current_price);
        this.state.transferInfo = `${this.state.current_price} UAH = ${(this.state.price/Math.pow(10, 18)).toFixed(3)} ETH`;
        const [selectedAddress] = await window.ethereum.request({method: 'eth_requestAccounts'});
        this.state.selectedAddress = selectedAddress;
        this.state.balance = await this._update_balance(selectedAddress);
        this.status = true;
        window.ethereum.on("accountsChanged", ([newAddress]) => {
          if (newAddress === undefined) {
            return this._connectWallet();
          }
          this.state.selectedAddress = selectedAddress;
          this.state.balance = this._update_balance(selectedAddress);
        });
      } else {
        this.state.networkError = "Please install MetaMask";
      }
    },

    _initialize(userAddress) {
      this.state.selectedAddress = userAddress;
    },
    async _update_balance(selectedAddress) {
      const balance = await window.ethereum.request({method: 'eth_getBalance', params: [selectedAddress, 'latest']});
      return web3.utils.fromWei(balance, 'ether') + ' ETH';
    },

    async _pay() {
      const total = this.state.price;
      const address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const id = this._generateID(this.state.current_price, this.state.price);
      const contract = new Contract(abi.abi, address, web3);
      const user = web3.utils.toChecksumAddress(this.state.selectedAddress.toString());
      await contract.methods.pay(id)
          .send({value: total, from: user})
          .then((data)=>{
            this._transactionSuccess(data.status.toString(), data.transactionHash.toString());
            this._create(id, user, data.transactionHash.toString());
          });
      document.getElementById('price').value = '';
      setTimeout(()=>{
window.location.replace('/', '_parent');
      },3000)

    },
    _create(id, from, hash){
    const csrfToken = $('meta[name="csrf-token"]').attr('content');
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
    axios.post('http://192.168.50.218/cart/create', {
        id: id,
        from: from,
        hash: hash
    },
  {headers: {'X-CSRF-TOKEN': csrfToken}}).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.log(error);
    })},
    _transactionError(error) {
      this.state.transactionError = error.message;
    },
    _networkError(error) {
      this.state.networkError = error.message;
    },
    _transactionSuccess(status, object) {
      if(status.toString() === "1"){
        this.state.statusTransaction = "Success";
      }
      this.state.txBeingSent  = object;
    },
    _generateID(a, b){
        return  Number((parseInt(a) + parseInt(b)).toString().substring(2, 5));
    },
    async getKurs(cena){
      const data = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=uah');
      const kurs = JSON.parse(await data.text()).ethereum.uah;
      if(cena !== 0 && kurs !== 0){
        return (cena / kurs) * Math.pow(10, 18);
      
      }
      throw new Error('Cena or Kurs not found');
    },

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
</style>



