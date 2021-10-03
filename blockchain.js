// IMPORTING SHA256 ALGORITHM 
const SHA256 = require("crypto-js/sha256");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const chalk = require('chalk');


class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey) {

        if(signingKey.getPublic('hex') !== this.fromAddress){
            return false;
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx , 'base64');
        this.signature = sig.toDER('hex');
        // console.log(this.signature);
        return true;
    }

    isValid() {
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0) {
            console.log(chalk.red("No signature in Transaction"));
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature)
    }
}

// CREATING BLOCK CLASS 
class Block {
    constructor(timestamp, transaction, previousHash = '') {
        this.timestamp = timestamp;
        this.transaction = transaction;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }
    //calculating hash of given block
    calculateHash() {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transaction)).toString();
    }

    //ye spammer blocks add hone se rokega
    mineBlock(dificulty) {
        while (this.hash.substring(0, dificulty) != Array(dificulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log(chalk.underline("Block Mined : " + this.hash));
    }

    hasValidTransaction() {
        for (const tx of this.transaction) {
            if (!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}


//CREATING BLOCKCHAIN

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.dificulty = 2;
        this.pendingTransation = [];
        this.miningRewards = 500;
    }

    //created blockchain by creating its first genesis block
    createGenesisBlock() {
        return new Block("05/09/2021", "Genesis Block", "0");
    }

    //getting lastest added block
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    //add new block
    // 1st method
    //// addBlock(newBlock) {
    ////     newBlock.previousHash = this.getLatestBlock().hash;
    ////     newBlock.mineBlock(this.dificulty);
    ////     this.chain.push(newBlock);
    //// }


    minePendingTransaction(miningRewardsAddress) {

        const rewardTx = new Transaction(null , miningRewardsAddress , this.miningRewards);
        this.pendingTransation.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransation);
        block.previousHash = this.getLatestBlock().hash;
        block.mineBlock(this.dificulty);

        console.log(chalk.underline("Block Succesfully Mined"));
        this.chain.push(block);

        this.pendingTransation = [];
    }

    addTransaction(transaction) {

        if (!transaction.fromAddress || !transaction.toAddress) {
            console.log(chalk.red("Transaction Must have From and Two address"));
        }


        if (!transaction.isValid()) {
            console.log(chalk.red("cannot add invalid transaction to chain"));
        }

        this.pendingTransation.push(transaction);
    }

    getBalanceAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transaction) {
                if (trans.fromAddress == address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress == address) {
                    balance += trans.amount;
                }
            }

        }
        return balance;
    }

    //validating blocks
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currBlock = this.chain[i];
            const prevBlock = this.chain[i - 1];

            if (!currBlock.hasValidTransaction()) {
                return false;
            }

            if (currBlock.hash !== currBlock.calculateHash()) {
                return false;
            }

            if (currBlock.previousHash != prevBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
