export interface Supporter {
  name: string;
  text: string;
  mainImage: string;
  bgImage: string;
  extraImage?: string;
}

/**
 * 📝 GUIA RÁPIDO PARA EDITAR APOIADORES:
 * 
 * 1. ADICIONAR: Copie um bloco { ... } e cole abaixo do último, mudando os dados.
 * 2. REMOVER: Apague o bloco { ... } do apoiador que deseja tirar.
 * 3. IMAGENS: 
 *    - Coloque as fotos em /public/media/supporters-main/ (1:1) e /public/media/supporters-extra/ (Livre)
 *    - Use o caminho: "/media/supporters-main/nome-da-foto.jpg"
 */

export const supporters: Supporter[] = [
  {
    name: "Fernando Sousa",
    text: "Eu criei o site graviprompt.vercel.app para gerar prompts inteligentes e facilitar sua vida!",
    mainImage: "/media/supporters-main/fsprincipal.png",
    bgImage: "https://picsum.photos/seed/bg1/1200/800",
    extraImage: "https://picsum.photos/seed/extra1/800/600"
  }
];
