
export const getGameImage = (gameName) => {
  const gradients = {
    'Liên Quân Mobile': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'PUBG Mobile': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'Free Fire': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'Mobile Legends': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'Genshin Impact': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'Valorant': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  };

  return gradients[gameName] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
};

export const getGameIcon = (gameName) => {
  const icons = {
    'Liên Quân Mobile': '⚔️',
    'PUBG Mobile': '🔫',
    'Free Fire': '💥',
    'Mobile Legends': '⚡',
    'Genshin Impact': '🌟',
    'Valorant': '🎯',
  };

  return icons[gameName] || '🎮';
};


export const getGameLogo = (gameName) => {
  const logos = {
    'Liên Quân Mobile': 'https://play-lh.googleusercontent.com/u-HxG-Q1fEpAL9w96iIEaBR0iQOY8yeqDuDvhUTr_J98nfOuAAa7S0B0nkAc0ROnnh555Qp2XYBqbN2FsvyN6p4=w240-h480-rw',
    'PUBG Mobile': 'https://play-lh.googleusercontent.com/E_bwpvmFEiRGW4G9VnTIpoJ4XM-3udz3Jm2cDBVsavyu4pT12x2hNLI1ucWoS2KaQIoA=w240-h480-rw',
    'Free Fire': 'https://play-lh.googleusercontent.com/fPV15zPzpECONm08K6BUS5EqD1A1Ir_hxsOaaJF7hOIK-BNDpFO-i3MAvUVM7952JJyGAhg1VJwzDKtYT2QB8Ns=w240-h480-rw',
    'Mobile Legends': 'https://img.utdstc.com/icon/78d/66f/78d66ff1ab1bd23f7fd6d9cdb93854881cb8f0b69e8a301faaf4f4eab058d19e:200',
    'Genshin Impact': 'https://play-lh.googleusercontent.com/YQqyKaXX-63krqsfIzUEJWUWLINxcb5tbS6QVySdxbS7eZV7YB2dUjUvX27xA0TIGtfxQ5v-tQjwlT5tTB-O',
    'Valorant': 'https://i.pinimg.com/736x/cf/ae/88/cfae886e263126f685510e2f45b82970.jpg',
  };

  return logos[gameName] || null;
};

