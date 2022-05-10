const crypto = require("crypto");

class Transaction {
  constructor(amount, senderPublicKey, recieverPublicKey) {
    this.amount = amount;
    this.senderPublicKey = senderPublicKey;
    this.recieverPublicKey = recieverPublicKey;
  }

  // converting the data into hash
  toString() {
    return JSON.stringify(this);
  }
}

class Block {
  constructor(previousHash, transaction, timestamp = Date.now()) {
    this.previousHash = previousHash;
    this.transaction = transaction;
    this.timestamp = timestamp;
  }

  getHash() {
    const json = JSON.stringify(this);
    const hash = crypto.createHash("SHA256");
    hash.update(json).end();
    const hex = hash.digest("hex");
    return hex;
  }

  toString() {
    return JSON.stringify(this);
  }
}

class Chain {
  static instance = new Chain();

  constructor() {
    this.chain = [new Block("", new Transaction(100, "temp", "temp"))];
  }

  getPreviousBlockHash() {
    return this.chain[this.chain.length - 1].getHash();
  }

  insertBlock(transaction, senderPublicKey, sig) {
    const verify = crypto.createVerify("SHA256");

    verify.update(transaction.toString());

    const isValid = verify.verify(senderPublicKey, sig);

    if (isValid) {
      const block = new Block(this.getPreviousBlockHash(), transaction);
      console.log("Block added", block.toString());
      this.chain.push(block);
    }
  }
}

class Wallet {
  constructor() {
    const keys = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    this.privateKey = keys.privateKey;
    this.publicKey = keys.publicKey;
  }

  send(amount, recieverPublicKey) {
    const transaction = new Transaction(
      amount,
      this.publicKey,
      recieverPublicKey
    );

    const shaSign = crypto.createSign("SHA256");
    shaSign.update(transaction.toString()).end();

    const signature = shaSign.sign(this.privateKey);
    Chain.instance.insertBlock(transaction, this.publicKey, signature);
  }
}

const harsh = new Wallet();
const rahul = new Wallet();
const john = new Wallet();

harsh.send(150, rahul.publicKey);
rahul.send(400, john.publicKey);
john.send(28, rahul.publicKey);

console.log(Chain.instance);
