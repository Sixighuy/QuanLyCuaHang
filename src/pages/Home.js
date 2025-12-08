import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

// Game logos - using reliable public CDN sources
const gameLogos = {
  'Liên Quân Mobile': 'https://play-lh.googleusercontent.com/u-HxG-Q1fEpAL9w96iIEaBR0iQOY8yeqDuDvhUTr_J98nfOuAAa7S0B0nkAc0ROnnh555Qp2XYBqbN2FsvyN6p4=w240-h480-rw',
  'PUBG Mobile': 'https://play-lh.googleusercontent.com/E_bwpvmFEiRGW4G9VnTIpoJ4XM-3udz3Jm2cDBVsavyu4pT12x2hNLI1ucWoS2KaQIoA=w240-h480-rw',
  'Free Fire': 'https://play-lh.googleusercontent.com/fPV15zPzpECONm08K6BUS5EqD1A1Ir_hxsOaaJF7hOIK-BNDpFO-i3MAvUVM7952JJyGAhg1VJwzDKtYT2QB8Ns=w240-h480-rw',
  'Mobile Legends': 'https://img.utdstc.com/icon/78d/66f/78d66ff1ab1bd23f7fd6d9cdb93854881cb8f0b69e8a301faaf4f4eab058d19e:200',
  'Genshin Impact': 'https://play-lh.googleusercontent.com/YQqyKaXX-63krqsfIzUEJWUWLINxcb5tbS6QVySdxbS7eZV7YB2dUjUvX27xA0TIGtfxQ5v-tQjwlT5tTB-O',
  'Valorant': 'https://i.pinimg.com/736x/cf/ae/88/cfae886e263126f685510e2f45b82970.jpg'
};

// Fallback icons if logo fails to load
const gameIcons = {
  'Liên Quân Mobile': '⚔️',
  'PUBG Mobile': '🔫',
  'Free Fire': '💥',
  'Mobile Legends': '⚡',
  'Genshin Impact': '🌟',
  'Valorant': '🎯'
};

const Home = () => {
  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Shop acc</h1>
          <p className="hero-subtitle">Nơi mua bán nick game uy tín, chất lượng</p>
          <p className="hero-description">
            Chúng tôi cung cấp các tài khoản game chính chủ với nhiều rank, skin hiếm và giá cả hợp lý.
            Đảm bảo an toàn, nhanh chóng và hỗ trợ 24/7.
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary btn-large">
              Xem sản phẩm
            </Link>
            <Link to="/register" className="btn btn-secondary btn-large">
              Đăng ký ngay
            </Link>
          </div>
          <div className="hero-contact">
            <p className="contact-label">Liên hệ với chúng tôi:</p>
            <div className="contact-links">
              <a href="mailto:huyonlwork279@gmail.com" className="contact-link contact-gmail">
                <svg className="contact-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.546l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                </svg>
                huyonlwork279@gmail.com
              </a>
              <a href="https://www.facebook.com/vu.gia.huy.995355?locale=vi_VN" target="_blank" rel="noopener noreferrer" className="contact-link contact-facebook">
                <svg className="contact-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Tại sao chọn chúng tôi?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>An toàn tuyệt đối</h3>
            <p>Tài khoản chính chủ, đảm bảo không bị khóa, không bị lấy lại</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Giao dịch nhanh chóng</h3>
            <p>Nhận tài khoản ngay sau khi thanh toán, hỗ trợ 24/7</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Giá cả hợp lý</h3>
            <p>Giá tốt nhất thị trường, nhiều ưu đãi cho khách hàng thân thiết</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎮</div>
            <h3>Đa dạng game</h3>
            <p>Nhiều loại game phổ biến: Liên Quân, PUBG, Free Fire, ML, Genshin Impact...</p>
          </div>
        </div>
      </div>

      <div className="games-section">
        <h2 className="section-title">Các game phổ biến</h2>
        <div className="games-grid">
          <div className="game-card">
            <div className="game-icon">
              <img 
                src={gameLogos['Liên Quân Mobile']} 
                alt="Liên Quân Mobile"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span style="font-size: 3rem;">${gameIcons['Liên Quân Mobile']}</span>`;
                }}
              />
            </div>
            <h3>Liên Quân Mobile</h3>
            <p>Rank từ Bạch Kim đến Thách Đấu</p>
          </div>
          <div className="game-card">
            <div className="game-icon">
              <img 
                src={gameLogos['PUBG Mobile']} 
                alt="PUBG Mobile"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span style="font-size: 3rem;">${gameIcons['PUBG Mobile']}</span>`;
                }}
              />
            </div>
            <h3>PUBG Mobile</h3>
            <p>Rank từ Diamond đến Conqueror</p>
          </div>
          <div className="game-card">
            <div className="game-icon">
              <img 
                src={gameLogos['Free Fire']} 
                alt="Free Fire"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span style="font-size: 3rem;">${gameIcons['Free Fire']}</span>`;
                }}
              />
            </div>
            <h3>Free Fire</h3>
            <p>Rank từ Vàng đến Huyền Thoại</p>
          </div>
          <div className="game-card">
            <div className="game-icon">
              <img 
                src={gameLogos['Mobile Legends']} 
                alt="Mobile Legends"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span style="font-size: 3rem;">${gameIcons['Mobile Legends']}</span>`;
                }}
              />
            </div>
            <h3>Mobile Legends</h3>
            <p>Rank từ Epic đến Mythic Glory</p>
          </div>
          <div className="game-card">
            <div className="game-icon">
              <img 
                src={gameLogos['Genshin Impact']} 
                alt="Genshin Impact"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span style="font-size: 3rem;">${gameIcons['Genshin Impact']}</span>`;
                }}
              />
            </div>
            <h3>Genshin Impact</h3>
            <p>AR từ 45 đến 55</p>
          </div>
          <div className="game-card">
            <div className="game-icon">
              <img 
                src={gameLogos['Valorant']} 
                alt="Valorant"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span style="font-size: 3rem;">${gameIcons['Valorant']}</span>`;
                }}
              />
            </div>
            <h3>Valorant</h3>
            <p>Rank từ Platinum đến Immortal</p>
          </div>
        </div>
        <div className="games-cta">
          <Link to="/products" className="btn btn-primary btn-large">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
