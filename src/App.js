import React, { Component } from 'react'
import './App.css'
import Map from './Map'

class App extends Component {
  render() {
    return (
      <div
        className="App"
        style={{
          height: '100vh',
        }}
      >
        <header className="App-header">
          <h1 className="App-title">Bicycle SafeSense</h1>
        </header>
        <Map />
      </div>
    )
  }
}

export default App
