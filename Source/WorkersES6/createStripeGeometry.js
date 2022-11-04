import StripeGeometry from "../Core/StripeGeometry";
import defined from "../Core/defined.js";
import Ellipsoid from "../Core/Ellipsoid.js";

function createStripeGeometry(stripeGeometry, offset) {
  if (defined(offset)) {
    stripeGeometry = StripeGeometry.unpack(stripeGeometry, offset);
  }

  stripeGeometry._ellipsoid = Ellipsoid.clone(stripeGeometry._ellipsoid);
  return StripeGeometry.createGeometry(stripeGeometry);
}

export default createStripeGeometry;
