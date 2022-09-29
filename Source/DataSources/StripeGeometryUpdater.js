import StripeGeometry from "../Core/StripeGeometry";
import ApproximateTerrainHeights from "../Core/ApproximateTerrainHeights.js";
import Cartesian3 from "../Core/Cartesian3.js";
import Check from "../Core/Check.js";
import Color from "../Core/Color.js";
import ColorGeometryInstanceAttribute from "../Core/ColorGeometryInstanceAttribute.js";
import defined from "../Core/defined.js";
import DeveloperError from "../Core/DeveloperError.js";
import DistanceDisplayConditionGeometryInstanceAttribute from "../Core/DistanceDisplayConditionGeometryInstanceAttribute.js";
import GeometryInstance from "../Core/GeometryInstance.js";
import Iso8601 from "../Core/Iso8601.js";
import OffsetGeometryInstanceAttribute from "../Core/OffsetGeometryInstanceAttribute.js";
import Rectangle from "../Core/Rectangle.js";
import ShowGeometryInstanceAttribute from "../Core/ShowGeometryInstanceAttribute.js";
import HeightReference from "../Scene/HeightReference.js";
import MaterialAppearance from "../Scene/MaterialAppearance.js";
import PerInstanceColorAppearance from "../Scene/PerInstanceColorAppearance.js";
import ColorMaterialProperty from "./ColorMaterialProperty.js";
import DynamicGeometryUpdater from "./DynamicGeometryUpdater.js";
import GeometryUpdater from "./GeometryUpdater.js";
import GroundGeometryUpdater from "./GroundGeometryUpdater.js";
import Property from "./Property.js";
const scratchColor = new Color();
const defaultOffset = Cartesian3.ZERO;
const offsetScratch = new Cartesian3();
const scratchRectangle = new Rectangle();
class StripeGeometryOptions {
  constructor(entity) {
    this.id = entity;
    this.vertexFormat = undefined;
    this.positions = undefined;
    this.width = undefined;
    this.cornerType = undefined;
    this.height = undefined;
    this.extrudedHeight = undefined;
    this.granularity = undefined;
    this.offsetAttribute = undefined;
  }
}
export default class StripeGeometryUpdater extends GroundGeometryUpdater {
  /**
   * A {@link GeometryUpdater} for stripes.
   * Clients do not normally create this class directly, but instead rely on {@link DataSourceDisplay}.
   * @alias StripeGeometryUpdater
   * @constructor
   *
   * @param {Entity} entity The entity containing the geometry to be visualized.
   * @param {Scene} scene The scene where visualization is taking place.
   */
  constructor(entity, scene) {
    super({
      entity: entity,
      scene: scene,
      geometryOptions: new StripeGeometryOptions(entity),
      geometryPropertyName: "stripe",
      observedPropertyNames: ["availability", "stripe"],
    });
    this._isHidden = (entity, stripe) => {
      return (
        !defined(stripe.positions) ||
        !defined(stripe.width) ||
        GeometryUpdater.prototype._isHidden.call(this, entity, stripe)
      );
    };
    super._onEntityPropertyChanged(entity, "stripe", entity.stripe, undefined);
  }
  /**
   * Creates the geometry instance which represents the fill of the geometry.
   *
   * @param {JulianDate} time The time to use when retrieving initial attribute values.
   * @returns {GeometryInstance} The geometry instance representing the filled portion of the geometry.
   *
   * @exception {DeveloperError} This instance does not represent a filled geometry.
   */
  createFillGeometryInstance(time) {
    //>>includeStart('debug', pragmas.debug);
    Check.defined("time", time);
    if (!this._fillEnabled) {
      throw new DeveloperError(
        "This instance does not represent a filled geometry."
      );
    }
    //>>includeEnd('debug');
    const entity = this._entity;
    const isAvailable = entity.isAvailable(time);
    const attributes = {
      show: new ShowGeometryInstanceAttribute(
        isAvailable &&
          entity.isShowing &&
          this._showProperty.getValue(time) &&
          this._fillProperty.getValue(time)
      ),
      distanceDisplayCondition: DistanceDisplayConditionGeometryInstanceAttribute.fromDistanceDisplayCondition(
        this._distanceDisplayConditionProperty.getValue(time)
      ),
      offset: undefined,
      color: undefined,
    };
    if (this._materialProperty instanceof ColorMaterialProperty) {
      let currentColor;
      if (
        defined(this._materialProperty.color) &&
        (this._materialProperty.color.isConstant || isAvailable)
      ) {
        currentColor = this._materialProperty.color.getValue(
          time,
          scratchColor
        );
      }
      if (!defined(currentColor)) {
        currentColor = Color.WHITE;
      }
      attributes.color = ColorGeometryInstanceAttribute.fromColor(currentColor);
    }
    if (defined(this._options.offsetAttribute)) {
      attributes.offset = OffsetGeometryInstanceAttribute.fromCartesian3(
        Property.getValueOrDefault(
          this._terrainOffsetProperty,
          time,
          defaultOffset,
          offsetScratch
        )
      );
    }
    return new GeometryInstance({
      id: entity,
      geometry: new StripeGeometry(this._options),
      attributes: attributes,
    });
  }
  /**
   * Creates the geometry instance which represents the outline of the geometry.
   *
   * @param {JulianDate} time The time to use when retrieving initial attribute values.
   * @returns {GeometryInstance} The geometry instance representing the outline portion of the geometry.
   *
   * @exception {DeveloperError} This instance does not represent an outlined geometry.
   */
  createOutlineGeometryInstance(time) {
    throw new Error("outline is an unsupported function");
    // //>>includeStart('debug', pragmas.debug);
    // Check.defined('time', time)
    // if (!this._outlineEnabled) {
    //   throw new DeveloperError(
    //     'This instance does not represent an outlined geometry.'
    //   )
    // }
    // //>>includeEnd('debug');
    // const entity = this._entity
    // const isAvailable = entity.isAvailable(time)
    // const outlineColor = Property.getValueOrDefault(
    //   this._outlineColorProperty,
    //   time,
    //   Color.BLACK,
    //   scratchColor
    // )
    // const attributes: {
    //   show: ShowGeometryInstanceAttribute
    //   color: ColorGeometryInstanceAttribute
    //   distanceDisplayCondition: DistanceDisplayConditionGeometryInstanceAttribute
    //   offset?: OffsetGeometryInstanceAttribute
    // } = {
    //   show: new ShowGeometryInstanceAttribute(
    //     isAvailable &&
    //       entity.isShowing &&
    //       this._showProperty.getValue(time) &&
    //       this._showOutlineProperty.getValue(time)
    //   ),
    //   color: ColorGeometryInstanceAttribute.fromColor(outlineColor),
    //   distanceDisplayCondition:
    //     DistanceDisplayConditionGeometryInstanceAttribute.fromDistanceDisplayCondition(
    //       this._distanceDisplayConditionProperty.getValue(time)
    //     ),
    //   offset: undefined,
    // }
    // if (defined(this._options.offsetAttribute)) {
    //   attributes.offset = OffsetGeometryInstanceAttribute.fromCartesian3(
    //     Property.getValueOrDefault(
    //       this._terrainOffsetProperty,
    //       time,
    //       defaultOffset,
    //       offsetScratch
    //     )
    //   )
    // }
    // return new GeometryInstance({
    //   id: entity,
    //   geometry: new StripeOutlineGeometry(this._options),
    //   attributes: attributes,
    // })
  }
  _computeCenter(time, result) {
    const positions = Property.getValueOrUndefined(
      this._entity.stripe.positions,
      time
    );
    if (!defined(positions) || positions.length === 0) {
      return;
    }
    return Cartesian3.clone(
      positions[Math.floor(positions.length / 2.0)],
      result
    );
  }
  _isDynamic(entity, stripe) {
    return (
      !stripe.positions.isConstant || //
      !Property.isConstant(stripe.height) || //
      !Property.isConstant(stripe.extrudedHeight) || //
      !Property.isConstant(stripe.granularity) || //
      !Property.isConstant(stripe.width) || //
      !Property.isConstant(stripe.outlineWidth) || //
      !Property.isConstant(stripe.cornerType) || //
      !Property.isConstant(stripe.zIndex) || //
      (this._onTerrain &&
        !Property.isConstant(this._materialProperty) &&
        !(this._materialProperty instanceof ColorMaterialProperty))
    );
  }
  _setStaticOptions(entity, stripe) {
    let heightValue = Property.getValueOrUndefined(
      stripe.height,
      Iso8601.MINIMUM_VALUE
    );
    const heightReferenceValue = Property.getValueOrDefault(
      stripe.heightReference,
      Iso8601.MINIMUM_VALUE,
      HeightReference.NONE
    );
    let extrudedHeightValue = Property.getValueOrUndefined(
      stripe.extrudedHeight,
      Iso8601.MINIMUM_VALUE
    );
    const extrudedHeightReferenceValue = Property.getValueOrDefault(
      stripe.extrudedHeightReference,
      Iso8601.MINIMUM_VALUE,
      HeightReference.NONE
    );
    if (defined(extrudedHeightValue) && !defined(heightValue)) {
      heightValue = 0;
    }
    const options = this._options;
    options.vertexFormat =
      this._materialProperty instanceof ColorMaterialProperty
        ? PerInstanceColorAppearance.VERTEX_FORMAT
        : MaterialAppearance.MaterialSupport.TEXTURED.vertexFormat;
    options.positions = stripe.positions.getValue(
      Iso8601.MINIMUM_VALUE,
      options.positions
    );
    options.width = stripe.width.getValue(Iso8601.MINIMUM_VALUE);
    options.granularity = Property.getValueOrUndefined(
      stripe.granularity,
      Iso8601.MINIMUM_VALUE
    );
    options.cornerType = Property.getValueOrUndefined(
      stripe.cornerType,
      Iso8601.MINIMUM_VALUE
    );
    options.offsetAttribute = GroundGeometryUpdater.computeGeometryOffsetAttribute(
      heightValue,
      heightReferenceValue,
      extrudedHeightValue,
      extrudedHeightReferenceValue
    );
    options.height = GroundGeometryUpdater.getGeometryHeight(
      heightValue,
      heightReferenceValue
    );
    extrudedHeightValue = GroundGeometryUpdater.getGeometryExtrudedHeight(
      extrudedHeightValue,
      extrudedHeightReferenceValue
    );
    if (extrudedHeightValue === GroundGeometryUpdater.CLAMP_TO_GROUND) {
      extrudedHeightValue = ApproximateTerrainHeights.getMinimumMaximumHeights(
        StripeGeometry.computeRectangle(options, scratchRectangle)
      ).minimumTerrainHeight;
    }
    options.extrudedHeight = extrudedHeightValue;
  }
}
// if (defined(Object.create)) {
//   StripeGeometryUpdater.prototype = Object.create(
//     GroundGeometryUpdater.prototype
//   )
//   StripeGeometryUpdater.prototype.constructor = StripeGeometryUpdater
// }
class DynamicStripeGeometryUpdater extends DynamicGeometryUpdater {
  constructor(geometryUpdater, primitives, groundPrimitives) {
    super(geometryUpdater, primitives, groundPrimitives);
    this._isHidden = (entity, stripe, time) => {
      const options = this._options;
      return (
        !defined(options.positions) ||
        !defined(options.width) ||
        super._isHidden.call(this, entity, stripe, time)
      );
    };
  }
  _setOptions(entity, stripe, time) {
    const options = this._options;
    let heightValue = Property.getValueOrUndefined(stripe.height, time);
    const heightReferenceValue = Property.getValueOrDefault(
      stripe.heightReference,
      time,
      HeightReference.NONE
    );
    let extrudedHeightValue = Property.getValueOrUndefined(
      stripe.extrudedHeight,
      time
    );
    const extrudedHeightReferenceValue = Property.getValueOrDefault(
      stripe.extrudedHeightReference,
      time,
      HeightReference.NONE
    );
    if (defined(extrudedHeightValue) && !defined(heightValue)) {
      heightValue = 0;
    }
    options.positions = Property.getValueOrUndefined(stripe.positions, time);
    options.width = Property.getValueOrUndefined(stripe.width, time);
    options.granularity = Property.getValueOrUndefined(
      stripe.granularity,
      time
    );
    options.cornerType = Property.getValueOrUndefined(stripe.cornerType, time);
    options.offsetAttribute = GroundGeometryUpdater.computeGeometryOffsetAttribute(
      heightValue,
      heightReferenceValue,
      extrudedHeightValue,
      extrudedHeightReferenceValue
    );
    options.height = GroundGeometryUpdater.getGeometryHeight(
      heightValue,
      heightReferenceValue
    );
    extrudedHeightValue = GroundGeometryUpdater.getGeometryExtrudedHeight(
      extrudedHeightValue,
      extrudedHeightReferenceValue
    );
    if (extrudedHeightValue === GroundGeometryUpdater.CLAMP_TO_GROUND) {
      extrudedHeightValue = ApproximateTerrainHeights.getMinimumMaximumHeights(
        StripeGeometry.computeRectangle(options, scratchRectangle)
      ).minimumTerrainHeight;
    }
    options.extrudedHeight = extrudedHeightValue;
  }
}
// if (defined(Object.create)) {
//   DynamicStripeGeometryUpdater.prototype = Object.create(
//     DynamicGeometryUpdater.prototype
//   )
//   DynamicStripeGeometryUpdater.prototype.constructor =
//     DynamicStripeGeometryUpdater
// }
StripeGeometryUpdater.DynamicGeometryUpdater = DynamicStripeGeometryUpdater;
