import React from 'react';
import { FaFacebook, FaInstagram, FaPinterest, FaWhatsapp, FaPhone, FaEnvelope } from 'react-icons/fa';

const AboutPage = () => {
  const iconSize = '2rem'; // Consistent icon size
  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // Center items in the link
    textDecoration: 'none',
    color: '#333', // Dark grey for text
    fontSize: '1.1rem',
    margin: '0.8rem 0', // Vertical margin for spacing
    padding: '0.5rem',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };

  const iconStyle = {
    marginRight: '10px', // Space between icon and text
  };

  const sectionStyle = {
    maxWidth: '600px',
    margin: '0 auto', // Center the content block
    padding: '1rem',
    textAlign: 'left', // Align text to the left within the centered block
  };


  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#222' }}>About Me</h1>
      </header>

      <main>
        <section style={{ ...sectionStyle, textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#444' }}>Developer Bio</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#555' }}>
            Developer bio placeholder. This is where a brief description of the developer,
            their skills, and passion for creating amazing web experiences will go.
            Stay tuned for more updates!
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: '#444', textAlign: 'center' }}>Connect with Me</h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <a href="https://facebook.com/yourprofile" target="_blank" rel="noopener noreferrer" style={linkStyle}
               onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; e.currentTarget.style.color = '#007bff';}}
               onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#333';}}>
              <FaFacebook size={iconSize} style={{...iconStyle, color: '#3b5998'} } /> Facebook
            </a>
            <a href="https://instagram.com/yourprofile" target="_blank" rel="noopener noreferrer" style={linkStyle}
               onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; e.currentTarget.style.color = '#C13584';}}
               onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#333';}}>
              <FaInstagram size={iconSize} style={{...iconStyle, color: '#C13584'} } /> Instagram
            </a>
            <a href="https://pinterest.com/yourprofile" target="_blank" rel="noopener noreferrer" style={linkStyle}
               onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; e.currentTarget.style.color = '#E60023';}}
               onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#333';}}>
              <FaPinterest size={iconSize} style={{...iconStyle, color: '#E60023'} } /> Pinterest
            </a>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" style={linkStyle}
               onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; e.currentTarget.style.color = '#25D366';}}
               onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#333';}}>
              <FaWhatsapp size={iconSize} style={{...iconStyle, color: '#25D366'} } /> WhatsApp
            </a>
            <a href="tel:+1234567890" style={linkStyle}
               onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; e.currentTarget.style.color = '#1DA1F2';}}
               onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#333';}}>
              <FaPhone size={iconSize} style={{...iconStyle, color: '#1DA1F2'} } /> +123 456 7890
            </a>
            <a href="mailto:user@example.com" style={linkStyle}
               onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f0f0f0'; e.currentTarget.style.color = '#D44638';}}
               onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#333';}}>
              <FaEnvelope size={iconSize} style={{...iconStyle, color: '#D44638'} } /> user@example.com
            </a>
          </div>
        </section>
      </main>

      <footer style={{ textAlign: 'center', marginTop: '4rem', paddingTop: '1rem', borderTop: '1px solid #ddd', fontSize: '0.9rem', color: '#777' }}>
        <p>&copy; {new Date().getFullYear()} My Portfolio. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AboutPage;
