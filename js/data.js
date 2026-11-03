"use strict";
/* ---------- Data ---------- */
const MOODS = [
  {id:"relax",   name:"Relax",    hint:"Slow down between classes",         color:"var(--relax)",   head:"Need to relax? Try these places.",              sub:"Quiet gardens, warm water and long views."},
  {id:"nature",  name:"Nature",   hint:"Trees, rivers and fresh air",       color:"var(--nature)",  head:"Want some nature? Try these places.",           sub:"Green space that is easy to reach on the metro."},
  {id:"social",  name:"Social",   hint:"Good company, good food",           color:"var(--social)",  head:"Feeling social? Try these places.",             sub:"Squares, markets and tables made for groups."},
  {id:"romantic",name:"Romantic", hint:"Sunsets, views and sweet things",   color:"var(--romantic)",head:"Feeling romantic? Try these places.",           sub:"Golden-hour spots for two."},
  {id:"hidden",  name:"Hidden",   hint:"Places most visitors skip",         color:"var(--hidden)",  head:"Want something hidden? Try these places.",      sub:"Quieter corners of the city."},
  {id:"free",    name:"Free",     hint:"Costs nothing",                     color:"var(--free)",    head:"Want it free? These places cost nothing.",      sub:"Every place here has a price of zero."}
];
const MOOD = Object.fromEntries(MOODS.map(m => [m.id, m]));

