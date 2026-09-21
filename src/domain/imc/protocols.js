const PROTOCOLS = Object.freeze([
  { id: 'under5', minYears: 0, maxYears: 5 },
  { id: 'who2007', minYears: 5, maxYears: 20 },
  { id: 'adult', minYears: 20, maxYears: 60 },
  { id: 'olderAdult', minYears: 60, maxYears: Infinity },
]);

function identifyProtocol(age) {
  if (!age || !Number.isInteger(age.years) || age.years < 0) throw new RangeError('Idade inválida.');
  return PROTOCOLS.find(protocol => age.years >= protocol.minYears && age.years < protocol.maxYears).id;
}

module.exports = { PROTOCOLS, identifyProtocol };
