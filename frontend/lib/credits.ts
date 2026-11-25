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
  { object: 'Cardo', source: 'Tumbleweed on W Lone Mtn Rd.jpg', url: 'https://commons.wikimedia.org/wiki/File:Tumbleweed_on_W_Lone_Mtn_Rd.jpg', author: 'Noah Wulf', license: 'CC BY-SA 4.0' },
  { object: 'Mapa', source: 'Carte du Chili (par J.N. Bellin)', url: 'https://commons.wikimedia.org/wiki/File:Carte_du_Chili_-_(par_J.N._Bellin)_-_btv1b8596585g.jpg', author: 'Jacques-Nicolas Bellin', license: 'Dominio público' },
]

export const LETTER_SOURCES: Pick<Credit, 'source' | 'url'>[] = [
  { source: 'Revista Sucesos, 1909', url: 'https://commons.wikimedia.org/wiki/File:Portada_revista_Sucesos_1909.jpg' },
  { source: 'Revista Sucesos, 1916', url: 'https://commons.wikimedia.org/wiki/File:Revista_Sucesos-a%C3%B1o-1916.jpg' },
  { source: 'Revista Zig-Zag, 1913', url: 'https://commons.wikimedia.org/wiki/File:Revista_Zig-Zag_(1913).jpg' },
  { source: 'Revista El Peneca', url: 'https://commons.wikimedia.org/wiki/File:Revista_El_Peneca.jpg' },
  { source: 'Afiches de la WPA, 1937 y 1938', url: 'https://commons.wikimedia.org/wiki/File:See_America,_WPA_poster,_ca._1938.jpg' },
]