const PLACES = [
  {id:"palacio-de-cristal", name:"Palacio de Cristal", moods:["relax"], area:"Retiro", price:0, priceLabel:"Free",
   desc:"A glass-and-iron pavilion beside a small pond inside Retiro Park. Bring a book and let an hour disappear.",
   tip:"Go on a weekday morning, when it is quietest.", q:"Palacio de Cristal Parque del Retiro Madrid", popular:false},
  {id:"jardines-de-sabatini", name:"Sabatini Gardens", moods:["relax"], area:"Palacio Real", price:0, priceLabel:"Free",
   desc:"Neat hedges, fountains and statues right beside the Royal Palace, with a calm that feels far from the centre.",
   tip:"Mornings are the most peaceful.", q:"Jardines de Sabatini Madrid", popular:false},
  {id:"templo-de-debod", name:"Templo de Debod", moods:["relax","romantic"], area:"Moncloa", price:0, priceLabel:"Free",
   desc:"An ancient Egyptian temple rebuilt in a Madrid park, with a wide pool and one of the best sunset views in the city.",
   tip:"Arrive about 30 minutes before sunset to get a good spot.", q:"Templo de Debod Madrid", popular:true},
  {id:"hammam-al-andalus", name:"Hammam Al Ándalus", moods:["relax"], area:"Centro", price:35, priceLabel:"About €35 and up",
   desc:"Warm pools, steam and candlelight in a modern take on an Arab bath. A proper treat after exam week.",
   tip:"Book ahead, especially at weekends.", q:"Hammam Al Ándalus Madrid", popular:false},

  {id:"casa-de-campo", name:"Casa de Campo", moods:["nature"], area:"West Madrid", price:0, priceLabel:"Free",
   desc:"Madrid’s biggest park, far larger than Retiro. Rent a bike, walk the trails or head for the lake.",
   tip:"Take the metro to Lago or Batán and plan a full afternoon.", q:"Casa de Campo Madrid", popular:false},
  {id:"madrid-rio", name:"Madrid Río", moods:["nature"], area:"Manzanares river", price:0, priceLabel:"Free",
   desc:"A long riverside park with cycle paths, bridges, playgrounds and shade, built where a motorway used to run.",
   tip:"Walk from Puente de Segovia towards Matadero.", q:"Madrid Río Madrid", popular:false},
  {id:"real-jardin-botanico", name:"Real Jardín Botánico", moods:["nature","relax"], area:"Retiro", price:6, priceLabel:"About €6",
   desc:"An 18th-century botanical garden tucked beside the Prado. Tidy terraces, greenhouses and plenty of benches.",
   tip:"Best in spring and early autumn.", q:"Real Jardín Botánico Madrid", popular:false},
  {id:"rosaleda-parque-del-oeste", name:"La Rosaleda", moods:["nature"], area:"Parque del Oeste", price:0, priceLabel:"Free",
   desc:"A rose garden inside Parque del Oeste, with paths that run down towards the Templo de Debod.",
   tip:"The roses are at their best around May and June.", q:"La Rosaleda Parque del Oeste Madrid", popular:false},

  {id:"plaza-del-dos-de-mayo", name:"Plaza del Dos de Mayo", moods:["social"], area:"Malasaña", price:0, priceLabel:"Free",
   desc:"A small square where students and neighbours gather on warm evenings, with bars and terraces all around.",
   tip:"Bring a drink from a nearby shop and sit with friends.", q:"Plaza del Dos de Mayo Madrid", popular:false},
  {id:"el-rastro", name:"El Rastro", moods:["social"], area:"La Latina", price:0, priceLabel:"Free",
   desc:"Madrid’s big open-air flea market. Browse vintage finds, then settle into a nearby bar for tapas.",
   tip:"It runs on Sundays and public holidays. Go early, before the crowds.", q:"El Rastro Madrid", popular:true},
  {id:"mercado-de-san-anton", name:"Mercado de San Antón", moods:["social"], area:"Chueca", price:10, priceLabel:"About €10",
   desc:"A food market with stalls to graze across and a terrace on the top floor. Good for sharing plates.",
   tip:"Order a few small plates between you rather than one big meal.", q:"Mercado de San Antón Madrid", popular:false},
  {id:"lavapies-argumosa", name:"Calle de Argumosa", moods:["social"], area:"Lavapiés", price:8, priceLabel:"About €8",
   desc:"A street of terraces in one of the city’s most mixed neighbourhoods. Cheap drinks and food from many places.",
   tip:"Walk the surrounding streets too; the food is varied.", q:"Calle de Argumosa Madrid", popular:false},

  {id:"faro-de-moncloa", name:"Faro de Moncloa", moods:["romantic"], area:"Moncloa", price:4, priceLabel:"About €4",
   desc:"A viewing tower with a 360-degree look over the rooftops towards the sierra.",
   tip:"Check that it is open before you set out.", q:"Faro de Moncloa Madrid", popular:false},
  {id:"circulo-de-bellas-artes", name:"Círculo de Bellas Artes rooftop", moods:["romantic"], area:"Centro", price:5, priceLabel:"About €5",
   desc:"A roof terrace with a view down Alcalá and across the skyline, best at golden hour.",
   tip:"Go just before sunset and stay for the lights.", q:"Círculo de Bellas Artes azotea Madrid", popular:false},
  {id:"chocolateria-san-gines", name:"Chocolatería San Ginés", moods:["romantic","social"], area:"Sol", price:7, priceLabel:"About €7",
   desc:"Churros and thick hot chocolate in an old Madrid institution that stays open late.",
   tip:"Late evening is a classic time to go.", q:"Chocolatería San Ginés Madrid", popular:false},
  {id:"estanque-del-retiro", name:"Rowing boats at Retiro Pond", moods:["romantic","relax"], area:"Retiro", price:8, priceLabel:"About €8",
   desc:"Hire a small rowing boat on the big pond in front of the Alfonso XII monument and drift for a while.",
   tip:"Go in the late afternoon; boats are busiest at weekends.", q:"Estanque Grande del Retiro Madrid", popular:false},

  {id:"el-capricho", name:"Parque El Capricho", moods:["hidden","nature"], area:"Alameda de Osuna", price:0, priceLabel:"Free",
   desc:"A romantic 18th-century garden with a maze, a lake and little follies, far from the usual tourist route.",
   tip:"It has limited opening days, so check before you travel.", q:"Parque de El Capricho Madrid", popular:false},
  {id:"parque-de-las-siete-tetas", name:"Cerro del Tío Pío", moods:["hidden","romantic"], area:"Vallecas", price:0, priceLabel:"Free",
   desc:"A hilly park known to locals as Siete Tetas, with wide views over the city at sunset.",
   tip:"Bring a layer; the hilltop can be breezy.", q:"Parque Cerro del Tío Pío Madrid", popular:true},
  {id:"museo-sorolla", name:"Museo Sorolla", moods:["hidden"], area:"Chamberí", price:3, priceLabel:"About €3",
   desc:"The painter’s former home, kept almost as he left it, with a leafy garden at the back.",
   tip:"There are free-entry slots at some times, so check the website.", q:"Museo Sorolla Madrid", popular:false},
  {id:"cuesta-de-moyano", name:"Cuesta de Moyano", moods:["hidden"], area:"Atocha", price:0, priceLabel:"Free",
   desc:"A slope of second-hand book stalls beside Retiro. Good for old novels, maps and cheap Spanish practice.",
   tip:"Combine it with a walk in the park next door.", q:"Cuesta de Moyano Madrid", popular:false},

  {id:"museo-del-prado-gratis", name:"Museo del Prado, free hours", moods:["free"], area:"Paseo del Prado", price:0, priceLabel:"Free in free-entry hours",
   desc:"One of the world’s great art museums, free during set evening hours. Pick two or three rooms rather than everything.",
   tip:"Check the current free-entry times and queue early.", q:"Museo del Prado Madrid", popular:false},
  {id:"museo-reina-sofia-gratis", name:"Museo Reina Sofía, free hours", moods:["free"], area:"Atocha", price:0, priceLabel:"Free in free-entry hours",
   desc:"Home to Picasso’s Guernica and a big modern art collection, with free-entry slots in the evening.",
   tip:"It is closed on Tuesdays; check the current hours.", q:"Museo Reina Sofía Madrid", popular:false},
  {id:"matadero-madrid", name:"Matadero Madrid", moods:["free"], area:"Arganzuela", price:0, priceLabel:"Free",
   desc:"A former slaughterhouse turned arts centre, with exhibitions, performances and a lively courtyard.",
   tip:"Check the programme; many shows are free.", q:"Matadero Madrid", popular:false},
  {id:"plaza-mayor", name:"Plaza Mayor and the old town", moods:["free"], area:"Madrid de los Austrias", price:0, priceLabel:"Free",
   desc:"Start at the arcaded Plaza Mayor and wander the old streets around it. A free first-day walk.",
   tip:"Walk on from the square to Plaza de la Villa.", q:"Plaza Mayor Madrid", popular:false}
];
const BY_ID = Object.fromEntries(PLACES.map(p => [p.id, p]));


