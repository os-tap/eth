export class Keygen {
    #key; #counter = new Uint8Array(16)

    is_valid() {
        return (this.#key instanceof window.CryptoKey)
    }
    
    async generate() {
        let counter = this.#counter
        this.#key = await window.crypto.subtle.generateKey(
            {
                name: "AES-CTR",
                counter,
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        )

    }

    async import(key_buf) {
        try {
            this.#key = await window.crypto.subtle.importKey(
                "raw",
                key_buf,
                "AES-CTR",
                true,
                ["encrypt", "decrypt"]
            )
        } catch (err) {
            return false
        }
        return true
    }

    async export() {
        return await crypto.subtle.exportKey("raw", this.#key)
    }

    async encryptMessage(message) {
        let counter = this.#counter
        return await window.crypto.subtle.encrypt(
            {
                name: "AES-CTR",
                counter,
                length: 64
            },
            this.#key,
            new TextEncoder().encode(message)
        )
    }
    async decryptMessage(ciphertext) {
        let counter = this.#counter
        let decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-CTR",
                counter,
                length: 64
            },
            this.#key,
            ciphertext
        )
        return new TextDecoder().decode(decrypted);
    }

}