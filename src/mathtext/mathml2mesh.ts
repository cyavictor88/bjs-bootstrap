import * as BABYLON from "@babylonjs/core";
import { BoundingBox, Material, Matrix, Mesh, Scene, Vector3, Vector4 } from "@babylonjs/core";
import { Color3 } from "@babylonjs/core/Maths";

import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import * as lodash from 'lodash';


// var cjson = require('../ubuntu-r.json');
var cjson = require('./assets/julia-r.json');

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


export class MathMlStringMesh {
    public mString: string;
    public jsonMeshes: TMeshJson[];
    mat: Material;
    parentMesh: Mesh;
    scene: Scene;
    masklayer: number;
    stringBoundingBox: { x0: number, x1: number, y0: number, y1: number };
    scale:number;
    // dashMesh: TMeshJson[];

    constructor(mString: string, scene: Scene, masklayer: number, box: { x0: number, x1: number, y0: number, y1: number },scale:number) {
        this.scale=scale;
        this.stringBoundingBox = box;
        this.scene = scene;
        this.masklayer = masklayer;
        this.parentMesh = new BABYLON.Mesh("parent_" + mString, scene);
        let fontmaterial = new StandardMaterial("font_" + mString, scene);
        fontmaterial.backFaceCulling = false;
        fontmaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);
        this.mat = fontmaterial;
        this.mString = mString;
        this.jsonMeshes = [];

        for (let i = 0; i < mString.length; i++) {

            if (mString[i].charCodeAt(0).toString(16).padStart(4, "0")=="2061")continue;
            if (mString[i] === " " ) {
                continue;
                let key = "USPACE";
                let xlen=0.6;
                let ylen=1.2;
                let ystart=-0.3;
                let xstart=0;
                let newmesh: TMeshJson = {
                    char: mString[i],
                    uni: key,
                    verts: [xstart, ystart, 0, xstart, ystart + ylen, 0, xstart+xlen, ystart + ylen, 0, xstart+xlen, ystart, 0],
                    tris: [0, 1, 2, 3, 0, 2],
                    bbox: [0, 0, 0, 0]
                };
                this.jsonMeshes.push(newmesh);
            }
            else {

                let key = "U+" + mString[i].charCodeAt(0).toString(16).padStart(4, "0");
                let newmesh: TMeshJson = {
                    char: mString[i],
                    uni: key,
                    verts: lodash.cloneDeep(cjson[key].verts),
                    tris: cjson[key].tris,
                    bbox: [0, 0, 0, 0]
                };
                this.jsonMeshes.push(newmesh);
            }

        }

        let xoffset = 0;
        for (let i = 0; i < this.jsonMeshes.length; i++) {
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
            xoffset = maxx;
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

    public getSpatialTransArr(posArray: number[], trans: { x: number, y: number, z: number }, scale: { x: number, y: number, z: number }): number[] {
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



    public toTransedMesh() {

        let trans = { x: this.stringBoundingBox.x0, y: this.stringBoundingBox.y0 , z: 5 };
        // var scale = { x: (this.stringBoundingBox.x1 - this.stringBoundingBox.x0), y: (this.stringBoundingBox.y1 - this.stringBoundingBox.y0), z: 1 };
        var scale = { x: this.scale, y: this.scale, z: this.scale };
        for (let i = 0; i < this.jsonMeshes.length; i++) {
            let customMesh = new BABYLON.Mesh("custom" + this.jsonMeshes[i].char, this.scene);
            customMesh.layerMask = this.masklayer;
            let vertexData = new BABYLON.VertexData();

            let newTransedPos = this.getSpatialTransArr(this.jsonMeshes[i].verts, trans, scale);


            vertexData.positions = newTransedPos;
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






    }


    public drawSquare(): void {

        return
        let customMesh = new BABYLON.Mesh("abox", this.scene);
        customMesh.layerMask = this.masklayer;
        var positions = [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0];
        var indices = [0, 1, 2, 3, 0, 2];

        let trans = { x: 0, y: -0.3, z: 0 };
        let scale = { x: 0.6, y: 1.2, z: 1 };
        var transedPoses = this.getSpatialTransArr(positions, trans, scale);



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





export * as MathText from './mathml2mesh';
