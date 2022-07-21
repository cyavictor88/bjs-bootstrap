import {  Mesh } from "@babylonjs/core/Meshes";
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import * as lodash from 'lodash';
import {TBbox} from '../mathtext';

function getBbox(verts: number[]):TBbox{
    let res :TBbox={
        maxx : Number.MIN_SAFE_INTEGER,
        maxy : Number.MIN_SAFE_INTEGER,
        minx : Number.MAX_SAFE_INTEGER,
        miny : Number.MAX_SAFE_INTEGER,
    };

    for (let j = 0; j < verts.length; j += 3) {
        if (verts[j] > res.maxx) res.maxx = verts[j];
        if (verts[j] < res.minx) res.minx = verts[j];
        if (verts[j + 1] > res.maxy) res.maxy = verts[j + 1];
        if (verts[j + 1] < res.miny) res.miny = verts[j + 1];
    }

    return res;
};
function resetX(verts:number[], bbox:TBbox)
{
    // for (let j = 0; j < verts.length; j += 3) {
    //     verts[j]-=bbox.minx;
    //     // verts[j+1]-=bbox.miny;
    // }

    

}
function resetY(verts:number[], bbox:TBbox)
{
    for (let j = 0; j < verts.length; j += 3) {
        //verts[j]-=bbox.minx;
        verts[j+1]-=bbox.miny;
    }

}
function setDashMaxX(maxX:number,verts:number[],bbox:TBbox)
{
    for (let j = 0; j < verts.length; j += 3) {
        if(verts[j]==bbox.maxx)verts[j]+=maxX;
    }

}
function setNumMinX(offset:number,verts:number[])
{
    for (let j = 0; j < verts.length; j += 3) {
        verts[j]+=offset;
    }
}

function setNumMinY(offset:number,verts:number[])
{
    for (let j = 0; j < verts.length; j += 3) {
        verts[j+1]+=offset;
    }
}

export function frac(startX: number, nvs: number[],dvs:number[], dashvs:number[])
{

    let bboxnvs = getBbox(nvs);
    let bboxdvs = getBbox(dvs);
    let bboxdashvs = getBbox(dashvs);
    resetX(nvs,bboxnvs);
    resetX(dvs,bboxdvs);
    // resetY(nvs,bboxnvs);
    // resetY(dvs,bboxdvs);
    resetX(dashvs,bboxdashvs);
    bboxnvs = getBbox(nvs);
    bboxdvs = getBbox(dvs);
    bboxdashvs = getBbox(dashvs);
    var compoundBbox : TBbox = {
        maxx : Math.max(bboxdvs.maxx,bboxnvs.maxx),
        maxy : Math.max(bboxdvs.maxy,bboxnvs.maxy),
        minx : Math.min(bboxdvs.minx,bboxnvs.minx),
        miny : Math.min(bboxdvs.miny,bboxnvs.miny),
    };
    console.log(compoundBbox);

    setDashMaxX(compoundBbox.maxx,dashvs,bboxdashvs);
    bboxdashvs = getBbox(dashvs);

    var compoundBbox : TBbox = {
        maxx : Math.max(bboxdvs.maxx,bboxnvs.maxx,bboxdashvs.maxx),
        maxy : Math.max(bboxdvs.maxy,bboxnvs.maxy,bboxdashvs.maxy),
        minx : Math.min(bboxdvs.minx,bboxnvs.minx,bboxdashvs.minx),
        miny : Math.min(bboxdvs.miny,bboxnvs.miny,bboxdashvs.miny),
    };

    var offset= (compoundBbox.maxx-compoundBbox.minx) - (bboxnvs.maxx-bboxnvs.minx) 
    setNumMinX(offset/2,nvs);
    var offset= (compoundBbox.maxx-compoundBbox.minx) - (bboxdvs.maxx-bboxdvs.minx) 
    setNumMinX(offset/2,dvs);

    var offset= (bboxnvs.maxy-bboxnvs.miny)/2+bboxdashvs.maxy;//(bboxdashvs.maxy-bboxdashvs.miny) ;//+bboxdashvs.maxy
    var offset= (-bboxnvs.miny)+bboxdashvs.maxy+0.05;//(bboxdashvs.maxy-bboxdashvs.miny) ;//+bboxdashvs.maxy
    setNumMinY(offset,nvs);
    var offset= (bboxdvs.maxy-bboxdvs.miny)/2+bboxdashvs.miny;//(bboxdashvs.maxy-bboxdashvs.miny) ;//+bboxdashvs.maxy
    var offset= bboxdvs.maxy-bboxdashvs.miny+0.05;//(bboxdashvs.maxy-bboxdashvs.miny) ;//+bboxdashvs.maxy

   // var offset= -(bboxdashvs.maxy-bboxdashvs.miny) ;//+bboxdashvs.miny
    setNumMinY(-offset,dvs);

    setNumMinX(startX,nvs);
    setNumMinX(startX,dvs);
    setNumMinX(startX,dashvs);


    






    





}