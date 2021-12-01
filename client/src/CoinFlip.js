import React, { Component } from "react";
import "./App.css";
import "./css/style.css"
import { Row, Col, Divider, Card, Radio, Button, Input } from "antd";
import ButtonGroup from "antd/lib/button/button-group";
import getWeb3 from "./getWeb3";
import CoinToFlip from './contracts/CoinToFlip.json';

class CoinFlip extends Component {


    state = {
        web3: null,
        accounts: null,
        contract: null,

        value: 0,
        checked: 0,
        houseBalance: 0,
        show: {flag: false, msg: ''},
        reveal: 0,
        reward: 0,
        pending: false
    };


    constructor(props) {
        super(props);

        this.handleClickCoin = this.handleClickCoin.bind(this);
    }

    //Coin Select
    handleClickCoin(e) {
        if (this.state.checked === 0) {
            if (e.target.id === 'Heads') {
                this.setState({ checked: 2 });
            } else if (e.target.id === 'Tails') {
                this.setState({ checked: 1 });
            }
        } else {
            this.setState({ checked: 0 });
        }
    }

    handleClickFlip = async() => {
        const {accounts, contract} = this.state;
        if(!this.state.web3) {
            console.log('App is not ready');
            return;
        }
        if(accounts[0] === undefined) {
            alert('Plz press F5 to connect Dapp');
            return;
        }
        this.setState({pending:true});

        try{
            await contract.methods.revealResult()
        }catch (error) {
            console.log(error.message);
            this.setState({pending: false});
        }
    }

    handleClickBet = async () => {
        const {web3, accounts, contract} = this.state;
        if(!this.state.web3) {
            console.log('App is not ready');
            return;
        }
        if(accounts[0] === undefined) {
            alert('Plz press F5 to connect Dapp');
            return;
        }

        if(this.state.value <= 0 || this.state.checked === 0) {
            this.setState({show: {flag: true, msg: 'You should bet bigger than 0.01Eth'}});
        } else {//reset
            this.setState({pending: true, show: {flag: false, msg: ''}, reveal: 0, reward: 0});
            try{
                if (!this.checkBetStatus()) {
                    const r = await contract.methods.placeBet(this.state.checked).send(
                        {from:accounts[0], value:web3.utils.toWei(String(this.state.value), 'ether')});

                    console.log(r.transactionHash);
                    this.saveBetStatus(r.transactionHash);
                    this.setState({pending: false});
                }

            }catch(error) {
                console.log(error.message);
                this.setState({pending: false});
            }
        }

    }

    saveBetStatus = (txHash) => {
        localStorage.setItem('txHash', txHash);
        this.getHouseBalance();
    }

    checkBetStatus = () => {
        let bBet = false;
        if(localStorage.getItem("txHash") !== "") {
            this.setState({pending: false});
            this.setState({show: {flag: true, msg: "You have already bet!"}});
            bBet = true;
        }
        return bBet;
    }

    handleClickReset = () => {
        this.setState({value: 0, checked: 0, reveal: 0, reward: 0});

        this.saveBetStatus("");
        this.inputEth.value = '';
    }

    handleValChange = (e) => {
        this.setState({value: parseFloat(e.target.value)});
    }

    handleRefund = async () => {
        const {accounts, contract} = this.state;

        if(!this.state.web3) {
            console.log('App is not ready');
            return;
        }
        if(accounts[0] === undefined) {
            alert('Plz press F5 to connect Dapp');
            return;
        }

        const r = await contract.methods.refundBet().send({from:accounts[0]});
        if(r.transactionHash !== "") {
            this.saveBetStatus("");
        }
    }

    getHouseBalance = () => {
        const {web3, contract} = this.state;

        web3.eth.getBalance(contract._address, (e, r) => {
           this.setState({houseBalance: web3.utils.fromWei(r, 'ether')});
        });
    };

    watchEvent = (event) => {
        const {web3} = this.state;
        const reveal = parseInt(event.returnValues.amount.toString(), 'ether');
        const reward = web3.utils.fromWei(event.returnValues.amount.toString(), 'ether');
        this.setState({reveal, reward});
    };

    async componentDidMount() {
        try {
            const web3 = await getWeb3();

            let accounts = await web3.eth.getAccounts();

            const networkId = await web3.eth.net.getId();
            const deployedNetwork = CoinToFlip.networks[networkId];
            const instance = new web3.eth.Contract(
                CoinToFlip.abi,
                deployedNetwork && deployedNetwork.address,
            );
            instance.events.Reveal()
                .on('message', (event) => this.watchEvent(event))
                .on('error', (error) => console.log(error))

            this.setState({web3, accounts, contract: instance}, this.getHouseBalance);
        } catch (error) {
            alert('Failed to load web3, accounts, or contract. Check console for details');
            console.log(error);
        }
    }

        render() {

        let coin_h = "./images/coin-h.png";
        let coin_t = "./images/coin-t.png";
        let houseBalance = "Balance: " + (this.state.houseBalance);

        return (

            //JSX
            <div className="CoinFlip">

                <Divider orientation="left"></Divider>
                <Row gutter={[16, 24]}>
                    <Col className="gutter-row" span={12}>
                        <Card title={houseBalance}>
                            <div>
                                <div>
                                    <img src={coin_h} id="Heads" onClick={this.handleClickCoin} className="img-coin" />
                                    <img src={coin_t} id="Tails" onClick={this.handleClickCoin} className="img-coin" />
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col className="gutter-row" span={12}>
                        <Card title="Coin Reveal">
                            <div>
                                <img src="./images/coin-unknown.png" className="img-coin" />
                            </div>
                        </Card>

                    </Col>
                    <Col className="gutter-row" span={12}>
                        <Card title="Your Bet">
                            <div>
                                <div>
                                    <Radio.Group onChange={this.handleClickCoin} defaultValue={this.state.checked} value={this.state.checked}>
                                        <Radio value={2}>Heads</Radio>
                                        <Radio value={1}>Tails</Radio>
                                    </Radio.Group>
                                </div>
                                <div>
                                    <Input placeholder="Ether" className="input" onChange={this.handleValChange}/>
                                </div>
                                <div>
                                    <ButtonGroup>
                                        <Button type="primary" className="btn" onClick={this.handleClickBet}>
                                            Bet
                                        </Button>
                                        <Button type="primary" className="btn">
                                            Flip!
                                        </Button>
                                        <Button type="primary" className="btn">
                                            Cancle
                                        </Button>
                                        <Button type="primary" className="btn">
                                            Reset
                                        </Button>
                                    </ButtonGroup>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <Card title="Transactions - latest 5 transactions">
                            <div>

                            </div>
                        </Card>
                    </Col>

                </Row>
            </div >


        )
    }
}

export default CoinFlip;
