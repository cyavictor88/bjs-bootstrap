import * as BABYLON from "@babylonjs/core";
import { BoundingBox, Material, Matrix, Mesh, Scene, Vector3, Vector4 } from "@babylonjs/core";
import {  Color3 } from "@babylonjs/core/Maths";

import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import * as lodash from 'lodash';


// var cjson = require('../ubuntu-r.json');
var cjson = require('./assets/julia-r.json');

import { frac } from './mathtextUtil/frac';







type TMeshJson = {
    char: string;
    uni: string;
    verts: number[];
    tris: number[];
    bbox: [number, number, number, number];

};

export type TBbox = {
    minx: number;
    maxx: number;
    miny: number;
    maxy: number;
}

let dashkey = "U+" + "-".charCodeAt(0).toString(16).padStart(4, "0");
let dash: TMeshJson = {
    char: dashkey,
    uni: dashkey,
    verts: lodash.cloneDeep(cjson[dashkey].verts),
    tris: cjson[dashkey].tris,
    bbox: [0, 0, 0, 0]
};


export class MathString {
    public mString: string;
    public jsonMeshes: TMeshJson[];
    mat: Material;
    parentMesh: Mesh;
    scene: Scene;
    masklayer: number;
    // dashMesh: TMeshJson[];

    constructor(mString: string, scene: Scene, masklayer: number) {


        this.scene = scene;
        this.masklayer = masklayer;
        this.parentMesh = new BABYLON.Mesh("parent_" + mString, scene);
        // this.parentMesh.layerMask= 0x20000000;
        // this.parentMesh.setParent(camera);
        let fontmaterial = new StandardMaterial("font_" + mString, scene);
        // fontmaterial.alpha = 0.5;
        // fontmaterial.diffuseColor = new BABYLON.Color3(1.0, 1, 1);
        fontmaterial.backFaceCulling = false;
        fontmaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);
        this.mat = fontmaterial;
        this.mString = mString;
        this.jsonMeshes = [];

        for (let i = 0; i < mString.length; i++) {
            let key = "U+" + mString[i].charCodeAt(0).toString(16).padStart(4, "0")
            let newmesh: TMeshJson = {
                char: mString[i],
                uni: key,
                verts: lodash.cloneDeep(cjson[key].verts),
                tris: cjson[key].tris,
                bbox: [0, 0, 0, 0]
            };
            this.jsonMeshes.push(newmesh);
        }




        this.jsonMeshes.push(dash);
        // let dbbox = this.getBbox(dash.verts);
        // this.extendX(dash.verts,dbbox);





        let xoffset = 0;
        for (let i = 0; i < this.jsonMeshes.length-3 ; i++) {
            let maxx = Number.MIN_SAFE_INTEGER;
            let maxy = Number.MIN_SAFE_INTEGER;
            let minx = Number.MAX_SAFE_INTEGER;
            let miny = Number.MAX_SAFE_INTEGER;
            let verts = this.jsonMeshes[i].verts;
            for (let j = 0; j < verts.length; j += 3) {
                verts[j] += xoffset;
                if (verts[j] > maxx) maxx = verts[j];
                if (verts[j] < minx) minx = verts[j];
                if (verts[j + 1] > maxy) maxy = verts[j + 1];
                if (verts[j + 1] < miny) miny = verts[j + 1];
            }
            this.jsonMeshes[i].bbox = [minx, maxx, miny, maxy];
            xoffset = maxx + 0.05;
        }

