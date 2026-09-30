/* Tarifa de la empresa (precios de ejemplo).
   partidas: '<tipo>.<id>': [básica, media, alta] €/ud · coste: coste interno ≈ 68 % del precio (ejemplo) */
window.CRM_TARIFA = {
  coste:0.68,
  plazos:{bano:'2-3 semanas', cocina:'3-4 semanas', pintura:'1 semana', integral:'8-10 semanas'},
  partidas:{
    'bano.demolicion':[16,16,16],
    'bano.residuos':[280,280,280],
    'bano.fontaneria':[950,1150,1400],
    'bano.electricidad':[420,520,680],
    'bano.solado':[38,55,85],
    'bano.alicatado':[34,48,75],
    'bano.ducha':[520,780,1250],
    'bano.sanitarios':[260,380,620],
    'bano.pintura_techo':[12,12,14],
    'bano.limpieza':[150,150,150],

    'cocina.desmontaje':[650,650,650],
    'cocina.residuos':[280,280,280],
    'cocina.fontaneria':[520,620,780],
    'cocina.electricidad':[680,820,990],
    'cocina.solado':[38,55,85],
    'cocina.muebles':[380,520,780],
    'cocina.encimera':[160,260,420],
    'cocina.electrodomesticos':[1800,2600,3900],
    'cocina.pintura':[9,9,11],
    'cocina.limpieza':[150,150,150],

    'pintura.proteccion':[180,180,180],
    'pintura.alisado':[9,10,12],
    'pintura.paredes':[7,9,12],
    'pintura.techos':[6,7.5,9],
    'pintura.limpieza':[120,120,120],

    'integral.demolicion':[45,45,45],
    'integral.residuos':[900,900,900],
    'integral.albanileria':[70,85,100],
    'integral.fontaneria':[55,65,80],
    'integral.electricidad':[60,75,95],
    'integral.solado':[38,55,85],
    'integral.bano':[5200,6900,9500],
    'integral.cocina':[7800,10500,15500],
    'integral.puertas':[280,420,650],
    'integral.pintura':[7,9,12],
    'integral.limpieza':[350,350,350]
  }
};
