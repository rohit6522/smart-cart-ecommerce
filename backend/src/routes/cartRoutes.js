const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { authenticate } = require("../middleware/auth");

function formatCartResponse(cart) {
  const items = cart.items || [];
  const cartTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalBudget = cart.totalBudget || 0;
  const currentSpent = cartTotal;
  const remainingBudget = totalBudget > 0 ? totalBudget - currentSpent : 0;
  const overBudget = totalBudget > 0 && currentSpent > totalBudget;
  const percentageUsed = totalBudget > 0 ? Math.min(Math.round((currentSpent / totalBudget) * 100), 100) : 0;

  return {
    cartId: cart.cartId || 1,
    items,
    cartTotal,
    totalBudget,
    currentSpent,
    remainingBudget,
    overBudget,
    percentageUsed,
  };
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    const lastCart = await Cart.findOne().sort({ cartId: -1 });
    const nextCartId = (lastCart && lastCart.cartId ? lastCart.cartId : 0) + 1;
    cart = await Cart.create({
      cartId: nextCartId,
      userId,
      totalBudget: 0,
      items: [],
    });
  }
  return cart;
}

// GET /api/user/cart
router.get("/", authenticate, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.userId);
    res.json({ success: true, message: "Cart loaded", data: formatCartResponse(cart) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/user/cart/add
router.post("/add", authenticate, async (req, res) => {
  try {
    const { productId, quantity = 1, variantId } = req.body;
    const product = await Product.findOne({ id: Number(productId) });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const cart = await getOrCreateCart(req.user.userId);
    const price = product.discountedPrice || product.price;
    let variantLabel = null;

    if (variantId && product.variants && product.variants.length > 0) {
      const variant = product.variants.find((v) => Number(v.id) === Number(variantId));
      if (variant) {
        variantLabel = `${variant.variantType}: ${variant.variantValue}`;
      }
    }

    const existingIndex = cart.items.findIndex(
      (item) =>
        Number(item.productId) === Number(productId) &&
        (item.variantLabel || null) === (variantLabel || null)
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
      cart.items[existingIndex].subtotal =
        cart.items[existingIndex].quantity * cart.items[existingIndex].priceAtAdd;
    } else {
      const nextItemId =
        cart.items.length > 0 ? Math.max(...cart.items.map((i) => i.id || 0)) + 1 : 1;
      cart.items.push({
        id: nextItemId,
        productId: Number(productId),
        productName: product.name,
        imageUrl: product.imageUrl,
        priceAtAdd: price,
        quantity: Number(quantity),
        subtotal: price * Number(quantity),
        variantLabel,
      });
    }

    await cart.save();
    res.json({ success: true, message: "Added to cart", data: formatCartResponse(cart) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/user/cart/item/:cartItemId
router.put("/item/:cartItemId", authenticate, async (req, res) => {
  try {
    const cartItemId = Number(req.params.cartItemId);
    const quantity = Number(req.body.quantity);
    const cart = await getOrCreateCart(req.user.userId);

    const itemIndex = cart.items.findIndex((i) => Number(i.id) === cartItemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Cart item not found" });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].subtotal = quantity * cart.items[itemIndex].priceAtAdd;
    }

    await cart.save();
    res.json({ success: true, message: "Cart updated", data: formatCartResponse(cart) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/user/cart/item/:cartItemId
router.delete("/item/:cartItemId", authenticate, async (req, res) => {
  try {
    const cartItemId = Number(req.params.cartItemId);
    const cart = await getOrCreateCart(req.user.userId);

    cart.items = cart.items.filter((i) => Number(i.id) !== cartItemId);
    await cart.save();
    res.json({ success: true, message: "Item removed", data: formatCartResponse(cart) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/user/cart/budget
router.post("/budget", authenticate, async (req, res) => {
  try {
    const totalBudget = Number(req.body.totalBudget || 0);
    const cart = await getOrCreateCart(req.user.userId);
    cart.totalBudget = totalBudget;
    await cart.save();
    res.json({ success: true, message: "Budget updated", data: formatCartResponse(cart) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
