let Filters = {
  Scale( inmin=0, inmax=1, outmin=-1, outmax=1 ) {
    let inrange  = inmax - inmin,
        outrange = outmax - outmin,
        rangeRatio = outrange / inrange

    return input => outmin + input * rangeRatio
  },
}

export default Filters