/* Photos from Wikimedia Commons. Each entry records the photographer, licence and source page. */
const PHOTOS = {
 "palacio-de-cristal": {
  "file": "images/palacio-de-cristal.jpg",
  "alt": "Glass palace reflected in the pond in Retiro Park, with autumn trees",
  "artist": "Carlos Delgado",
  "license": "CC BY-SA 3.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
  "source": "https://commons.wikimedia.org/wiki/File:Palacio_de_Cristal_-_02.jpg"
 },
 "jardines-de-sabatini": {
  "file": "images/jardines-de-sabatini.jpg",
  "alt": "Clipped hedges and a long pool in the Sabatini Gardens, with the Royal Palace behind",
  "artist": "Javier Perez Montes",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
  "source": "https://commons.wikimedia.org/wiki/File:Estanque_Central_-_Jardines_de_Sabatini_-_Madrid_01.jpg"
 },
 "templo-de-debod": {
  "file": "images/templo-de-debod.jpg",
  "alt": "Templo de Debod lit up against a pink and purple sunset",
  "artist": "Diego Delso",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
  "source": "https://commons.wikimedia.org/wiki/File:Templo_de_Debod,_Madrid,_Espa%C3%B1a,_2023-01-03,_DD_89-91_HDR.jpg"
 },
 "casa-de-campo": {
  "file": "images/casa-de-campo.jpg",
  "alt": "Lake in Casa de Campo with a bicycle under trees and the Madrid skyline in the distance",
  "artist": "siestecita",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
  "source": "https://commons.wikimedia.org/wiki/File:Vista_parcial_del_Lago_de_la_Casa_de_Campo,_Madrid,_Espa%C3%B1a.jpg"
 },
 "madrid-rio": {
  "file": "images/madrid-rio.jpg",
  "alt": "The Manzanares river and a footbridge running through Madrid Río",
  "artist": "DXR",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
  "source": "https://commons.wikimedia.org/wiki/File:View_of_Madrid_and_R%C3%ADo_Manzanares_from_T%C3%A9leferico_20111029_1.jpg"
 },
 "real-jardin-botanico": {
  "file": "images/real-jardin-botanico.jpg",
  "alt": "A palm tree and reflecting pool in front of a greenhouse at the Real Jardín Botánico",
  "artist": "Richie Diesterheft",
  "license": "CC BY 2.0",
  "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
  "source": "https://commons.wikimedia.org/wiki/File:Real_Jard%C3%ADn_Bot%C3%A1nico_(Madrid)_07.jpg"
 },
 "rosaleda-parque-del-oeste": {
  "file": "images/rosaleda-parque-del-oeste.jpg",
  "alt": "Beds of pink and red roses in La Rosaleda with pine trees behind",
  "artist": "Javier Perez Montes",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
  "source": "https://commons.wikimedia.org/wiki/File:Rosaleda_del_Parque_del_Oeste_-_Madrid_04.jpg"
 },
 "plaza-del-dos-de-mayo": {
  "file": "images/plaza-del-dos-de-mayo.jpg",
  "alt": "The arch and statue in Plaza del Dos de Mayo, with apartment buildings around the square",
  "artist": "Nicolas Vigier",
  "license": "CC0",
  "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  "source": "https://commons.wikimedia.org/wiki/File:Plaza_del_Dos_de_Mayo,_Madrid.jpg"
 },
 "el-rastro": {
  "file": "images/el-rastro.jpg",
  "alt": "Crowds browsing clothing stalls at El Rastro market under trees",
  "artist": "Nicolas Vigier",
  "license": "CC0",
  "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  "source": "https://commons.wikimedia.org/wiki/File:El_Rastro_de_Madrid_52.jpg"
 },
 "mercado-de-san-anton": {
  "file": "images/mercado-de-san-anton.jpg",
  "alt": "The corner entrance of Mercado de San Antón at dusk, with people outside",
  "artist": "Earlyspatz",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
  "source": "https://commons.wikimedia.org/wiki/File:Mercado_de_San_Anton_during_World_Pride.jpg"
 },
 "lavapies-argumosa": {
  "file": "images/lavapies-argumosa.jpg",
  "alt": "A street in Lavapiés lined with apartment buildings and parked bicycles",
  "artist": "Asqueladd",
  "license": "CC BY-SA 3.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
  "source": "https://commons.wikimedia.org/wiki/File:Calle_de_Argumosa.JPG"
 },
 "faro-de-moncloa": {
  "file": "images/faro-de-moncloa.jpg",
  "alt": "The round viewing platform at the top of the Faro de Moncloa tower",
  "artist": "Carlos Delgado",
  "license": "CC BY-SA 3.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
  "source": "https://commons.wikimedia.org/wiki/File:Faro_de_la_Moncloa_-_04.jpg"
 },
 "circulo-de-bellas-artes": {
  "file": "images/circulo-de-bellas-artes.jpg",
  "alt": "The tower of the Círculo de Bellas Artes building against a cloudy sky",
  "artist": "jacinta lluch valero",
  "license": "CC BY-SA 2.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
  "source": "https://commons.wikimedia.org/wiki/File:Estatua_de_Atenea_-_C%C3%ADrculo_de_Bellas_Artes_(Madrid).jpg"
 },
 "chocolateria-san-gines": {
  "file": "images/chocolateria-san-gines.jpg",
  "alt": "A plate of churros and a cup of thick hot chocolate on a marble table",
  "artist": "WeI-chieh Chiu",
  "license": "CC BY-SA 2.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
  "source": "https://commons.wikimedia.org/wiki/File:Chocolater%C3%ADa_San_Gin%C3%A9s_(10512648395).jpg"
 },
 "estanque-del-retiro": {
  "file": "images/estanque-del-retiro.jpg",
  "alt": "Rowing boats on the Retiro pond in front of the Alfonso XII monument",
  "artist": "Carlos Delgado",
  "license": "CC BY-SA 3.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
  "source": "https://commons.wikimedia.org/wiki/File:Monumento_a_Alfonso_XII_de_Espa%C3%B1a_en_los_Jardines_del_Retiro_-_04.jpg"
 },
 "el-capricho": {
  "file": "images/el-capricho.jpg",
  "alt": "An iron footbridge arching over water in Parque El Capricho",
  "artist": "Xauxa Håkan Svensson",
  "license": "CC BY-SA 3.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
  "source": "https://commons.wikimedia.org/wiki/File:Jardin_El_Capricho-Iron_bridge.jpg"
 },
 "parque-de-las-siete-tetas": {
  "file": "images/parque-de-las-siete-tetas.jpg",
  "alt": "Snowy hills at Cerro del Tío Pío at sunset, with the city behind",
  "artist": "Nicolas Vigier",
  "license": "CC0",
  "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  "source": "https://commons.wikimedia.org/wiki/File:Parque_de_las_Siete_Tetas_(Cerro_del_T%C3%ADo_P%C3%ADo,_Madrid)_2021-01-12_-_51005907912.jpg"
 },
 "cuesta-de-moyano": {
  "file": "images/cuesta-de-moyano.jpg",
  "alt": "A blue second-hand book stall on the Cuesta de Moyano, with trees overhead",
  "artist": "Emilio J. Rodríguez Posada",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
  "source": "https://commons.wikimedia.org/wiki/File:Feria_de_Libros_Cuesta_de_Moyano_en_abril_de_2023_04.jpg"
 },
 "museo-del-prado-gratis": {
  "file": "images/museo-del-prado-gratis.jpg",
  "alt": "The columned front of the Museo del Prado with a lawn and trimmed bushes",
  "artist": "Oilisab",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
  "source": "https://commons.wikimedia.org/wiki/File:Museo_del_Prado_00_Fachada_1a.jpg"
 },
 "museo-reina-sofia-gratis": {
  "file": "images/museo-reina-sofia-gratis.jpg",
  "alt": "The red and glass atrium of the Museo Reina Sofía",
  "artist": "Zarateman",
  "license": "CC0",
  "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
  "source": "https://commons.wikimedia.org/wiki/File:Madrid_-_Edificio_Nouvel,_Museo_Nacional_Centro_de_Arte_Reina_Sof%C3%ADa_(MNCARS)_06.jpg"
 },
 "matadero-madrid": {
  "file": "images/matadero-madrid.jpg",
  "alt": "The brick buildings of Matadero Madrid seen from above with a footbridge in front",
  "artist": "Malopez 21",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
  "source": "https://commons.wikimedia.org/wiki/File:Matadero_y_puente_de_Matadero,_Arganzuela,_vista_desde_Madrid_R%C3%ADo_2.jpg"
 },
 "plaza-mayor": {
  "file": "images/plaza-mayor.jpg",
  "alt": "The red arcaded buildings of Plaza Mayor with the statue of Philip III",
  "artist": "Carlos Delgado",
  "license": "CC BY-SA 3.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
  "source": "https://commons.wikimedia.org/wiki/File:Plaza_Mayor_de_Madrid_-_01.jpg"
 },
 "museo-sorolla": {
  "file": "images/museo-sorolla.jpg",
  "alt": "The leafy garden of the Museo Sorolla, with a small pond and flowering plants",
  "artist": "Javier Rodríguez Barrera",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
  "source": "https://commons.wikimedia.org/wiki/File:Museo_Sorolla_-_Jard%C3%ADn_01.jpg"
 },
 "hammam-al-andalus": {
  "file": "images/hammam-al-andalus.jpg",
  "alt": "A candlelit pool inside an Arab-style bath with carved arches and tiled walls",
  "artist": "Diego Delso",
  "license": "CC BY-SA 4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
  "source": "https://commons.wikimedia.org/wiki/File:Ba%C3%B1os_%C3%A1rabes_Hammam_al_%C3%81ndalus,_M%C3%A1laga,_Espa%C3%B1a,_2023-05-20,_DD_134.jpg",
  "note": "Photo shows the Hammam Al Ándalus baths in Málaga; the Madrid baths use the same style."
 }
};
