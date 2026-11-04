const trilho = document.querySelector(".trilho");
const slides = document.querySelectorAll(".slide");
const btnEsquerda = document.querySelector(".seta.esquerda");
const btnDireita = document.querySelector(".seta.direita");

let indice = 0;

function mostrarSlide() {
    trilho.style.transform = `translateX(-${indice * 100}%)`;
}

btnDireita.addEventListener("click", () => {
    indice = (indice + 1) % slides.length;
    mostrarSlide();
});

btnEsquerda.addEventListener("click", () => {
    indice = (indice - 1 + slides.length) % slides.length;
    mostrarSlide();
});