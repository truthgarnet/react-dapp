import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

class App extends Component {
    render() {
        return (

            //JSX
            <div className="App">
                <header>
                    <img src={logo} className="App-logo"/>
                    <h1>Hello, React</h1>
                </header>

            </div>


        )
    }
}

export default App;
