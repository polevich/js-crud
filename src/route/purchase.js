// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

class Product {
  static #list = []
  static #count = 0

  constructor(img, title, description, category, price, amount = 0) {
    this.id = ++Product.#count
    this.img = img
    this.title = title
    this.description = description
    this.category = category
    this.price = price
    this.amount = amount
  }

  static add = (...data) => {
    const newProduct = new Product(...data)
    this.#list.push(newProduct)
  }

  static getList = () => {
    return this.#list
  }

  static getById = (id) => {
    return this.#list.find((product) => product.id === id)
  }

  static getRandomList = (id) => {
    const filteredList = this.#list.filter((product) => product.id !== id)
    const shuffledList = filteredList.sort(() => Math.random() - 0.5)
    return shuffledList.slice(0, 3)
  }
}

Product.add(
  'https://picsum.photos/200/300',
  `Компьютер Artline Gaming (X43v31) AMD Ryzen 5 3600`,
  `AMD Ryzen 5 3600 (3.6 - 4.2 ГГц) / RAM 16 ГБ / HDD 1 ТБ + SSD 480 ГБ / nVidia GeForce RTX 3050, 8ГБ / без ОД / LAN / без ОС`,
  [
    { id: 1, text: 'Готовый к отправке' },
    { id: 2, text: 'Топ продаж' },
  ],
  27000,
  10,
)

Product.add(
  'https://picsum.photos/200/300',
  `Компьютер Proline Business (B112p19) Intel Core i5 9400F`,
  `Intel Core i5 9400F (2.9 - 4.1 ГГц) / RAM 8 ГБ / HDD 1 ТБ / Intel UHD Graphics 630 / DVD+/-RW / LAN / DOS`,
  [{ id: 2, text: 'Топ продаж' }],
  20000,
  10,
)

Product.add(
  'https://picsum.photos/200/300',
  `Компьютер Proline Workstation (W67p03) Intel Xeon E-2226G`,
  `Intel Xeon E-2226G (3.4 - 4.7 ГГц) / RAM 16 ГБ / SSD 512 ГБ / nVidia Quadro P620, 2ГБ / без ОД / LAN / без ОС`,
  [{ id: 1, text: 'Готовый к отправке' }],
  40000,
  10,
)

class Purchase {
  static DELIVERY_PRICE = 150
  static #BONUS_FACTOR = 0.1
  static #count = 0
  static #list = []
  static #bonusAccount = new Map()

  static getBonusBalance = (email) => {
    return Purchase.#bonusAccount.get(email) || 0
  }

  static calcBonusAmount = (value) => {
    return value * Purchase.#BONUS_FACTOR
  }

  static updateBonusBalance = (email, price, bonusUse = 0) => {
    const amount = this.calcBonusAmount(price)
    const currentBalance = Purchase.getBonusBalance(email)
    const updatedBalance = currentBalance + amount - bonusUse
    Purchase.#bonusAccount.set(email, updatedBalance)
    console.log(email, updatedBalance)
    return amount
  }

  constructor(data, product) {
    this.id = ++Purchase.#count
    this.firstname = data.firstname
    this.lastname = data.lastname
    this.phone = data.phone
    this.email = data.email
    this.comment = data.comment || null
    this.bonus = data.bonus || 0
    this.promocode = data.promocode || null
    this.totalPrice = data.totalPrice
    this.productPrice = data.productPrice
    this.deliveryPrice = data.deliveryPrice
    this.amount = data.amount
    this.product = product
  }

  static add = (...arg) => {
    const newPurchase = new Purchase(...arg)
    this.#list.push(newPurchase)
    return newPurchase
  }

  static getList = () => {
    return Purchase.#list.reverse().map((purchase) => ({
      id: purchase.id,
      product: purchase.product.title,
      totalPrice: purchase.totalPrice,
      bonus: Purchase.calcBonusAmount(purchase.totalPrice),
    }))
  }

  static getById = (id) => {
    return Purchase.#list.find((item) => item.id === id)
  }

  static updateById = (id, data) => {
    const purchase = Purchase.getById(id)
    if (purchase) {
      if (data.firstname) purchase.firstname = data.firstname
      if (data.lastname) purchase.lastname = data.lastname
      if (data.phone) purchase.phone = data.phone
      if (data.email) purchase.email = data.email
      return true
    } else {
      return false
    }
  }
}

