// The people behind [ÁNIMA], in the order the project came to be.
export const PEOPLE = {
  authors: ['Joaquín Stephens', 'Felipe Mandiola'],
  thesis: ['Felipe Mandiola', 'Vicente Pino', 'Manuel Larraín'],
  advisors: ['Tomás Folsch', 'Luis Valenzuela'],
}

export interface Credit {
  // Which object in the interface the photo became.
  object: string
  author: string
  year: string
  title: string
  // APA's bracketed description of the work.
  kind: 'Fotografía' | 'Mapa'
  url: string
  license: string
}

// Every object photo in the interface is cut from these Wikimedia Commons files and keeps its license.
// CC BY-SA asks for the author, the license and a link: they're listed at /creditos, cited in APA 7.
export const OBJECT_CREDITS: Credit[] = [
  { object: 'Vela', author: 'AndyTheMonster', year: '2012', title: 'Pillar candles 09', kind: 'Fotografía', url: 'https://commons.wikimedia.org/wiki/File:Pillar_candles_09.jpg', license: 'CC BY-SA 3.0' },
  { object: 'Animitas', author: 'LBM1948', year: '2013', title: 'Puerto Natales, animitas 3', kind: 'Fotografía', url: 'https://commons.wikimedia.org/wiki/File:Puerto_Natales,_animitas_3.jpg', license: 'CC BY-SA 4.0' },
  { object: 'Llave', author: 'noy-nac', year: '2017', title: 'Skeleton key (Yale & Towne)', kind: 'Fotografía', url: 'https://commons.wikimedia.org/wiki/File:Skeleton_key_(Yale_%26_Towne).png', license: 'CC BY-SA 4.0' },
  { object: 'Chinche', author: 'Bin im Garten', year: '2013', title: 'Pin for a pinboard 2013 PD', kind: 'Fotografía', url: 'https://commons.wikimedia.org/wiki/File:Pin_for_a_pinboard_2013_PD.jpg', license: 'CC BY-SA 3.0' },
  { object: 'Carta', author: 'MaNZ345', year: '2026', title: 'Envelope from Bright Angel', kind: 'Fotografía', url: 'https://commons.wikimedia.org/wiki/File:Envelope_from_Bright_Angel.jpg', license: 'CC BY-SA 4.0' },
  { object: 'Basurero', author: 'Rasbak', year: '2009', title: 'Vuilnisemmer', kind: 'Fotografía', url: 'https://commons.wikimedia.org/wiki/File:Vuilnisemmer.jpg', license: 'CC BY-SA 3.0' },
  { object: 'Mapa', author: 'Bellin, J.-N.', year: '1764', title: 'Carte du Chili', kind: 'Mapa', url: 'https://commons.wikimedia.org/wiki/File:Carte_du_Chili_-_(par_J.N._Bellin)_-_btv1b8596585g.jpg', license: 'Dominio público' },
]
