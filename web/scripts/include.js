async function incluir(seletor, arquivo) {
    const alvo = document.querySelector(seletor);
    const resposta = await fetch(arquivo);
    alvo.innerHTML = await resposta.text();
}

incluir("#headerPlaceholder", "./pages/header.html");
incluir("#footerPlaceholder", "./pages/footer.html");