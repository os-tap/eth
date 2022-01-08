import { ADDRESS, ABI } from "./constants"
import Web3 from 'web3'

export class Contract {
    #web3; #contract; #account; #provider
    constructor(provider) {
        this.#provider = provider
        this.#web3 = new Web3(this.#provider)
        this.#contract = new this.#web3.eth.Contract(ABI, ADDRESS)
    }
    check_metamask() {
        return (typeof this.#provider !== 'undefined')
    }
    set_account(account) {
        this.#account = account
    }
    async init_metamask() {
        const accounts = await this.#provider.request({ method: 'eth_requestAccounts' })
        if (accounts.length) this.#account = accounts[0]
        return accounts.length > 0
    }
    async save(data) {
        console.log(this.#account)
        return await this.#contract.methods.store(data).send({from: this.#account})
    }
    async fetch() {
        return await this.#contract.methods.data(this.#account).call()
    }
}