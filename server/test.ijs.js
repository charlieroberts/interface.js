var p = Interface.Panel.create(),
    s = Interface.MultiButton.create({
      width:1, height:1, count:64, background:'black', columns:8, rows:8, style:'hold',
      target:'osc', address:'/buttons'
    })

p.add( s )
