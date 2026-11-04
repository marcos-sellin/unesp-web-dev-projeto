const loginForm = document.getElementById('formulario-login');

loginForm.addEventListener('submit', function (event) {
  // Impede que a página recarregue ao enviar o formulário
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('senha').value;

  // 4. Aqui você faz o que quiser com os dados (chama a sua função)
  handleLogin(email, password);
});


function handleLogin(email, senha) {
  console.log('E-mail capturado:', email);
  console.log('Senha capturada:', senha);
}

