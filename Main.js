const { Blockchain, Transaction } = require("./blockchain.js");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const chalk = require('chalk');

const myKey = ec.keyFromPrivate('e73536eb5e91aeb637d7493a6affa5f2433ea6c080455d4dc5921a5d1cdbebcb');
const myWalletAddress = myKey.getPublic('hex');

let amritCoin = new Blockchain();


const tx1 = new Transaction(myWalletAddress, 'someonelse', 100);
const trans = tx1.signTransaction(myKey);
if (trans === false) {
    console.log(chalk.red("You cannot Sign Transaction for other Wallets!"));
} else {
    amritCoin.addTransaction(tx1);
    console.log(chalk.cyan("Starting Mining........"));
    amritCoin.minePendingTransaction(myWalletAddress);

    console.log("Balance : " + chalk.blue(amritCoin.getBalanceAddress(myWalletAddress)));

    // amritCoin.chain[1].transaction[0].amount = 1;

    console.log(chalk.bgYellowBright("is Block valid? " + amritCoin.isChainValid()));
}










