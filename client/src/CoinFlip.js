import React, { Component } from "react";
import "./App.css";
import "./css/style.css"
import { Row, Col, Divider, Card, Radio, Button } from "antd";
import ButtonGroup from "antd/lib/button/button-group";

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
                const r = await contract.methods.placeBet(this.state.checked).send(
                    {from:accounts[0], value:web3.utils.toWei(String(this.state.value), 'ether')}
                );
                console.log(r.transactionHash);
                this.setState({pending: false});
                 
            }catch(error) {
                console.log(error.message);
                this.setState({pending: false});
            }
        }

    }

    render() {

        let coin_h = "./images/coin-h.png";
        let coin_t = "./images/coin-t.png";
        let coin =
            <div>
                <img src={coin_h} id="Heads" onClick={this.handleClickCoin} className="img-coin" />
                <img src={coin_t} id="Tails" onClick={this.handleClickCoin} className="img-coin" />
            </div>

        return (

            //JSX
            <div className="CoinFlip">

                <Divider orientation="left"></Divider>
                <Row gutter={[16, 24]}>
                    <Col className="gutter-row" span={12}>
                        <Card title="1">
                            <div>
                                {coin}
                            </div>
                        </Card>
                    </Col>

                    <Col className="gutter-row" span={12}>
                        <Card title="2">
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
                                    Eth
                                </div>
                                <div>
                                    <ButtonGroup onChange={this.handleClickBet}>
                                        <Button type="primary" className="btn">
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
                        <Card title="4">
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
