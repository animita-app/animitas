export interface Credit {
  object: string
  source: string
  url: string
  author: string
  license: string
}

// Every object photo in the interface is cut from these Wikimedia Commons files and keeps its license.
// CC BY-SA asks for the author, the license and a link, visible to whoever sees the image: /creditos.
export const OBJECT_CREDITS: Credit[] = [
  { object: 'Vela', source: 'Einzelnes Opferlicht.JPG', url: 'https://commons.wikimedia.org/wiki/File:Einzelnes_Opferlicht.JPG', author: '3268zauber', license: 'CC BY-SA 3.0' },
  { object: 'Animitas', source: 'Puerto Natales, animitas 3.jpg', url: 'https://commons.wikimedia.org/wiki/File:Puerto_Natales,_animitas_3.jpg', author: 'LBM1948', license: 'CC BY-SA 4.0' },
  { object: 'Llave', source: 'Skeleton key (Yale & Towne).png', url: 'https://commons.wikimedia.org/wiki/File:Skeleton_key_(Yale_%26_Towne).png', author: 'noy-nac', license: 'CC BY-SA 4.0' },
  { object: 'Chinche', source: 'Pin for a pinboard 2013 PD.jpg', url: 'https://commons.wikimedia.org/wiki/File:Pin_for_a_pinboard_2013_PD.jpg', author: 'Bin im Garten', license: 'CC BY-SA 3.0' },
  { object: 'Mapa', source: 'Carte du Chili (par J.N. Bellin)', url: 'https://commons.wikimedia.org/wiki/File:Carte_du_Chili_-_(par_J.N._Bellin)_-_btv1b8596585g.jpg', author: 'Jacques-Nicolas Bellin', license: 'Dominio público' },
]

