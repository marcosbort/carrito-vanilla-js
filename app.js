const cards = document.getElementById("cards")
const items = document.getElementById("items")
const footer = document.getElementById("footer")
const templateCard = document.getElementById("template-card").content
const templateFooter = document.getElementById("template-footer").content
const templateCarrito = document.getElementById("template-carrito").content
const fragment = document.createDocumentFragment()
let carrito = {}

// Eventos  -------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  fetchData()

  if (localStorage.getItem("carrito")) {
    carrito = JSON.parse(localStorage.getItem("carrito"))
    printCarrito()
  }
})
cards.addEventListener("click", (e) => {
  addCarrito(e)
})
items.addEventListener("click", (e) => {
  btnAddAndSubstract(e)
})

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

const printCards = (data) => {
  data.forEach((product) => {
    templateCard.querySelector(".template-card__title").textContent = product.title
    templateCard.querySelector(".template-card__price").textContent = product.precio
    templateCard
      .querySelector(".template-card__img")
      .setAttribute("src", product.thumbnailUrl)
    templateCard.querySelector(".template-card__btn-buy").dataset.id = product.id

    const clone = templateCard.cloneNode(true)
    fragment.appendChild(clone)
  })

  cards.appendChild(fragment)
}

// Agregar al carrito (evento click)  -----------------------------------------------

const addCarrito = (e) => {
  if (e.target.classList.contains("template-card__btn-buy")) {
    setCarrito(e.target.parentElement)
  }
  e.stopPropagation()
}

// Manipular el objeto carrito  -----------------------------------------------------

const setCarrito = (item) => {
  const product = {
    id: item.querySelector(".template-card__btn-buy").dataset.id,
    title: item.querySelector(".template-card__title").textContent,
    price: item.querySelector(".template-card__price").textContent,
    units: 1,
  }

  if (carrito.hasOwnProperty(product.id)) {
    product.units = carrito[product.id].units + 1
  }

  carrito[product.id] = { ...product }

  printCarrito()
}

// Pintar Carrito  ------------------------------------------------------------------

const printCarrito = () => {
  items.innerHTML = ""

  Object.values(carrito).forEach((product) => {
    templateCarrito.querySelector(".template-carrito__id").textContent = product.id
    templateCarrito.querySelector(".template-carrito__title").textContent = product.title
    templateCarrito.querySelector(".template-carrito__units").textContent = product.units
    templateCarrito.querySelector(".template-carrito__price").textContent = product.price
    templateCarrito.querySelector(".template-carrito__multiply").textContent = product.units * product.price
    templateCarrito.querySelector(".template-carrito__btn-add").dataset.id = product.id
    templateCarrito.querySelector(".template-carrito__btn-subtract").dataset.id = product.id

    const clone = templateCarrito.cloneNode(true)
    fragment.appendChild(clone)
  })

  items.appendChild(fragment)

  printFooter()

  localStorage.setItem("carrito", JSON.stringify(carrito))
}

// Pintar Footer  -------------------------------------------------------------------

const printFooter = () => {
  footer.innerHTML = ""

  if (Object.keys(carrito).length === 0) {
    return (footer.innerHTML = `
      <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
    `)
  }

  const nUnits = Object.values(carrito).reduce(
    (acumulador, { units }) => acumulador + units, 0
  )
  const nPrice = Object.values(carrito).reduce(
    (accumulador, { units, price }) => accumulador + units * price, 0
  )

  templateFooter.querySelector(".template-footer__total-units").textContent = nUnits
  templateFooter.querySelector(".template-footer__total-price").textContent = nPrice

  const clone = templateFooter.cloneNode(true)
  fragment.appendChild(clone)

  footer.appendChild(fragment)

  const btnEmpty = document.querySelector(".template-footer__btn-empty")
  btnEmpty.addEventListener("click", () => {
    carrito = {}
    printCarrito()
  })
}

// Botones: Agregar o Quitar producto  ----------------------------------------------

const btnAddAndSubstract = (e) => {
  if (e.target.classList.contains("template-carrito__btn-add")) {
    const product = carrito[e.target.dataset.id]
    product.units++
    carrito[e.target.dataset.id] = { ...product }

    printCarrito()
  }

  if (e.target.classList.contains("template-carrito__btn-subtract")) {
    const product = carrito[e.target.dataset.id]
    product.units--

    product.units === 0
      ? delete carrito[e.target.dataset.id]
      : (carrito[e.target.dataset.id] = { ...product })

    printCarrito()
  }

  e.stopPropagation()
}
