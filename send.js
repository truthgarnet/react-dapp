//player
module.exports = function(callback) {

    web3.eth.getAccounts().then((accounts, error) => {
        web3.eth.sendTransaction({
            from: "0xb78706b4FcA5A8dc5aeeBE3d200a02A71E9db723",
            to: "0xBeF9Baece0b44f37ADbDC9923f787Ec91b336187",
            value:web3.utils.toWei("10", "ether")}, callback());
    });

}