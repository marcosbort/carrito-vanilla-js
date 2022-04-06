const cards = document.getElementById("cards")
const items = document.getElementById("items")
const footer = document.getElementById("footer")
const templateCard = document.getElementById("template-card").content
const templateFooter = document.getElementById("template-footer").content
const templateCarrito = document.getElementById("template-carrito").content
const fragment = document.createDocumentFragment()
let carrito = {}

// Eventos  -------------------------------------------------------------------------
// El evento DOMContentLoaded se dispara cuando el documento HTML ha sido completamente cargado y parseado
document.addEventListener("DOMContentLoaded", () => {

  fetchData()

  // levantamos el carrito del localStorage
  // si existe la key "carrito" en localStorage... (lo levantamos)
  if (localStorage.getItem("carrito")) {
    carrito = JSON.parse(localStorage.getItem("carrito"))
    printCarrito()
  }
})
cards.addEventListener("click", e => { addCarrito(e) })
items.addEventListener("click", e => { btnAddAndSubstract(e) })


// Traer productos  -----------------------------------------------------------------

const fetchData = async () => {

  try {
    const res = await fetch("api.json")
    const data = await res.json()
    printCards(data)
  } catch (error) {
    console.log(error)
  }
}


// Pintar productos  ----------------------------------------------------------------

const printCards = data => {

  data.forEach(product => {

    templateCard.querySelector(".template-card__title").textContent = product.title
    templateCard.querySelector(".template-card__price").textContent = product.precio

    // .setAttribute("name", value) establece el valor a un elemento (para la img)
    templateCard.querySelector(".template-card__img").setAttribute("src", product.thumbnailUrl)

    // .dataset (agregamos el id del producto en el btn "comprar")
    templateCard.querySelector(".template-card__btn-buy").dataset.id = product.id

    // (por cada iteración) clonamos el template y lo guardamos en fragment
    const clone = templateCard.cloneNode(true)
    fragment.appendChild(clone)
  })

  // finalizado el forEach, agregamos el fragment completo (con todas las iteraciones) 
  // en ".items" (para evitar el Reflow)
  cards.appendChild(fragment)
}


// Agregar al carrito (evento click)  -----------------------------------------------
// addCarrito() manda a setCarrito el <tag> padre del boton comprar (".template-card__body") 
// con el Título, Precio e Id del Producto.

const addCarrito = e => {

  // si el <tag> contiene ".template-card__btn-buy" (botón comprar) (true o false)
  if (e.target.classList.contains("template-card__btn-buy")) {
    // setCarrito(su <tag> padre) 🢂 ".template-card__body"
    setCarrito(e.target.parentElement)
  }

  e.stopPropagation()
}


// Manipular el objeto carrito  -----------------------------------------------------
// setCarrito() recibe ".template-card__body" (título, precio e id del producto)

const setCarrito = item => {

  const product = {
    id: item.querySelector(".template-card__btn-buy").dataset.id,
    title: item.querySelector(".template-card__title").textContent,
    price: item.querySelector(".template-card__price").textContent,
    units: 1
  }

  // si se repitiera la operación (evento click) con el mismo producto (id)
  if (carrito.hasOwnProperty(product.id)) {
    // sumamos 1 unidad en units
    product.units = carrito[product.id].units + 1
  }

  // empujamos product a carrito (creando un index en carrito)
  // Si no existe [product.id] lo va a crear, y si existe, lo va a sobreescribir
  carrito[product.id] = { ...product }

  printCarrito()
}


// Pintar Carrito  ------------------------------------------------------------------

const printCarrito = () => {

  // Inicia con el carrito limpio (cada ciclo pinta un nuevo clon del carrito acumulado)
  items.innerHTML = ""

  // Object.values() 🢂 devuelve un array (iterable) cuyos elementos son valores de propiedades enumarables que se encuentran en el objeto
  Object.values(carrito).forEach(product => {


    // este product no viene de json. Es el que empujamos con setCarrito()
    templateCarrito.querySelector(".template-carrito__id").textContent = product.id
    templateCarrito.querySelector(".template-carrito__title").textContent = product.title
    templateCarrito.querySelector(".template-carrito__units").textContent = product.units
    templateCarrito.querySelector(".template-carrito__price").textContent = product.price
    templateCarrito.querySelector(".template-carrito__multiply").textContent = product.units * product.price

    // agregamos el id a los botones
    templateCarrito.querySelector(".template-carrito__btn-add").dataset.id = product.id
    templateCarrito.querySelector(".template-carrito__btn-subtract").dataset.id = product.id

    // empujamos un clon al fragment
    const clone = templateCarrito.cloneNode(true)
    fragment.appendChild(clone)
  })

  items.appendChild(fragment)

  printFooter()

  // y además de pintar el carrito, lo guardamos en el localStorage
  localStorage.setItem("carrito", JSON.stringify(carrito))
}


// Pintar Footer  -------------------------------------------------------------------

const printFooter = () => {

  footer.innerHTML = ""

  // Si nuestro carrito está vacío, entra en este if:
  // Object.keys() 🢂 devuelve un array (enumerable) cuyos elementos son strings correspondientes a las propiedades enumerables que se encuentran directamente en el object
  if (Object.keys(carrito).length === 0) {
    return footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
        `
    // al ser una sóla línea innerHTML no es necesario un fragment
  }

  // si el carrito tiene al menos un producto: Pinta el footer con el total de unidades y precios

  // Object.values() 🢂 devuelve un array (iterable) cuyos elementos son valores de propiedades enumarables que se encuentran en el objeto
  const nUnits = Object.values(carrito).reduce((acumulador, { units }) => acumulador + units, 0)
  const nPrice = Object.values(carrito).reduce((accumulador, { units, price }) => accumulador + units * price, 0)

  templateFooter.querySelector(".template-footer__total-units").textContent = nUnits
  templateFooter.querySelector(".template-footer__total-price").textContent = nPrice

  const clone = templateFooter.cloneNode(true)
  fragment.appendChild(clone)

  footer.appendChild(fragment)

  // evento click: botón "vaciar todo"
  const btnEmpty = document.querySelector(".template-footer__btn-empty")
  btnEmpty.addEventListener("click", () => {
    carrito = {}
    printCarrito()
  })
}


// Botones: Agregar o Quitar producto  ----------------------------------------------

const btnAddAndSubstract = e => {

  // Acción de "+"
  if (e.target.classList.contains("template-carrito__btn-add")) {
    const product = carrito[e.target.dataset.id]
    product.units++
    carrito[e.target.dataset.id] = { ...product }

    printCarrito()
  }

  // Acción de "-"
  if (e.target.classList.contains("template-carrito__btn-subtract")) {
    const product = carrito[e.target.dataset.id]
    product.units--

    // si llega a 0 desaparece
    product.units === 0
      ? delete carrito[e.target.dataset.id]
      : carrito[e.target.dataset.id] = { ...product }

    printCarrito()
  }

  e.stopPropagation()
}