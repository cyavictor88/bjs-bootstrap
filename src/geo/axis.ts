import { DynamicTexture, Mesh, Color3, Vector3, Scene, int, Material, MeshBuilder } from "@babylonjs/core";
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';


export var showAxis = function(scene: Scene,size: int) {
    var makeTextPlane = function(text, color, size) {
        var dynamicTexture = new DynamicTexture("DynamicTexture", 50, scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color , "transparent", true);
        var plane = plane = MeshBuilder.CreatePlane("plane", {height:size, width: size, sideOrientation: Mesh.DOUBLESIDE});
        var mat = new StandardMaterial("TextPlaneMaterial", scene);
        mat.specularColor= new Color3(0, 0, 0);
        mat.diffuseTexture = dynamicTexture;
        mat.backFaceCulling = false;
        plane.material = mat;
        return plane;
     };


     const axisXoptions = {
        points: [ 
            Vector3.Zero(), new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0), 
           new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
       ], //vec3 array,
        updatable: true
    }
    var axisX = MeshBuilder.CreateLines("axisX",axisXoptions , scene);
    axisX.color = new Color3(1, 0, 0);
    var xChar = makeTextPlane("X", "red", size / 10);
    xChar.position = new Vector3(0.9 * size, -0.05 * size, 0);

    const axisYoptions = {
        points: [
            Vector3.Zero(), new Vector3(0, size, 0), new Vector3( -0.05 * size, size * 0.95, 0), 
           new Vector3(0, size, 0), new Vector3( 0.05 * size, size * 0.95, 0)
       ], //vec3 array,
        updatable: true
    }
    var axisY = MeshBuilder.CreateLines("axisY", axisYoptions, scene);
    axisY.color = new Color3(0, 1, 0);
    var yChar = makeTextPlane("Y", "green", size / 10);
    yChar.position = new Vector3(0, 0.9 * size, -0.05 * size);
    const axisZoptions = {
        points: [
            Vector3.Zero(), new Vector3(0, 0, size), new Vector3( 0 , -0.05 * size, size * 0.95),
           new Vector3(0, 0, size), new Vector3( 0, 0.05 * size, size * 0.95)
       ], //vec3 array,
        updatable: true
    }
    var axisZ = MeshBuilder.CreateLines("axisZ", axisZoptions, scene);
    axisZ.color = new Color3(0, 0, 1);
    var zChar = makeTextPlane("Z", "blue", size / 10);
    zChar.position = new Vector3(0, 0.05 * size, 0.9 * size);
    return;
};