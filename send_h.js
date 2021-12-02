//house
module.exports = function(callback) {

    web3.eth.getAccounts().then((accounts, error) => {
        web3.eth.sendTransaction({from:accounts[0],
            to: "0x28965BB958e828DD543D1f62d8A2484983922535",
            value:web3.utils.toWei("10", "ether")}, callback());
    });

}