import React from "react";
import { useEffect } from "react";

import logo from "./logo.svg";
import "./App.css";

import sendReward from "./services/sendReward";

function App() {
  useEffect(() => {
    // init tasks
  }, [])

  const onSpinWheel = e => {
    // Account address of player.
    const address = "";
    sendReward(address);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Spin the Wheel and Win Prizes</p>
        <label for="addrInput" class="form-label">Address</label>
        <input id="addrInput" type="text" placeholder="0x..." />
        <a
          href="#"
          className="App-link"
          onClick={onSpinWheel}
        >
          Spin
        </a>
      </header>
    </div>
  );
}

export default App;
