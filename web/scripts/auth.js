const form = document.querySelector('.formulario-login');

if (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    // Descobre em qual página o usuário está
    const isCadastro = window.location.pathname.includes('cadastro');

    if (isCadastro) {
      handleCadastro(email, senha);
    } else {
      handleLogin(email, senha);
    }
  });
}

function handleCadastro(email, senha) {
  if (!email || !senha) {
    alert('Preencha o e-mail e a senha!');
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  const emailExiste = usuarios.some(user => user.email === email);
  if (emailExiste) {
    alert('Esse e-mail já está cadastrado!');
    return;
  }

  usuarios.push({ email, senha });
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  alert('Cadastro realizado com sucesso!');
  window.location.href = '/web/pages/login.html';
}

function handleLogin(email, senha) {
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

  const usuarioValido = usuarios.find(
    user => user.email === email && user.senha === senha
  );

  if (usuarioValido) {
    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioValido));
    alert('Login realizado com sucesso!');
    window.location.href = '/web/index.html'; // Ajuste aqui se sua home tiver outro nome/caminho
  } else {
    alert('E-mail ou senha incorretos.');
  }
}