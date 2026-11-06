import { Texture } from "curtainsjs";

/**
 * curtainsjs 8.1.6 bug: Texture._updateTexParameters() binds the texture only when its index is not 0,
 * and every plane of the site has a single texture (index 0). Called from Texture.copy(), it sets the
 * wrapping, the filters and generates the mipmaps on whatever texture happens to be bound.
 *
 * A copy happens whenever a plane loads an image already loaded by another plane (curtains texture
 * cache): back on the home page, every project item copies the texture of its previous plane. An
 * original texture only gets its filters and mipmaps on its first draw, so the texture of an item
 * that was never on screen has none: with the default mipmap min filter, WebGL samples it as black.
 * Its copy was supposed to set them, on the wrong texture: the item stayed a black frame.
 *
 * Binding the texture first makes the copy complete the shared texture.
 */
const updateTexParameters = Texture.prototype._updateTexParameters;

if (!updateTexParameters.__bindFirst) {
  Texture.prototype._updateTexParameters = function () {
    if (this.gl && this._sampler && this._sampler.texture) {
      // A texture copied before it is added to its plane has no index yet: bind it on the current unit
      if (Number.isInteger(this.index) && this.renderer.state.activeTexture !== this.index) {
        this.gl.activeTexture(this.gl.TEXTURE0 + this.index);
        this.renderer.state.activeTexture = this.index;
      }
      this.gl.bindTexture(this.gl.TEXTURE_2D, this._sampler.texture);
    }
    return updateTexParameters.call(this);
  };
  Texture.prototype._updateTexParameters.__bindFirst = true;
}
