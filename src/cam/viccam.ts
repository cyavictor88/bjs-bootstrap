import * as BABYLON from "@babylonjs/core";


export function VicCam(camtype:string,name:string,scene:BABYLON.Scene,) {

    switch(camtype){

        case "free":{
            var camera=new BABYLON.UniversalCamera(name, new BABYLON.Vector3(0, 0, -10), scene);
            camera.setTarget(BABYLON.Vector3.Zero());
            return camera;
        }

        case "arc":{
            var arcamera: BABYLON.ArcRotateCamera = new BABYLON.ArcRotateCamera(name, 3*Math.PI / 2, Math.PI / 2, 5, BABYLON.Vector3.Zero(), scene);
            return arcamera;

    
        }
        default:{
            break;

        }

    }


}