/* Datos de ejemplo de la demo. Todo es ficticio. */
window.CRM_DEMO = {
  leads:[
    {id:1,nombre:'Lucía Herrera',tel:'',pob:'Majadahonda',dir:'C/ Doctor Calero 14, 2ºB',tipo:'bano',origen:'Google Ads',fase:'nuevo',score:82,importe:9800,minSin:38,desc:'Quiere cambiar bañera por plato de ducha y alicatar entero.'},
    {id:2,nombre:'Javier Montes',tel:'',pob:'Las Rozas',dir:'Av. de Atenas 9',tipo:'cocina',origen:'Web',fase:'nuevo',score:64,importe:14500,minSin:12,desc:'Cocina abierta al salón, muebles y encimera.'},
    {id:3,nombre:'Carmen Ruiz',tel:'',pob:'Pozuelo',dir:'C/ Francia 3',tipo:'pintura',origen:'Instagram',fase:'contactado',score:48,importe:3200,desc:'Pintar piso de 80 m², techos incluidos.'},
    {id:4,nombre:'Alberto Sanz',tel:'',pob:'Boadilla',dir:'C/ Valle de Arán 22',tipo:'integral',origen:'Referido',fase:'visita_ag',score:91,importe:62000,visita:{d:0,h:'17:30',tec:'Rubén'},desc:'Reforma integral de piso heredado, 95 m².'},
    {id:5,nombre:'Nuria Blanco',tel:'',pob:'Majadahonda',dir:'C/ Santa Catalina 6',tipo:'bano',origen:'Habitissimo',fase:'visita_ag',score:70,importe:8900,visita:{d:1,h:'10:00',tec:'Rubén'},desc:'Baño pequeño, 4 m².'},
    {id:6,nombre:'Diego Pardo',tel:'',pob:'Collado Villalba',dir:'C/ Real 41',tipo:'cocina',origen:'Google Ads',fase:'visita_ok',score:76,importe:16800,desc:'Visita hecha: 4,2 ml de muebles, suelo 10 m².'},
    {id:7,nombre:'Elena Vidal',tel:'',pob:'Las Rozas',dir:'C/ Camilo José Cela 8',tipo:'bano',origen:'Web',fase:'pres_prep',score:73,importe:10400,entregaEn:1,desc:'Presupuesto comprometido para mañana.'},
    {id:8,nombre:'Pablo Ortega',tel:'',pob:'Pozuelo',dir:'Av. Europa 12',tipo:'integral',origen:'Google Ads',fase:'pres_env',score:80,importe:58000,enviadoHace:2,visto:true,desc:'Presupuesto PR-2026-0114 enviado. Lo ha abierto 3 veces.'},
    {id:9,nombre:'Rosa Iglesias',tel:'',pob:'Majadahonda',dir:'C/ Granadilla 5',tipo:'cocina',origen:'Referido',fase:'pres_env',score:69,importe:13200,enviadoHace:10,visto:true,desc:'Compara con otra empresa.'},
    {id:10,nombre:'Tomás León',tel:'',pob:'Boadilla',dir:'C/ Mirasierra 2',tipo:'bano',origen:'Instagram',fase:'negoc',score:77,importe:11300,desc:'Pide versión con calidad media en vez de alta.'},
    {id:11,nombre:'Irene Castro',tel:'',pob:'Las Rozas',dir:'C/ Real 7',tipo:'pintura',origen:'Web',fase:'aplazado',score:40,importe:2900,recontacto:18,desc:'Lo hará después de verano.'},
    {id:12,nombre:'Hugo Marín',tel:'',pob:'Pozuelo',dir:'C/ Sevilla 30',tipo:'cocina',origen:'Habitissimo',fase:'perdido',score:55,importe:12100,motivo:'Precio',desc:'Eligió otra empresa por precio.'},
  ],
  timeline:{
    1:[{t:'Hoy 09:12',x:'Lead entra desde Google Ads · aviso Telegram enviado'}],
    8:[{t:'Hace 2 días',x:'Presupuesto PR-2026-0114 enviado por WhatsApp',k:'wa'},{t:'Hace 2 días',x:'Presupuesto visto por el cliente',k:'ok'},{t:'Ayer',x:'Presupuesto visto de nuevo (3ª vez)',k:'ok'}],
    4:[{t:'Hace 3 días',x:'Referido por cliente de la obra O-0301'},{t:'Hace 2 días',x:'Visita agendada con Rubén',k:'ok'},{t:'Hace 2 días',x:'Confirmación de visita enviada',k:'wa'}]
  },
  obras:[
    {id:'O-0309',cliente:'Sara Gómez',tipo:'cocina',pob:'Majadahonda',avance:65,presupuesto:15800,matPres:6200,matReal:6750,horas:142,costeHora:24,subc:1200,hitos:[{n:'Señal',imp:4740,cob:true},{n:'Mitad',imp:6320,cob:true},{n:'Entrega',imp:4740,cob:false}],fin:12},
    {id:'O-0310',cliente:'Luis Fernández',tipo:'bano',pob:'Las Rozas',avance:30,presupuesto:9600,matPres:3400,matReal:3290,horas:48,costeHora:24,subc:0,hitos:[{n:'Señal',imp:2880,cob:true},{n:'Mitad',imp:3840,cob:false},{n:'Entrega',imp:2880,cob:false}],fin:21},
    {id:'O-0311',cliente:'Comunidad C/ Sol 4',tipo:'pintura',pob:'Pozuelo',avance:90,presupuesto:7400,matPres:1500,matReal:1720,horas:120,costeHora:22,subc:0,hitos:[{n:'Señal',imp:2220,cob:true},{n:'Mitad',imp:2960,cob:true},{n:'Entrega',imp:2220,cob:false}],fin:3}
  ],
  facturas:[
    {num:'F-2026-041',obra:'O-0309',cliente:'Sara Gómez',imp:6320,emit:-20,vence:-5,estado:'pendiente',archivo:'F-2026-041.pdf'},
    {num:'F-2026-044',obra:'O-0310',cliente:'Luis Fernández',imp:2880,emit:-12,vence:3,estado:'cobrada',archivo:'F-2026-044.pdf'},
    {num:'F-2026-046',obra:'O-0311',cliente:'Comunidad C/ Sol 4',imp:2960,emit:-6,vence:9,estado:'pendiente',archivo:'F-2026-046.pdf'},
    {num:'F-2026-038',obra:'O-0305',cliente:'Andrés Molina',imp:11900,emit:-34,vence:-19,estado:'cobrada',archivo:'F-2026-038.pdf'}
  ],
  contratos:[{cliente:'Comunidad C/ Sol 4',servicio:'Mantenimiento zonas comunes',cuota:90},{cliente:'Comunidad Av. Europa 20',servicio:'Mantenimiento zonas comunes',cuota:90},{cliente:'Óptica Visión (local)',servicio:'Mantenimiento del local',cuota:60}],
  canales:[
    {c:'Google Ads',inv:600,leads:18,ventas:3,margen:9400},
    {c:'Habitissimo',inv:250,leads:9,ventas:1,margen:2100},
    {c:'Instagram',inv:150,leads:6,ventas:1,margen:1900},
    {c:'Web y Google Business',inv:0,leads:11,ventas:2,margen:5200},
    {c:'Referidos',inv:0,leads:4,ventas:2,margen:6300}
  ],
  done:new Set(), pres:[], nextPR:115, nextObra:312
};
