import Cart from "../model/cart.js";

// Add items to cart (same as before)
// export const addToCart = async (req, res) => {
//   try {
//     const { item, qty, price, category } = req.body;
//     const userId = req.user.userId;

//     let cart = await Cart.findOne({ user: userId });

//     if (!cart) {
//       // if no cart, create a new one with first item
//       cart = new Cart({
//         user: userId,
//         items: [{ item, category, qty, price }],
//         totalPrice: qty * price,
//       });
//     } else {
//       // check if item already exists
//       const existingItem = cart.items.find(
//         (i) => i.item === item && i.category === category
//       );

//       if (existingItem) {
//         // update qty
//         existingItem.qty += qty;
//       } else {
//         // push new item
//         cart.items.push({ item, category, qty, price });
//       }

//       // recalc total
//       cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
//     }

//     await cart.save();
//     res.json({ message: "Cart updated successfully", cart });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
export const addToCart = async (req, res) => {
  try {
    const { item, qty, price, category } = req.body;
    const userId = req.user.userId;

    // find an inactive cart
    let cart = await Cart.findOne({ user: userId, isActive: false });

    if (cart) {
      // if inactive cart exists → update this one
      const existingItem = cart.items.find(
        (i) => i.item === item && i.category === category
      );

      if (existingItem) {
        // update qty
        existingItem.qty += qty;
      } else {
        // push new item
        cart.items.push({ item, category, qty, price });
      }

      // recalc total
      cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    } else {
      // if no inactive cart → create a new one
      cart = new Cart({
        user: userId,
        items: [{ item, category, qty, price }],
        totalPrice: qty * price,
        isActive: false, // default inactive
      });
    }

    await cart.save();
    res.json({ message: "Cart updated successfully", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ user: userId, isActive: false });

    if (!cart) {
      return res.json({ items: [], totalPrice: 0 });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Cart.findOneAndDelete({ user: userId,isActive: false });
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId, qty } = req.body;

    const cart = await Cart.findOne({ user: userId ,isActive: false});
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const itemIndex = cart.items.findIndex((i) => i.item === itemId);
    if (itemIndex === -1)
      return res.status(404).json({ error: "Item not found in cart" });

    cart.items[itemIndex].qty = qty;
    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);

    await cart.save();
    res.json({ message: "Item quantity updated", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Remove a specific item from cart
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.body; 

    const cart = await Cart.findOne({ user: userId, isActive: false });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    // Filter by subdocument _id
    cart.items = cart.items.filter(
      (i) => i._id.toString() !== itemId.toString()
    );

    // Recalculate total
    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);

    await cart.save();
    res.json({ message: "Item removed from cart", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
