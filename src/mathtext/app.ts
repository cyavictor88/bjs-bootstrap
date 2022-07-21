// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";
// import "@babylonjs/loaders/glTF";

import {Engine} from "@babylonjs/core/Engines";
import { Scene } from "@babylonjs/core/scene";
import { UniversalCamera,Camera } from "@babylonjs/core/Cameras";
import {  Mesh, MeshBuilder, } from "@babylonjs/core/Meshes";
import {  HemisphericLight } from "@babylonjs/core/Lights";
import {Vector3,Color3   } from "@babylonjs/core/Maths";
// import { Color3,Engine, Scene, Camera,ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, UniversalCamera,MultiMaterial } from "@babylonjs/core";
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { MathChar, MathString } from "./mathtext";
//import {tryjison} from "./tryjison";
import {trykatex} from "./trykatex";
import {showAxis} from "../geo/axis";

class App {

    public mat: StandardMaterial;
    public sphere: Mesh;
    constructor() {
        var mathml=trykatex(" \\{ e \\in E \\} = f(x) \\leq \\begin{cases} \\textrm{true,} & \\textrm{if } 0 < x < 5 \\\\ \\textrm{false,} & \\textrm{otherwise} \\end{cases} = \
        \\lim_{x\\to\\infty} sin(\\theta) \\vert_{-5}^{x17} \\rightarrow \
        \\sum_{n=1}^{\\infty} 2^{-n} = \\sqrt{ e^x} = a^5_m\
     \\begin{bmatrix} 1_{xy} & 2_x & 3 \\\\ a & b & c \\end{bmatrix}  = \
       \\int_{a}^{b} f(x)dx =z+\\frac{\\vec{a^z}}{b^{sc}}*2 ");

        //  var mathml=trykatex("2x + a =c^{iz \\pi} ");
        var mathdiv = document.createElement("div");
        mathdiv.innerHTML=mathml;
        
        // tryjison();

        // create the canvas html element and attach it to the webpage
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "gameCanvas";
        document.body.appendChild(canvas);
        document.body.appendChild(mathdiv);

        var engine = new Engine(canvas, true);
        var scene = new Scene(engine);
        this.mat=new StandardMaterial("vicm", scene);
        this.mat.alpha = 1;
        this.mat.diffuseColor = new Color3(1.0, 0.2, 0.7);
        this.mat.backFaceCulling = false;


        // var camera: ArcRotateCamera = new ArcRotateCamera("Camera", 3*Math.PI / 2, Math.PI / 2, 5, Vector3.Zero(), scene);
        // camera.attachControl(canvas, true);

        var camera=new UniversalCamera("camera",new Vector3(0, 0, -10), scene);
            camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);

        showAxis(scene,3);



        if (scene.activeCameras!.length === 0){
            scene.activeCameras!.push(scene.activeCamera!);
        }




        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        for (var i = scene.lights.length - 1; i >= 0; i--) {
            scene.lights[i].excludeWithLayerMask = 0x30000000;
        }
        // camera.layerMask=0x20000000;
        this.sphere = MeshBuilder.CreateSphere("sphere", { diameter: 0.5 }, scene);
        this.sphere.position=new Vector3(-1, 1, 0);
        this.sphere.material=this.mat;

        // var secondCamera = new  ArcRotateCamera("Camera2", 3*Math.PI / 2, Math.PI / 2, 5, Vector3.Zero(), scene);      
        var secondCamera=new UniversalCamera("camera",new Vector3(0, 0, -10), scene);
        secondCamera.setTarget(new Vector3(1,0,0));        
        var cameraZoom =12;
        secondCamera.mode = Camera.ORTHOGRAPHIC_CAMERA;
        secondCamera.orthoTop = cameraZoom / 2 ;
        secondCamera.orthoBottom = -cameraZoom / 2;
        secondCamera.orthoLeft = -cameraZoom ;
        secondCamera.orthoRight = cameraZoom ;
		secondCamera.layerMask = 0x30000000;
		scene.activeCameras!.push(secondCamera);
        // var light2 = new HemisphericLight("light2", new Vector3(1, 1, 0), scene);
        // light2.includeOnlyWithLayerMask = 0x20000000;


        let mathtxts = new MathString("∑∫πacatmeow--jklqr",scene,secondCamera.layerMask );
        mathtxts.toMesh(this.mat);




        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            // if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
            //     if (scene.debugLayer.isVisible()) {
            //         scene.debugLayer.hide();
            //     } else {
            //         scene.debugLayer.show();
            //     }
            // }
        });



        // run the main render loop
        engine.runRenderLoop(() => {
            scene.render();
        });
    }
}
new App();