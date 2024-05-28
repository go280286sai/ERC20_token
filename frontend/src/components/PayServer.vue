<script setup>

</script>

<template>
  <div class="container">
    <div class="row">
      <div class="to_pay">
        <h1>
          Welcome to the Dapp!
        </h1>
        <div class="btn btn-primary btn_connect" @click="_connectWallet">Connect Wallet</div>

        <p>
          Your address: <strong class="p_tag">{{ this.state.selectedAddress }}</strong>
        </p>
        <p>
          Your balance: <strong class="p_tag">{{ this.state.balance }}</strong>
        </p>
        <p>
          Your token: <strong class="p_tag">{{ this.state.tokens }}</strong>
        </p>
        <p>
          Current price: <strong class="p_tag">{{ this.state.priceToken }}</strong>
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
        <p>
          Token supply total: <strong class="p_tag">{{ this.state.totalSupplyTokens }}</strong>
        </p>
        <p>
          Balance of contract: <strong class="p_tag">{{ this.state.balanceContract }}</strong>
        </p>

        <div class="block_pay mb-3">
          <div>
            <label for="add">Add count token</label> <br>
            <input type="number" class="field mb-2" id="add">
            <br>
            <input type="button" value="Add tokens" class="btn btn-success btn_pay" @click="_addTokens">
          </div>
          <br><br>
        <div>
          <label for="burn">Burn count token</label> <br>
          <input type="number" class="field mb-2" id="burn">
          <br>
          <input type="button" value="Burn tokens" class="btn btn-success btn_pay" @click="_burnTokens">
        </div>
          <br><br>
          <div>
            <label for="fund">Fund contract</label> <br>
            <input type="number" class="field mb-2" id="fund">
            <br>
            <input type="button" value="Fund contract" class="btn btn-success btn_pay" @click="_fundContract">
          </div>
          <br><br>
          <div>
            <label for="w_part">Withdraw part</label> <br>
            <input type="number" class="field mb-2" id="w_part">
            <br>
            <input type="button" value="Withdraw part" class="btn btn-success btn_pay" @click="_withdrawPart">
          </div>
          <br><br>
          <div>
            <label for="w_all">Withdraw all</label> <br>
            <input type="button" value="Withdraw all" class="btn btn-success btn_pay" @click="_withdrawAll">
          </div>
      </div>
        <div class="block_pay">
          <h3 class="mb-3">Transfer token</h3>
          <table>
            <tr>
              <td>
                <label for="count">Enter count token</label>
                <input type="number" class="field mb-2" id="count" v-model.number="state.countTokens"
                       placeholder="Enter count token"/>
                <br>
                <label for="price">Enter address</label>
                <input type="text" id="to" class="field mb-2" v-model="state.userAddress"></td>
            </tr>
          </table>
          <div v-if="this.state.networkError===undefined">
            <div class="btn btn-success btn_pay" @click="_fromTo">Pay</div>
            <p>Статус транзакции: {{ this.state.statusTransaction }}</p>
            <p>Hash транзакции: {{ this.state.txBeingSent }}</p>
          </div>
          <div v-else>
            <p class="msg_error">{{ this.state.networkError }}</p>
          </div>
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
        priceToken: 0,
        symbol: undefined,
        name: undefined,
        totalSupply: undefined,
        tokens: undefined,
        countTokens: 0,
        getPredictPrice: 0,
        transferToken: undefined,
        errorTransaction: undefined,
        userAddress: undefined,
        totalSupplyTokens: undefined,
        balanceContract: undefined,


      },
    };
  },
  async mounted() {
    await this._initialize();
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

    async _initialize(userAddress) {
      this.state.priceToken = await this._price();
      this.state.name = await this._nameToken();
      this.state.symbol = await this._symbol();
      this.state.totalSupply = await this._tokenTotal();
      this.state.totalSupplyTokens = await this._totalSupply();
      this.state.balanceContract = await this._balanceContract();
    },
    async _addTokens() {
      try {
        const countTokens = document.getElementById("add").value;
        if (this.state.selectedAddress === undefined) {
          alert("Connect your wallet");
          return;
        }
        if (countTokens === 0) {
          alert("Enter count token");
          return;
        }
        const address = contractAddress.Token;
        const contract = new Contract(abi.abi, address, web3);
        const user = web3.utils.toChecksumAddress(this.state.selectedAddress.toString());
        await contract.methods.addToken(countTokens)
            .send({from: user})
            .then(async (data) => {
              await this._transactionSuccess(data.status.toString(), data.transactionHash.toString());
              await this._initialize();
              await this._tokens().then(data => {
                this.state.tokens = data
              })
              await this._connectWallet();
              document.getElementById("add").value = '';
            }).catch(() => {
              this.state.errorTransaction("Ошибка проведения транзакции. Попробуйте еще раз.")
            });
      } catch (e) {
        this.state.errorTransaction("Ошибка проведения транзакции. Попробуйте еще раз.")
      }
    },
    async _burnTokens() {
      try {
        const countTokens = document.getElementById("burn").value;
        if (this.state.selectedAddress === undefined) {
          alert("Connect your wallet");
          return;
        }
        if (countTokens === 0) {
          alert("Enter count token");
          return;
        }
        const address = contractAddress.Token;
        const contract = new Contract(abi.abi, address, web3);
        const user = web3.utils.toChecksumAddress(this.state.selectedAddress.toString());
        await contract.methods.burn(countTokens)
            .send({from: user})
            .then(async (data) => {
              await this._transactionSuccess(data.status.toString(), data.transactionHash.toString());
              await this._initialize();
              await this._tokens().then(data => {
                this.state.tokens = data
              })
              await this._connectWallet();
              this.state.countTokens = 0;
              document.getElementById("burn").value = '';
            }).catch(() => {
              this.state.errorTransaction("Ошибка проведения транзакции. Попробуйте еще раз.")
            });
      } catch (e) {
        this.state.errorTransaction("Ошибка проведения транзакции. Попробуйте еще раз.")
      }
    },
    async _fundContract() {
      try {
        const countTokens = document.getElementById("fund").value;
        if (this.state.selectedAddress === undefined) {
          alert("Connect your wallet");
          return;
        }
        if (countTokens === 0) {
          alert("Enter count token");
          return;
        }
        const address = contractAddress.Token;
        const contract = new Contract(abi.abi, address, web3);
        const user = web3.utils.toChecksumAddress(this.state.selectedAddress.toString());
        await contract.methods.fundContract()
            .send({value: web3.utils.toWei(countTokens.toString(), 'wei'), from: user})
            .then(async (data) => {
              await this._transactionSuccess(data.status.toString(), data.transactionHash.toString());
              await this._initialize();
              await this._tokens().then(data => {
                this.state.tokens = data
              })
              await this._connectWallet();
              this.state.countTokens = 0;
              document.getElementById("fund").value = '';
            }).catch(() => {
              this.state.errorTransaction("Ошибка проведения транзакции. Попробуйте еще раз.")
            });
      } catch (e) {
        this.state.errorTransaction("Ошибка проведения транзакции. Попробуйте еще раз.")
      }
    },
    async _withdrawPart() {
      try {
        const countTokens = document.getElementById("w_part").value;
        if (this.state.selectedAddress === undefined) {
          alert("Connect your wallet");
          return;
        }
        if (countTokens === 0) {
          alert("Enter count token");
          return;
        }
        const address = contractAddress.Token;
        const contract = new Contract(abi.abi, address, web3);
        const user = web3.utils.toChecksumAddress(this.state.selectedAddress.toString());
        await contract.methods.withdrawPart(countTokens)
            .send({ from: user})
            .then(async (data) => {
              await this._transactionSuccess(data.status.toString(), data.transactionHash.toString());
              await this._initialize();
              await this._tokens().then(data => {
                this.state.tokens = data
              })
              await this._connectWallet();
              this.state.countTokens = 0;
              document.getElementById("w_part").value = '';
            }).catch(() => {
              this.state.errorTransaction("Ошибка проведения транзакции. Попробуйте еще раз.")
            });
      } catch (e) {
        this.state.errorTransaction("Ошибка проведения транзакции. Попробуйте еще раз.")
      }
    },
    async _withdrawAll() {
      try {
        if (this.state.selectedAddress === undefined) {
          alert("Connect your wallet");
          return;
        }
        const address = contractAddress.Token;
        const contract = new Contract(abi.abi, address, web3);
        const user = web3.utils.toChecksumAddress(this.state.selectedAddress.toString());
        await contract.methods.withdraftAll()
            .send({ from: user})
            .then(async (data) => {
              await this._transactionSuccess(data.status.toString(), data.transactionHash.toString());
              await this._initialize();
              await this._tokens().then(data => {
                this.state.tokens = data
              })
              await this._connectWallet();
            }).catch(() => {
              this.state.errorTransaction("Ошибка проведения транзакции. Попробуйте еще раз.")
            });
      } catch (e) {
        this.state.errorTransaction("Ошибка проведения транзакции. Попробуйте еще раз.")
      }
    },
    async _fromTo() {
      const countTokens = parseInt(this.state.countTokens);
      if (this.state.selectedAddress === undefined) {
        alert("Connect your wallet");
        return;
      }
      if (countTokens === 0) {
        alert("Enter count token");
        return;
      }
      const address = contractAddress.Token;
      const contract = new Contract(abi.abi, address, web3);
      const owner = web3.utils.toChecksumAddress(this.state.selectedAddress.toString());
      const userAddress = document.getElementById('to').value;
      const user = web3.utils.toChecksumAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
      console.log(owner, user, countTokens)
      await contract.methods.transferFrom(owner, user, countTokens)
          .send({from: owner})
          .then((data) => {
            this._transactionSuccess(data.status.toString(), data.transactionHash.toString());
            this._initialize();
            this._tokens().then(data => {
              this.state.tokens = data
            });

          });
      document.getElementById('price').value = '';

    }
    ,
    _transactionError(error) {
      this.state.transactionError = error.message;
    }
    ,
    _networkError(error) {
      this.state.networkError = error.message;
    }
    ,
    _transactionSuccess(status, object) {
      if (status.toString() === "1") {
        this.state.statusTransaction = "Success";
      }
      this.state.txBeingSent = object;
    }
    ,
    async _update_balance(selectedAddress) {
      const balance = await window.ethereum.request({method: 'eth_getBalance', params: [selectedAddress, 'latest']});
      return web3.utils.fromWei(balance, 'ether') + ' ETH';
    }
    ,
    async _price() {
      return await contract.methods.getTokenPrice().call();
    }
    ,
    async _nameToken() {
      return await contract.methods.name().call();
    }
    ,
    async _symbol() {
      return await contract.methods.symbol().call();
    }
    ,
    async _tokenTotal() {
      const owner = await contract.methods.owner().call();
      return await contract.methods.balanceOf(owner).call();
    },
    async _tokens() {
      return await contract.methods.balanceOf(this.state.selectedAddress).call();
    },
    async _totalSupply() {
      return await contract.methods.totalSupply().call();
    },
    async _balanceContract(){
      return await contract.methods.getBalance().call();
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

.field {
  width: 80%;
  background-color: #ffc107;
  border-radius: 10px;
}

.p_tag {
  font-size: 20px;
  color: #000000;
}

.block_pay {
  background-color: #fd7e14;
  padding: 50px;
  border-radius: 10px;
  box-shadow: #2b3035 0 0 10px;
  color: white;
  font-size: 18px;
}
</style>



