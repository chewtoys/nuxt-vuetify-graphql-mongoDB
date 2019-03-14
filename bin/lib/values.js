exports.types = [
  { name: 'Espresso', price: '$5.00' },
  { name: 'Latte', price: '$4.50' }
]

exports.typesPlan = exports.types.map(function(o) {
  return o.name + ' (' + o.price + ')'
})

exports.sugar = [{ name: 'Low', spoons: '1' }, { name: 'Medium', spoons: '2' }]

exports.sugarPlan = exports.sugar.map(function(o) {
  return o.name + ' (' + o.spoons + ')'
})

exports.servedIn = ['Mug', 'Cup', 'Takeway package']

exports.typeFlavor = [
  { name: 'caramel', flavor: 'caramel' },
  { name: 'chocolate', flavor: 'chocolate' }
]

exports.flavorPlan = exports.typeFlavor.map(function(o) {
  return o.name + ' (' + o.flavor + ')'
})
