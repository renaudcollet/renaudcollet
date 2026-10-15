// uResolution is the size the plane is drawn at, uSize the image natural size, both feed uvCover() in planes.frag.
// The drawn size is read on the plane html element rather than on its <img>: once the plane is bound
// to another element (cover transition), its <img> is detached and only reports its natural size.
export const updatePlaneRatio = (plane) => {
  const element = plane.htmlElement
  const image = plane.images[0]
  plane.uniforms.resolution.value = [element.offsetWidth, element.offsetHeight]
  plane.uniforms.size.value = [image.naturalWidth, image.naturalHeight]
}
