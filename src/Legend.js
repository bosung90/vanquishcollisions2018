import React from 'react'

export default class Legend extends React.Component {
  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: 180 }}>
        <Dot color="green" label="Protected Lanes" />
        <Dot color="olive" label="Local Street" />
        <Dot color="yellow" label="Painted Lanes" />
        <Dot color="orange" label="Shared Lanes" />
        <Dot color="red" label="Non-Bike Lanes" />
      </div>
    )
  }
}

const Dot = ({ color, label }) => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
    >
      <div
        style={{
          margin: 10,
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: color,
        }}
      />
      <div>{label}</div>
    </div>
  )
}
