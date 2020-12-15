function evalOutcome(seq,chos,pot_w,pot_l){
  var outcome = 0;
  const cola = seq.filter(function(cols){return cols === 1;}).length;
  const colb = seq.filter(function(cols){return cols === 2;}).length;
  // console.log(cola);
  // console.log(colb);
  if (cola > colb && chos === 1) {
    outcome = pot_w;
  } else if (cola > colb && chos === 2) {
    outcome = pot_l;
  } else if (cola < colb && chos === 1) {
    outcome = pot_l;
  } else if (cola < colb && chos === 2) {
    outcome = pot_w;
  } else {
    outcome = -999;
  }
  return outcome;
}