        frac(xoffset,
            this.jsonMeshes[this.jsonMeshes.length - 3].verts,
            this.jsonMeshes[this.jsonMeshes.length - 2].verts,
            this.jsonMeshes[this.jsonMeshes.length - 1].verts);




    };

    public extendX(verts: number[], bbox: TBbox) {
        for (let j = 0; j < verts.length; j += 3) {
            if (verts[j] == bbox.maxx) verts[j] *= 4;
        }
    };

    public getBbox(verts: number[]): TBbox {
        let maxx = Number.MIN_SAFE_INTEGER;
        let maxy = Number.MIN_SAFE_INTEGER;
        let minx = Number.MAX_SAFE_INTEGER;
        let miny = Number.MAX_SAFE_INTEGER;
        for (let j = 0; j < verts.length; j += 3) {
            if (verts[j] > maxx) maxx = verts[j];
            if (verts[j] < minx) minx = verts[j];
            if (verts[j + 1] > maxy) maxy = verts[j + 1];
            if (verts[j + 1] < miny) miny = verts[j + 1];
        }
        let res: TBbox = {
            minx: minx,
            maxx: maxx,
            miny: miny,
            maxy: maxy,
        };
        return res;
    };

    public toMesh(strmat: BABYLON.Material): void {
        for (let i = 0; i < this.jsonMeshes.length; i++) {
            let customMesh = new BABYLON.Mesh("custom" + this.jsonMeshes[i].char, this.scene);
            customMesh.layerMask = this.masklayer;
            let vertexData = new BABYLON.VertexData();
            vertexData.positions = this.jsonMeshes[i].verts;
            vertexData.indices = this.jsonMeshes[i].tris;
            vertexData.applyToMesh(customMesh);
            customMesh.material = this.mat;

            this.parentMesh.addChild(customMesh);
            continue;
            let boxmesh = new BABYLON.Mesh("boxmesh" + this.jsonMeshes[i].char, this.scene);
            boxmesh.layerMask = this.masklayer;
            var VertexData2 = new BABYLON.VertexData();
            var max = customMesh.getBoundingInfo().boundingBox.maximum;
            var min = customMesh.getBoundingInfo().boundingBox.minimum;
            VertexData2.positions = [min._x, min._y, 0, min._x, max._y, 0, max._x, max._y, 0, max._x, min._y, 0];
            VertexData2.indices = [0, 1, 2, 2, 3, 0];
            VertexData2.applyToMesh(boxmesh);
            boxmesh.material = this.mat;
            this.parentMesh.addChild(boxmesh);


        };





    };



    public getSpatialTransArr(posArray:number[], trans:{x:number,y:number,z:number},scale:{x:number,y:number,z:number}):number[]{
        let mat = Matrix.Identity();
        mat.setRowFromFloats(0, scale.x, 0, 0, trans.x);
        mat.setRowFromFloats(1, 0, scale.y, 0, trans.y);
        mat.setRowFromFloats(2, 0, 0, scale.z, trans.z);
        var transedPoses = [];
        for (let i = 0; i < posArray.length; i += 3) {
            let tmpmat = new Matrix();
            tmpmat.setRow(0, new Vector4(posArray[i], posArray[i + 1], posArray[i + 2], 1));
            tmpmat = tmpmat.transpose();
            tmpmat = mat.multiply(tmpmat);
            for (let j = 0; j < 3; j++)
                transedPoses.push(tmpmat.getRow(j).asArray()[0]);
        }
        return transedPoses;
    }



    public toTransedMesh(newxs:{x0:number,x1:number}, newys:{y0:number,y1:number} )
    {
        let trans = {x:newxs.x0, y:newys.y0 -0.3 , z:0};
        let scale = {x:(newxs.x1-newxs.x0)*0.6, y:(newys.y1-newys.y0)*1.2  , z:1};
            for (let i = 0; i < this.jsonMeshes.length; i++) {
                let customMesh = new BABYLON.Mesh("custom" + this.jsonMeshes[i].char, this.scene);
                customMesh.layerMask = this.masklayer;
                let vertexData = new BABYLON.VertexData();

                let newTransedPos = this.getSpatialTransArr(this.jsonMeshes[i].verts,trans,scale);


                vertexData.positions = newTransedPos;
                vertexData.indices = this.jsonMeshes[i].tris;
                vertexData.applyToMesh(customMesh);
                customMesh.material = this.mat;
    
                this.parentMesh.addChild(customMesh);

    
    
            };
    
    
    
    
    
    
    }

  
    public drawSquare(): void {


        let customMesh = new BABYLON.Mesh("abox", this.scene);
        customMesh.layerMask = this.masklayer;
        var positions = [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0];
        var indices = [0, 1, 2, 3, 0, 2];
        
        let trans={x:0,y:-0.3,z:0};
        let scale={x:0.6,y:1.2,z:1};
        var transedPoses = this.getSpatialTransArr(positions,trans,scale);



        var vertexData = new BABYLON.VertexData();
        vertexData.positions = transedPoses;
        vertexData.indices = indices;

        vertexData.applyToMesh(customMesh);


        let dummyMat = new StandardMaterial("vics", this.scene);

        // dummyMat.backFaceCulling = false;
        // dummyMat.emissiveColor = new BABYLON.Color3(0, 1, 0);
        dummyMat.alpha = 0.7;
        dummyMat.diffuseColor = new Color3(1, 1, 1);
        dummyMat.backFaceCulling = false;
        customMesh.material = dummyMat;

    };
};

export class MathChar {
    public char: string;
    public jsonEntry: string;




    constructor(char: string) {
        this.char = char;
        this.jsonEntry = "U+" + this.char.charCodeAt(0).toString(16).padStart(4, "0")
    }

    public toMesh(scene: BABYLON.Scene, mat: BABYLON.Material): void {
        let customMesh = new BABYLON.Mesh("custom", scene);

        var positions = cjson[this.jsonEntry].verts;
        var indices = cjson[this.jsonEntry].tris;

        //Create a vertexData object
        var vertexData = new BABYLON.VertexData();

        //Assign positions and indices to vertexData
        vertexData.positions = positions;
        vertexData.indices = indices;


        vertexData.applyToMesh(customMesh);
        customMesh.material = mat;



        let boxmesh = new BABYLON.Mesh("boxmesh", scene);
        var VertexData2 = new BABYLON.VertexData();
        let ins = [0, 1, 2, 2, 3, 0];
        var max = customMesh.getBoundingInfo().boundingBox.maximum;
        var min = customMesh.getBoundingInfo().boundingBox.minimum;
        VertexData2.positions = [min._x, min._y, 0, min._x, max._y, 0, max._x, max._y, 0, max._x, min._y, 0];
        VertexData2.indices = ins;
        VertexData2.applyToMesh(boxmesh);
        var fontmaterial = new StandardMaterial("vicb", scene);
        fontmaterial.alpha = 0.5;
        fontmaterial.diffuseColor = new BABYLON.Color3(1.0, 1, 1);
        boxmesh.material = fontmaterial;
        boxmesh.material.backFaceCulling = false;



    };



};



export * as MathText from './mathtext';
