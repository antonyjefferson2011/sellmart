// =====================================================================
// CONFIGURAÇÃO FIREBASE — PREENCHA AQUI
// Console Firebase > Configurações do projeto > Seus apps > App da Web.
// Estes valores identificam o projeto e NÃO são segredos: quem protege
// os dados são o Authentication e as regras do Firestore (firestore.rules).
// Nunca coloque aqui chaves privadas / contas de serviço.
// =====================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyBzqQmGpMz-7AYM7_Mpt2owpmf6BXjW1yk",
  authDomain: "nucisz.firebaseapp.com",
  databaseURL: "https://nucisz-default-rtdb.firebaseio.com",
  projectId: "nucisz",
  storageBucket: "nucisz.firebasestorage.app",
  messagingSenderId: "90824519141",
  appId: "1:90824519141:web:8ec5d6686c07cbbf94930c",
  measurementId: "G-BZ4S7Q3NM2"
};

// =====================================================================
// CONFIGURAÇÃO IMGBB — PREENCHA AQUI
// Chave em https://api.imgbb.com/ (usada só pelo painel.html).
// ATENÇÃO: por estar em JavaScript público, ela PODE ser vista por quem
// abrir o código da página. Não é um segredo protegido. Se for abusada,
// gere uma nova chave no ImgBB e substitua aqui.
// =====================================================================
export const imgbbApiKey = "86427cccd2a94fb42a0754ffd7f19e79";

// =====================================================================
// MARCA E CONTATO (opcional) — campos vazios não aparecem no rodapé
// =====================================================================
export const SITE = {
  email: "",          // ex.: "contato@seudominio.com"
  whatsapp: "",       // somente números com DDI, ex.: "5511999999999"
  privacidade: "",    // URL da política de privacidade
  termos: "",         // URL dos termos de uso
  reembolso: "",      // URL da política de reembolso
};

export const CATEGORIAS = ["Beleza", "Culinária", "Renda Extra", "Marketing", "E-books"];

export const configurado = () =>
  ![firebaseConfig.apiKey, firebaseConfig.projectId, firebaseConfig.appId].some(
    (v) => !v || v.startsWith("COLE_")
  );
