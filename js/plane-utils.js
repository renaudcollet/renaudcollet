// uResolution is the size the plane is drawn at, uSize the image natural size, both feed uvCover() in planes.frag.
// The drawn size is read on the plane html element rather than on its <img>: once the plane is bound
// to another element (cover transition), its <img> is detached and only reports its natural size.
// A plane can also draw a video (loop bloc), whose natural size is videoWidth / videoHeight.
export const updatePlaneRatio = (plane) => {
  const element = plane.htmlElement
  const image = plane.images[0]
  const video = plane.videos[0]
  plane.uniforms.resolution.value = [element.offsetWidth, element.offsetHeight]
  plane.uniforms.size.value = image
    ? [image.naturalWidth, image.naturalHeight]
    : video
      ? [video.videoWidth, video.videoHeight]
      : [0, 0]
}
