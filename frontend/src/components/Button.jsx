import React from 'react';
import './Button.css'; // Conexão com os estilos do botão

// Usamos as 'props' (propriedades) para deixar o botão dinâmico!
function Button({ texto, onClick, tipo = 'azul', submit = false }) {
  return (
    <button 
      type={submit ? "submit" : "button"} 
      className={`btn-oficina ${tipo}`} 
      onClick={onClick}
    >
      {texto}
    </button>
  );
}

export default Button;