class Promocode {
  static #list = []

  constructor(name, factor) {
    this.name = name
    this.factor = factor
  }

  static add = (name, factor) => {
    const newPromoCode = new Promocode(name, factor)
    Promocode.#list.push(newPromoCode)
    return newPromoCode
  }

  static getByName = (name) => {
    return this.#list.find((promo) => promo.name === name)
  }

  static calc = (promo, price) => {
    return price * promo.factor
  }
}

Promocode.add('SUMMER2023', 0.9)
Promocode.add('DISCOUNT50', 0.5)
Promocode.add('SALE25', 0.75)

// ================================================================

router.get('/purchase-index', function (req, res) {
  // res.render генерує нам HTML сторінку

  // ↙️ cюди вводимо назву файлу з сontainer
  res.render('purchase-index', {
    // вказуємо назву папки контейнера, в якій знаходяться наші стилі
    style: 'purchase-index',

    data: {
      list: Product.getList(),
    },
  })
  // ↑↑ сюди вводимо JSON дані
})

// ================================================================

router.get('/purchase-product', function (req, res) {
  // res.render генерує нам HTML сторінку
  const id = Number(req.query.id)
  // ↙️ cюди вводимо назву файлу з сontainer
  res.render('purchase-product', {
    // вказуємо назву папки контейнера, в якій знаходяться наші стилі
    style: 'purchase-product',

    data: {
      list: Product.getRandomList(id),
      product: Product.getById(id),
    },
  })
  // ↑↑ сюди вводимо JSON дані
})

// ================================================================

router.post('/purchase-create', function (req, res) {
  const id = Number(req.query.id)
  const amount = Number(req.body.amount)

  if (amount < 1) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message: 'Ошибка',
        info: 'Некорректное количество товара',
        link: `/purchase-product?id=${id}`,
      },
    })
  }

  const product = Product.getById(id)

  if (product.amount < 1) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message: 'Ошибка',
        info: 'Такого количества товара нет в наличии',
        link: `/purchase-product?id=${id}`,
      },
    })
  }

  console.log(product, amount)

  const productPrice = product.price * amount
  const totalPrice = productPrice + Purchase.DELIVERY_PRICE
  const bonus = Purchase.calcBonusAmount(totalPrice)

  // ↙️ cюди вводимо назву файлу з сontainer
  res.render('purchase-create', {
    // вказуємо назву папки контейнера, в якій знаходяться наші стилі
    style: 'purchase-create',

    data: {
      id: product.id,
      cart: [
        {
          text: `${product.title} (${amount} шт)`,
          price: productPrice,
        },
        {
          text: `Доставка`,
          price: Purchase.DELIVERY_PRICE,
        },
      ],
      totalPrice,
      productPrice,
      deliveryPrice: Purchase.DELIVERY_PRICE,
      amount,
      bonus,
    },
  })
  // ↑↑ сюди вводимо JSON дані
})

// ================================================================

router.post('/purchase-submit', function (req, res) {
  const id = Number(req.query.id)

  let {
    totalPrice,
    productPrice,
    deliveryPrice,
    amount,

    firstname,
    lastname,
    email,
    phone,
    comment,
    promocode,
    bonus,
  } = req.body

  const product = Product.getById(id)

  if (!product) {
    return res.render('alert', {
      style: 'alert',

      data: {
        message: 'Успешно',
        info: 'Товар не найден',
        link: `/purchase-list`,
      },
    })
  }

  if (product.amount < amount) {
    return res.render('alert', {
      style: 'alert',

      data: {
        message: 'Успешно',
        info: 'Товара нет в необходимом количестве',
        link: `/purchase-list`,
      },
    })
  }

  totalPrice = Number(totalPrice)
  productPrice = Number(productPrice)
  deliveryPrice = Number(deliveryPrice)
  amount = Number(amount)
  bonus = Number(bonus)

  if (isNaN(totalPrice) || isNaN(productPrice) || isNaN(deliveryPrice) || isNaN(amount) || isNaN(bonus)) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message: 'Ошибка',
        info: 'Неккоректные данные',
        link: `/purchase-list`,
      },
    })
  }

  if (!firstname || !lastname || !email || !phone) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message: `Заполните обязательные поля`,
        info: 'Неккоректные данные',
        link: `/purchase-list`,
      },
    })
  }

  if (bonus || bonus > 0) {
    const bonusAmount = Purchase.getBonusBalance(email)
    console.log(bonusAmount)
    if (bonus > bonusAmount) {
      bonus = bonusAmount
    }
    Purchase.updateBonusBalance(email, totalPrice, bonus)
    totalPrice -= bonus
  } else {
    Purchase.updateBonusBalance(email, totalPrice, 0)
  }

  if (promocode) {
    promocode = Promocode.getByName(promocode)
    if (promocode) {
      totalPrice = Promocode.calc(promocode, totalPrice)
    }
  }

  if (totalPrice < 0) totalPrice = 0

  const purchase = Purchase.add(
    {
      totalPrice,
      productPrice,
      deliveryPrice,
      amount,
      bonus,
      firstname,
      lastname,
      email,
      phone,
      promocode,
      comment,
    },
    product,
  )

  console.log(purchase)

  res.render('alert', {
    style: 'alert',
    data: {
      message: 'Успешно',
      info: 'Заказ создан',
      link: `/purchase-list`,
    },
  })
})

