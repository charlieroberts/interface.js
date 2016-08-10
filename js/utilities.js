let Utilities = {

  getMode() {
    return 'ontouchstart' in document.documentElement ? 'touch' : 'mouse'
  },
  
  compareArrays( a1, a2 ) {
    return a1.length === a2.length && a1.every((v,i)=> v === a2[i])
  }

}

export default Utilities
