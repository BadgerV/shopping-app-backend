function calculatePriceWithDiscount(
  originalProductPrice,
  productDiscount,
  shippingCost
) {
  // Calculate the discounted price
  const discountedPrice =
    originalProductPrice - originalProductPrice * (productDiscount / 100);

  // Calculate the total price including shipping (excluding tax)
  const totalPrice = discountedPrice + shippingCost;

  return totalPrice;
}

function calculatePriceWithoutDiscount(originalProductPrice, shippingCost) {
  //calculate total price
  const totalPrice = originalProductPrice + shippingCost;
  return totalPrice;
}



module.exports = { calculatePriceWithDiscount, calculatePriceWithoutDiscount };