// ================================================================

router.get('/purchase-list', function (req, res) {
  const list = Purchase.getList()
  res.render('purchase-list', {
    style: 'purchase-list',
    data: {
      purchases: {
        list,
      },
    },
  })
})

// ================================================================

router.get('/purchase-info', function (req, res) {
  const id = Number(req.query.id)
  const purchase = Purchase.getById(id)

  if (!purchase) {
    return res.render('alert', {
      style: 'alert',
      data: {
        message: 'Ошибка',
        info: 'Покупка не найдена',
        link: '/purchase-list',
      },
    })
  }

  const bonus = Purchase.calcBonusAmount(purchase.totalPrice)

  res.render('purchase-info', {
    style: 'purchase-info',
    data: {
      id: purchase.id,
      firstname: purchase.firstname,
      lastname: purchase.lastname,
      phone: purchase.phone,
      email: purchase.email,
      delivery: purchase.delivery,
      product: purchase.product.title,
      productPrice: purchase.productPrice,
      deliveryPrice: purchase.deliveryPrice,
      totalPrice: purchase.totalPrice,
      promocode: purchase.promocode,
      comment: purchase.comment,
      bonus: bonus,
    },
  })
})

// ================================================================

router.get('/purchase-edit', function (req, res) {
  const id = Number(req.query.id)
  const purchase = Purchase.getById(id)

  if (!purchase) {
    res.render('alert', {
      style: 'alert',
      component: ['button', 'heading'],
      isError: true,
      title: 'Ошибка',
      info: 'Заказа с таким ID не найдено',
    })
  } else {
    res.render('purchase-edit', {
      style: 'purchase-edit',
      component: ['heading', 'divider', 'field', 'button'],
      title: 'Изменение данних заказа',
      data: {
        id: purchase.id,
        firstname: purchase.firstname,
        lastname: purchase.lastname,
        email: purchase.email,
        phone: purchase.phone,
      },
    })
  }
})

// ================================================================

router.post('/purchase-edit', function (req, res) {
  const id = Number(req.query.id)
  let { firstname, lastname, phone, email, delivery } = req.body
  const purchase = Purchase.getById(id)
  console.log(purchase)

  if (purchase) {
    const newPurchase = Purchase.updateById(id, {
      firstname,
      lastname,
      phone,
      email,
      delivery,
    })
    console.log(newPurchase)

    if (newPurchase) {
      res.render('alert', {
        style: 'alert',
        component: ['button', 'heading'],
        data: {
          link: '/purchase-list',
          title: 'Успешное выполнение действия',
          info: 'Товар успешно обновлен',
        },
      })
    } else {
      res.render('alert', {
        style: 'alert',
        component: ['button', 'heading'],
        data: {
          link: '/purchase-list',
          title: 'Ошибка',
          info: 'Не удалось обновить товар',
        },
      })
    }
  } else {
    res.render('alert', {
      style: 'alert',
      component: ['button', 'heading'],

      data: {
        link: '/purchase-list',
        title: 'Ошибка',
        info: 'Не удалось обновить товар',
      },
    })
  }
})

// ================================================================

// Підключаємо роутер до бек-енду
module.exports = router
