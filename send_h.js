//house
module.exports = function(callback) {

    web3.eth.getAccounts().then((accounts, error) => {
        web3.eth.sendTransaction({from:accounts[0],
            to: "0xc03e5Cc59Eae2F4961f6b18238214737241aa04a",
            value:web3.utils.toWei("10", "ether")}, callback());
    });

}