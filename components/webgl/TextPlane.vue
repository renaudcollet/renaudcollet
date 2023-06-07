<template>
    <div>
        <Plane class="plane" :params="planeProps"  @render="onRender" @ready="onReady">
            <canvas ref="planeCanvas" data-sampler="uTexture"></canvas>
        </Plane>
        <div ref="textContent">
            <slot/>
        </div>
    </div>

</template>

<script>
    import { Plane } from "vue-curtains";
    import { ref } from 'vue'
    import { fragmentShader, vertexShader } from "~/shaders/planes";

    export default{
        components: {
            Plane,
        },
        props: {
            onRender: {
                type: Function,
                required: true,
            },
            endLine: {
                type: Boolean,
                required: false,
                default: false,
            },
        },
        setup(props){
            const textContent = ref(null);
            const planeCanvas = ref(null)
            const planeProps = {
                vertexShader,
                fragmentShader,
                widthSegments: 10,
                heightSegments: 10,
                // drawCheckMargins: {
                //     top: 100,
                //     right: 100,
                //     bottom: 100,
                //     left: 100,
                // },
                uniforms: {
                    planeDeformation: {
                    name: "uPlaneDeformation",
                    type: "1f",
                    value: 0,
                    },
                    zPos: {
                    name: "uZPos",
                    type: "1f",
                    value: 0.,
                    },
                    scale: {
                        name: "uScale",
                        type: "1f",
                        value: 1,
                    },
                    hovered: {
                        name: "uHovered",
                        type: "1f",
                        value: 0,
                    },
                    isText: {
                        name: "isText",
                        type: "1f",
                        value: 1,
                    }
                },
            };

            const drawText = () => {
                let endLine = {...props}.endLine
                let scaleFactor = 2
                document.fonts.ready.then(function () {
                    let c = textContent.value.children[0]
                    //get c bounding rect
                    let r = c.getBoundingClientRect()
                    const contentStyle = window.getComputedStyle(c);
                    let h = parseFloat(contentStyle.lineHeight.replace("px", "")) 
                    
                    const contentWidth = r.width
                    const contentHeight = r.height

                    planeCanvas.value.width = contentWidth
                    planeCanvas.value.height = contentHeight + 10
                    planeCanvas.value.style.width = contentWidth
                    planeCanvas.value.style.height = contentHeight + 10

                    const context = planeCanvas.value.getContext("2d");
                    // context.save()
                    context.width = contentWidth * scaleFactor;
                    context.height = contentHeight * scaleFactor;
                    
                    context.fillStyle = contentStyle.color;
                    let fontSize = (parseFloat(contentStyle.fontSize.replace("px", ""))) + "px"
                    context.font = contentStyle.fontWeight + " " + fontSize + " " + contentStyle.fontFamily;
                    context.fontStyle = contentStyle.fontStyle;
                    context.textAlign = contentStyle.textAlign;
                    context.letterSpacing = contentStyle.letterSpacing
                    var line = '';
                    let y = 0
                    let lines = c.innerHTML.split('<br>')
                    for(let i = 0; i < lines.length; i++){
                        y += h
                        context.fillText(lines[i], context.textAlign == 'right' ? contentWidth : 0, y);
                    }
                    if(endLine){
                        context.moveTo(context.measureText(lines[lines.length-1]).width + 10, y)
                        context.lineTo(context.measureText(lines[lines.length-1]).width + 50, y)
                        context.strokeStyle = 'white'
                        context.lineWidth = 3
                        context.stroke()
                    }
                    textContent.value.style.opacity = 0                    

                    
                });
            }
            
            onMounted(() => {
                
                drawText()
                
            })

            const onReady = (plane) => {
                window.addEventListener('resize', (e) => {onResize(plane)})
                setTimeout(() =>{
                    plane.resize()
                    if(plane.textures.length > 0) {
                    plane.textures[0].resize();
                    plane.textures[0].needUpdate();
                    }
                },300)
            }
            let timeout = false
            const onResize = (plane) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    drawText()
                    plane.resize()
                        if(plane.textures.length > 0) {
                        plane.textures[0].resize();
                        plane.textures[0].needUpdate();
                    }
                }, 100);
            }

            return{
                textContent,
                planeProps,
                planeCanvas,
                onResize,
                onReady,
                drawText
            }
        },
        
        
    }
</script>

<style scoped>
.plane{
    position: absolute;
}
canvas {
  opacity: 0;
  transform: translateY(0px);
}

#textContent{
    width: fit-content;
    height: fit-content;
    display: block;
    line-height: 50px;
    white-space: nowrap;

    font-weight: 900;
    font-size: 29px;
}

#textContent > *{
    margin: 0;
}

/* canvas{
    width: 100%;
    height: 100%;
} */
</style>