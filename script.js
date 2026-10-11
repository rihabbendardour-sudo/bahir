// ====== 1. Configuration ======
const WHATSAPP = "212690634168";   // numéro au format international, sans + ni 0

// ====== 2. Les produits (modifie ici pour changer le catalogue) ======
const produits = [
  { id: 1, nom: "Gel nettoyant doux",   cat: "Nettoyants", prix: 95,  img: "images/gel-nettoyant.svg" },
  { id: 2, nom: "Sérum vitamine C",     cat: "Sérums",     prix: 180, img: "images/serum-vitc.svg" },
  { id: 3, nom: "Crème hydratante",     cat: "Crèmes",     prix: 140, img: "images/creme-hydratante.svg" },
  { id: 4, nom: "Écran solaire SPF 50", cat: "Solaire",    prix: 160, img: "images/ecran-solaire.svg" },
  { id: 5, nom: "Sérum acide hyaluronique", cat: "Sérums", prix: 170, img: "images/serum-hyaluronique.svg" },
  { id: 6, nom: "Eau micellaire",       cat: "Nettoyants", prix: 75,  img: "images/eau-micellaire.svg" },
  { id: 7, nom: "Crème contour des yeux", cat: "Crèmes",   prix: 130, img: "images/contour-yeux.svg" },
  { id: 8, nom: "Baume à lèvres",       cat: "Corps",      prix: 45,  img: "images/baume-levres.svg" }
];

// ====== 3. Panier (enregistré dans le navigateur) ======
let panier = [];
try { panier = JSON.parse(localStorage.getItem("bahir_panier") || "[]"); } catch (e) {}
let categorie = "Tous";

const $ = (id) => document.getElementById(id);

function sauver() {
  try { localStorage.setItem("bahir_panier", JSON.stringify(panier)); } catch (e) {}
}

// ====== 4. Affichage des produits ======
function afficherFiltres() {
  const cats = ["Tous", ...new Set(produits.map(p => p.cat))];
  $("filters").innerHTML = cats.map(c =>
    `<button class="${c === categorie ? "active" : ""}" data-cat="${c}">${c}</button>`
  ).join("");
}

function afficherProduits() {
  const liste = categorie === "Tous" ? produits : produits.filter(p => p.cat === categorie);
  $("grid").innerHTML = liste.map(p => `
    <article class="card">
      <div class="img" style="background-image:url('${p.img}')"></div>
      <div class="info">
        <small>${p.cat}</small>
        <h3>${p.nom}</h3>
        <span class="price">${p.prix} DH</span>
        <button data-add="${p.id}">Ajouter au panier</button>
      </div>
    </article>`).join("");
}

// ====== 5. Affichage du panier ======
function total() {
  return panier.reduce((somme, l) => somme + l.prix * l.qty, 0);
}

function afficherPanier() {
  $("cartCount").textContent = panier.reduce((s, l) => s + l.qty, 0);
  $("cartTotal").textContent = total() + " DH";

  if (panier.length === 0) {
    $("cartItems").innerHTML = `<p class="empty">Votre panier est vide. Ajoutez un produit pour commencer.</p>`;
  } else {
    $("cartItems").innerHTML = panier.map(l => `
      <div class="line">
        <div>
          <strong>${l.nom}</strong>
          <p>${l.prix} DH</p>
          <div class="qty">
            <button data-moins="${l.id}">−</button>
            <span>${l.qty}</span>
            <button data-plus="${l.id}">+</button>
          </div>
        </div>
        <strong>${l.prix * l.qty} DH</strong>
      </div>`).join("");
  }
  $("orderBtn").href = lienWhatsApp();
}

// ====== 6. Message WhatsApp ======
function messageCommande() {
  let msg = "Bonjour BAHIR, je voudrais commander :\n\n";
  panier.forEach(l => { msg += `• ${l.nom} x${l.qty} = ${l.prix * l.qty} DH\n`; });
  msg += `\nTotal : ${total()} DH\n\nMon nom et mon adresse de livraison :`;
  return msg;
}

function lienWhatsApp() {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(messageCommande())}`;
}

// ====== 7. Actions ======
function ajouter(id) {
  const ligne = panier.find(l => l.id === id);
  if (ligne) ligne.qty++;
  else {
    const p = produits.find(p => p.id === id);
    panier.push({ id: p.id, nom: p.nom, prix: p.prix, qty: 1 });
  }
  sauver(); afficherPanier(); ouvrirPanier();
}

function changerQty(id, delta) {
  const ligne = panier.find(l => l.id === id);
  ligne.qty += delta;
  if (ligne.qty <= 0) panier = panier.filter(l => l.id !== id);
  sauver(); afficherPanier();
}

function ouvrirPanier() { $("cart").classList.add("open"); $("overlay").classList.add("show"); }
function fermerPanier() { $("cart").classList.remove("open"); $("overlay").classList.remove("show"); }

// ====== 8. Écouteurs de clics ======
document.addEventListener("click", (e) => {
  const t = e.target;
  if (t.dataset.cat) { categorie = t.dataset.cat; afficherFiltres(); afficherProduits(); }
  if (t.dataset.add) ajouter(Number(t.dataset.add));
  if (t.dataset.plus) changerQty(Number(t.dataset.plus), 1);
  if (t.dataset.moins) changerQty(Number(t.dataset.moins), -1);
});

$("openCart").onclick = ouvrirPanier;
$("closeCart").onclick = fermerPanier;
$("overlay").onclick = fermerPanier;
$("clearBtn").onclick = () => { panier = []; sauver(); afficherPanier(); };

$("orderBtn").onclick = (e) => {
  if (panier.length === 0) { e.preventDefault(); alert("Ajoutez d'abord un produit au panier."); }
};

// Bouton Partager : ouvre le menu de partage du téléphone (WhatsApp, etc.)
$("shareBtn").onclick = async () => {
  if (panier.length === 0) return alert("Votre panier est vide.");
  const texte = messageCommande();
  if (navigator.share) {
    try { await navigator.share({ title: "Mon panier BAHIR", text: texte }); } catch (err) {}
  } else {
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, "_blank");
  }
};

// ====== 9. Démarrage ======
afficherFiltres();
afficherProduits();
afficherPanier();
