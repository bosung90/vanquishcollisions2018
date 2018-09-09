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

        <Dot color="white" label="" />
        <Dot color="white" label="" />

        <Dot color="#aaa" label="All Bike Routes" />
      </div>
    )
  }
}

const Dot = ({ size = 20, color, label }) => {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
    >
      <div
        style={{
          marginTop: 10,
          marginBottom: 10,
          marginLeft: 20 - size / 2,
          marginRight: 20 - size / 2,
          width: size,
          height: size,
          borderRadius: 10,
          backgroundColor: color,
        }}
      />
      <div>{label}</div>
    </div>
  )
}
